# Error Handling Guide

Comprehensive error handling patterns for the TBO Holidays TypeScript SDK. This guide covers all types of errors you might encounter and how to handle them properly.

## 🚦 Error Types

### API Errors
- **401** - Invalid credentials or expired session
- **500** - Server errors or unexpected issues
- **201** - No results (e.g., "No Available rooms")

### Network Errors
- Connection timeouts
- DNS resolution failures  
- Network connectivity issues

### Validation Errors
- Invalid date formats
- Missing required parameters
- Invalid hotel codes

## 🔧 Error Handling Patterns

### Basic Try-Catch

```typescript
import TBOHolidaysSDK from "tbo-hotel-sdk";

const sdk = new TBOHolidaysSDK();

async function basicErrorHandling() {
  try {
    const response = await sdk.utilities.getCountryList();
    
    // Check API status
    if (response.Status.Code === 200) {
      console.log('✅ Success');
      return response;
    } else {
      console.log(`❌ API Error: ${response.Status.Description}`);
      return null;
    }
    
  } catch (error) {
    console.error('🚫 Network Error:', error.message);
    return null;
  }
}
```

### Comprehensive Error Handler

```typescript
interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: {
    type: 'api' | 'network' | 'validation';
    code?: number;
    message: string;
    details?: any;
  };
}

async function handleApiCall<T>(
  apiCall: () => Promise<any>
): Promise<ApiResult<T>> {
  try {
    const response = await apiCall();
    
    // Handle API response codes
    switch (response.Status.Code) {
      case 200:
        return {
          success: true,
          data: response
        };
        
      case 201:
        return {
          success: false,
          error: {
            type: 'api',
            code: 201,
            message: 'No results found',
            details: response.Status.Description
          }
        };
        
      case 401:
        return {
          success: false,
          error: {
            type: 'api',
            code: 401,
            message: 'Authentication failed',
            details: 'Check your API credentials'
          }
        };
        
      case 500:
        return {
          success: false,
          error: {
            type: 'api',
            code: 500,
            message: 'Server error',
            details: response.Status.Description
          }
        };
        
      default:
        return {
          success: false,
          error: {
            type: 'api',
            code: response.Status.Code,
            message: response.Status.Description,
            details: response
          }
        };
    }
    
  } catch (error) {
    // Handle network/connection errors
    if (error.code === 'ENOTFOUND') {
      return {
        success: false,
        error: {
          type: 'network',
          message: 'DNS resolution failed - check API URL',
          details: error.message
        }
      };
    }
    
    if (error.code === 'ECONNREFUSED') {
      return {
        success: false,
        error: {
          type: 'network',
          message: 'Connection refused - API server may be down',
          details: error.message
        }
      };
    }
    
    if (error.code === 'ETIMEDOUT') {
      return {
        success: false,
        error: {
          type: 'network',
          message: 'Request timeout - try again later',
          details: error.message
        }
      };
    }
    
    return {
      success: false,
      error: {
        type: 'network',
        message: 'Unexpected error',
        details: error.message
      }
    };
  }
}

// Usage example
async function safeCountryList() {
  const result = await handleApiCall(
    () => sdk.utilities.getCountryList()
  );
  
  if (result.success) {
    console.log('✅ Countries loaded successfully');
    const countries = sdk.utilities.extractCountries(result.data);
    return countries;
  } else {
    console.error(`❌ Failed to load countries: ${result.error.message}`);
    
    // Handle specific error types
    switch (result.error.type) {
      case 'api':
        if (result.error.code === 401) {
          console.log('🔑 Please check your API credentials');
        }
        break;
        
      case 'network':
        console.log('🌐 Please check your internet connection');
        break;
    }
    
    return [];
  }
}
```

## 🔄 Retry Logic

### Simple Retry

```typescript
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      console.log(`Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt < maxRetries) {
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }
  
  throw lastError;
}

// Usage
async function resilientSearch() {
  try {
    const response = await withRetry(
      () => sdk.search.searchSingleRoom(...),
      3, // max 3 retries
      1000 // start with 1 second delay
    );
    
    return response;
  } catch (error) {
    console.error('🚫 Search failed after all retries:', error.message);
    return null;
  }
}
```

### Smart Retry with Conditions

```typescript
async function smartRetry<T>(
  operation: () => Promise<any>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    retryCondition?: (error: any) => boolean;
  } = {}
): Promise<T> {
  const { 
    maxRetries = 3, 
    initialDelay = 1000,
    retryCondition = (error) => {
      // Don't retry on authentication errors
      if (error.response?.status === 401) return false;
      // Don't retry on validation errors  
      if (error.response?.status === 400) return false;
      // Retry on network errors and server errors
      return true;
    }
  } = options;
  
  let delay = initialDelay;
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await operation();
      
      // Check if response indicates retryable error
      if (response.Status?.Code === 500) {
        throw new Error(`Server error: ${response.Status.Description}`);
      }
      
      return response;
      
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries || !retryCondition(error)) {
        break;
      }
      
      console.log(`⚠️ Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 1.5; // Exponential backoff
    }
  }
  
  throw lastError;
}
```

## 🏨 Booking Flow Error Handling

### Complete Error Handling for Booking

```typescript
interface BookingError {
  step: 'search' | 'prebook' | 'validation' | 'network';
  code?: number;
  message: string;
  recoverable: boolean;
  suggestions: string[];
}

async function robustBookingFlow(searchParams: any): Promise<{
  success: boolean;
  data?: any;
  error?: BookingError;
}> {
  const sdk = new TBOHolidaysSDK();
  
  try {
    // Step 1: Search with error handling
    console.log('🔍 Searching hotels...');
    const searchResponse = await smartRetry(
      () => sdk.search.searchSingleRoom(...searchParams)
    );
    
    if (searchResponse.Status.Code === 201) {
      return {
        success: false,
        error: {
          step: 'search',
          code: 201,
          message: 'No hotels available for your criteria',
          recoverable: true,
          suggestions: [
            'Try different dates',
            'Search in nearby cities',
            'Adjust guest count',
            'Try different hotel codes'
          ]
        }
      };
    }
    
    if (searchResponse.Status.Code !== 200) {
      return {
        success: false,
        error: {
          step: 'search',
          code: searchResponse.Status.Code,
          message: searchResponse.Status.Description,
          recoverable: false,
          suggestions: ['Contact support if this persists']
        }
      };
    }
    
    // Step 2: Extract booking codes
    const bookingCodes = sdk.search.extractBookingCodes(searchResponse);
    if (bookingCodes.length === 0) {
      return {
        success: false,
        error: {
          step: 'search',
          message: 'No booking codes available',
          recoverable: true,
          suggestions: ['Search again with different criteria']
        }
      };
    }
    
    // Step 3: PreBook with error handling
    console.log('🔒 PreBooking...');
    const preBookResponse = await smartRetry(
      () => sdk.preBook.preBookHotel(bookingCodes[0], "Limit"),
      {
        maxRetries: 2, // Fewer retries for PreBook
        retryCondition: (error) => {
          // Don't retry if booking code expired
          if (error.message?.includes('expired')) return false;
          return true;
        }
      }
    );
    
    if (preBookResponse.Status.Code !== 200) {
      return {
        success: false,
        error: {
          step: 'prebook',
          code: preBookResponse.Status.Code,
          message: preBookResponse.Status.Description,
          recoverable: true,
          suggestions: [
            'Search again for fresh booking codes',
            'Try a different room option',
            'Contact hotel directly'
          ]
        }
      };
    }
    
    // Step 4: Validate PreBook response
    const validation = sdk.preBook.validatePreBookResponse(preBookResponse);
    if (!validation.isValid) {
      return {
        success: false,
        error: {
          step: 'validation',
          message: `Validation failed: ${validation.errors.join(', ')}`,
          recoverable: false,
          suggestions: ['Contact support with booking details']
        }
      };
    }
    
    // Success
    const bookingInfo = sdk.preBook.extractPreBookInfo(preBookResponse);
    return {
      success: true,
      data: {
        searchSummary: sdk.search.getSearchSummary(searchResponse),
        bookingInfo,
        bookingCode: bookingCodes[0]
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: {
        step: 'network',
        message: error.message,
        recoverable: true,
        suggestions: [
          'Check internet connection',
          'Verify API credentials',
          'Try again in a few minutes'
        ]
      }
    };
  }
}

// Usage with comprehensive error handling
async function handleBooking(searchParams: any) {
  const result = await robustBookingFlow(searchParams);
  
  if (result.success) {
    console.log('✅ Booking successful!');
    console.log('Hotel:', result.data.bookingInfo.hotelName);
    console.log('Price:', result.data.bookingInfo.totalFare, result.data.bookingInfo.currency);
    
    // Proceed with payment
    return result.data;
    
  } else {
    const error = result.error;
    console.error(`❌ Booking failed at ${error.step}: ${error.message}`);
    
    if (error.recoverable) {
      console.log('💡 Suggestions:');
      error.suggestions.forEach(suggestion => {
        console.log(`   • ${suggestion}`);
      });
    }
    
    // Log error for support
    console.log('🔍 Error details for support:', {
      step: error.step,
      code: error.code,
      timestamp: new Date().toISOString(),
      searchParams
    });
    
    return null;
  }
}
```

## 🔍 Debugging and Logging

### Enhanced Error Logging

```typescript
class TBOErrorLogger {
  static log(operation: string, error: any, context?: any) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      operation,
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code,
        response: error.response?.data
      },
      context
    };
    
    console.error('🚫 TBO API Error:', JSON.stringify(errorLog, null, 2));
    
    // In production, send to logging service
    // await sendToLoggingService(errorLog);
  }
  
  static logApiResponse(endpoint: string, response: any) {
    console.log(`📥 API Response [${endpoint}]:`, {
      status: response.Status?.Code,
      description: response.Status?.Description,
      timestamp: new Date().toISOString()
    });
  }
}

// Usage in API calls
async function loggedApiCall() {
  try {
    const response = await sdk.utilities.getCountryList();
    
    TBOErrorLogger.logApiResponse('CountryList', response);
    
    if (response.Status.Code !== 200) {
      TBOErrorLogger.log('CountryList', new Error(response.Status.Description), {
        statusCode: response.Status.Code
      });
    }
    
    return response;
    
  } catch (error) {
    TBOErrorLogger.log('CountryList', error, {
      endpoint: '/CountryList',
      method: 'GET'
    });
    throw error;
  }
}
```

## 🛡️ Error Prevention

### Input Validation

```typescript
function validateSearchParams(params: {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  childrenAges: number[];
  nationality: string;
  hotelCodes: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Date validation
  const checkInDate = new Date(params.checkIn);
  const checkOutDate = new Date(params.checkOut);
  const today = new Date();
  
  if (isNaN(checkInDate.getTime())) {
    errors.push('Invalid check-in date format. Use YYYY-MM-DD');
  }
  
  if (isNaN(checkOutDate.getTime())) {
    errors.push('Invalid check-out date format. Use YYYY-MM-DD');
  }
  
  if (checkInDate <= today) {
    errors.push('Check-in date must be in the future');
  }
  
  if (checkOutDate <= checkInDate) {
    errors.push('Check-out date must be after check-in date');
  }
  
  // Guest validation
  if (params.adults < 1 || params.adults > 10) {
    errors.push('Adults must be between 1 and 10');
  }
  
  if (params.children < 0 || params.children > 5) {
    errors.push('Children must be between 0 and 5');
  }
  
  if (params.children !== params.childrenAges.length) {
    errors.push('Number of children must match children ages array length');
  }
  
  if (params.childrenAges.some(age => age < 0 || age > 17)) {
    errors.push('Children ages must be between 0 and 17');
  }
  
  // Nationality validation
  if (!/^[A-Z]{2}$/.test(params.nationality)) {
    errors.push('Nationality must be 2-letter country code (e.g., AE, US)');
  }
  
  // Hotel codes validation
  if (!params.hotelCodes || params.hotelCodes.trim() === '') {
    errors.push('Hotel codes are required');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Usage
async function safeHotelSearch(params: any) {
  const validation = validateSearchParams(params);
  
  if (!validation.valid) {
    console.error('❌ Validation errors:');
    validation.errors.forEach(error => console.error(`   • ${error}`));
    return null;
  }
  
  // Proceed with search
  return await sdk.search.searchSingleRoom(...);
}
```

## 🔗 Related Documentation

- [API Overview](../api/overview.md) - Status codes and response formats
- [Quick Start Guide](../examples/quickstart.md) - Basic error handling
- [Complete Booking Flow](../examples/booking-flow.md) - Error handling in practice