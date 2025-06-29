# PreBook API

The PreBook API verifies booking availability and provides final pricing before actual payment. This is a crucial step to ensure the room is still available and confirm the final price.

## 🔒 PreBook Endpoint

### Endpoint Details
- **URL**: `/PreBook`
- **Method**: `POST`
- **Authentication**: HTTP Basic Auth

### Basic Usage

```typescript
import TBOHolidaysSDK from "tbo-hotel-sdk";

const sdk = new TBOHolidaysSDK();

// First, get booking codes from search
const searchResponse = await sdk.search.searchSingleRoom(...);
const bookingCodes = sdk.search.extractBookingCodes(searchResponse);

if (bookingCodes.length > 0) {
  // PreBook the first available option
  const preBookResponse = await sdk.preBook.preBookHotel(
    bookingCodes[0],  // Booking code from search
    "Limit"           // PreBook type
  );
  
  // Validate the response
  const validation = sdk.preBook.validatePreBookResponse(preBookResponse);
  
  if (validation.isValid) {
    const info = sdk.preBook.extractPreBookInfo(preBookResponse);
    console.log(`Hotel: ${info.hotelName}`);
    console.log(`Final Price: ${info.totalFare} ${info.currency}`);
    console.log(`Refundable: ${info.isRefundable ? 'Yes' : 'No'}`);
  }
}
```

## 📋 Request Parameters

```typescript
interface PreBookRequest {
  BookingCode: string;  // From hotel search response
  PreBookType: string;  // "Limit" or "Instant"
}
```

### PreBook Types
- **"Limit"** - Standard prebooking with time limit to complete
- **"Instant"** - Immediate booking confirmation (if available)

## 📥 Request Example

```http
POST /PreBook HTTP/1.1
Host: api.tbotechnology.in
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
Content-Type: application/json

{
  "BookingCode": "1407362!TB!1!TB!64ca9cb2-8d78-4e4b-9123-456789abcdef",
  "PreBookType": "Limit"
}
```

## 📤 Response Structure

### Successful PreBook Response

```json
{
  "Status": {
    "Code": 200,
    "Description": "Successful"
  },
  "PreBookResult": {
    "BookingCode": "1407362!TB!1!TB!64ca9cb2...",
    "HotelName": "Luxury Hotel Downtown",
    "HotelCode": "1407362",
    "RoomTypeName": "Deluxe Room, 1 King Bed",
    "TotalFare": 904.45,
    "Currency": "USD",
    "CheckIn": "2025-07-27",
    "CheckOut": "2025-07-28",
    "Refundable": true,
    "CancellationPolicy": "Free cancellation until 24 hours before check-in",
    "TimeLimit": "2025-07-26T15:30:00Z",
    "AdultCount": 2,
    "ChildCount": 0
  }
}
```

### Failed PreBook Response

```json
{
  "Status": {
    "Code": 400,
    "Description": "Room no longer available"
  }
}
```

## 🔧 PreBook Methods

### Basic PreBook

```typescript
// PreBook with booking code
const preBookResponse = await sdk.preBook.preBookHotel(
  "1407362!TB!1!TB!64ca9cb2-8d78-4e4b-9123-456789abcdef",
  "Limit"
);
```

### Validate PreBook Response

```typescript
const validation = sdk.preBook.validatePreBookResponse(preBookResponse);

console.log(`Valid: ${validation.isValid}`);
console.log(`Message: ${validation.message}`);

if (!validation.isValid) {
  console.log(`Errors: ${validation.errors.join(', ')}`);
}
```

### Extract PreBook Information

```typescript
if (preBookResponse.Status.Code === 200) {
  const info = sdk.preBook.extractPreBookInfo(preBookResponse);
  
  console.log('PreBook Details:');
  console.log(`🏨 Hotel: ${info.hotelName} (${info.hotelCode})`);
  console.log(`🛏️ Room: ${info.roomType}`);
  console.log(`💰 Price: ${info.totalFare} ${info.currency}`);
  console.log(`📅 Stay: ${info.checkIn} to ${info.checkOut}`);
  console.log(`👥 Guests: ${info.adultCount} adults, ${info.childCount} children`);
  console.log(`↩️ Refundable: ${info.isRefundable ? 'Yes' : 'No'}`);
  console.log(`⏰ Time Limit: ${info.timeLimit}`);
  console.log(`🎫 Booking Code: ${info.bookingCode}`);
}
```

## 📊 Response Types

```typescript
interface PreBookResponse {
  Status: {
    Code: number;
    Description: string;
  };
  PreBookResult?: {
    BookingCode: string;
    HotelName: string;
    HotelCode: string;
    RoomTypeName: string;
    TotalFare: number;
    Currency: string;
    CheckIn: string;
    CheckOut: string;
    Refundable: boolean;
    CancellationPolicy: string;
    TimeLimit?: string;
    AdultCount: number;
    ChildCount: number;
  };
}

interface PreBookInfo {
  bookingCode: string;
  hotelName: string;
  hotelCode: string;
  roomType: string;
  totalFare: number;
  currency: string;
  checkIn: string;
  checkOut: string;
  adultCount: number;
  childCount: number;
  isRefundable: boolean;
  cancellationPolicy: string;
  timeLimit?: string;
}

interface PreBookValidation {
  isValid: boolean;
  message: string;
  errors: string[];
}
```

## 🧪 Complete PreBook Test Example

```typescript
async function testPreBook() {
  const sdk = new TBOHolidaysSDK();
  
  console.log('🔒 Testing PreBook API...\n');
  
  // Step 1: Search for hotels first
  console.log('1. Searching for hotels...');
  const { checkIn, checkOut } = sdk.search.getTestDates(30, 1);
  
  const searchResponse = await sdk.search.searchSingleRoom(
    checkIn,
    checkOut,
    2, // adults
    0, // children
    [], // no children
    "AE", // nationality
    sdk.search.getSampleHotelCodes(5)
  );
  
  if (searchResponse.Status.Code !== 200) {
    console.log(`❌ Search failed: ${searchResponse.Status.Description}`);
    return;
  }
  
  console.log('✅ Search successful');
  
  // Step 2: Extract booking codes
  const bookingCodes = sdk.search.extractBookingCodes(searchResponse);
  console.log(`📋 Found ${bookingCodes.length} booking codes`);
  
  if (bookingCodes.length === 0) {
    console.log('❌ No booking codes available');
    return;
  }
  
  // Step 3: PreBook first option
  console.log('\n2. Testing PreBook...');
  const bookingCode = bookingCodes[0];
  console.log(`🎫 Using booking code: ${bookingCode.substring(0, 30)}...`);
  
  try {
    const preBookResponse = await sdk.preBook.preBookHotel(bookingCode, "Limit");
    
    console.log(`📊 PreBook Status: ${preBookResponse.Status.Code} - ${preBookResponse.Status.Description}`);
    
    if (preBookResponse.Status.Code === 200) {
      // Validate response
      const validation = sdk.preBook.validatePreBookResponse(preBookResponse);
      console.log(`✅ Validation: ${validation.message}`);
      
      if (validation.isValid) {
        // Extract and display information
        const info = sdk.preBook.extractPreBookInfo(preBookResponse);
        
        console.log('\n📋 PreBook Details:');
        console.log(`🏨 Hotel: ${info.hotelName} (${info.hotelCode})`);
        console.log(`🛏️ Room: ${info.roomType}`);
        console.log(`💰 Total Fare: ${info.totalFare} ${info.currency}`);
        console.log(`📅 Dates: ${info.checkIn} to ${info.checkOut}`);
        console.log(`👥 Guests: ${info.adultCount} adults, ${info.childCount} children`);
        console.log(`↩️ Refundable: ${info.isRefundable ? 'Yes' : 'No'}`);
        
        if (info.timeLimit) {
          console.log(`⏰ Time Limit: ${info.timeLimit}`);
        }
        
        if (info.cancellationPolicy) {
          console.log(`📜 Cancellation: ${info.cancellationPolicy}`);
        }
        
        console.log('\n🎯 Ready for booking! PreBook successful.');
        
      } else {
        console.log(`❌ Validation failed: ${validation.errors.join(', ')}`);
      }
      
    } else {
      console.log(`❌ PreBook failed: ${preBookResponse.Status.Description}`);
    }
    
  } catch (error) {
    console.log(`⚠️ PreBook error: ${error.message}`);
    console.log('This might be expected if booking codes expire quickly');
  }
}
```

### Expected Output

```
🔒 Testing PreBook API...

1. Searching for hotels...
✅ Search successful
📋 Found 5 booking codes

2. Testing PreBook...
🎫 Using booking code: 1407362!TB!1!TB!64ca9cb2-8d78...
📊 PreBook Status: 200 - Successful
✅ Validation: PreBook successful with valid booking information

📋 PreBook Details:
🏨 Hotel: Luxury Hotel Downtown (1407362)
🛏️ Room: Deluxe Room, 1 King Bed, Non-Smoking
💰 Total Fare: 904.45 USD
📅 Dates: 2025-07-27 to 2025-07-28
👥 Guests: 2 adults, 0 children
↩️ Refundable: Yes
⏰ Time Limit: 2025-07-26T15:30:00Z
📜 Cancellation: Free cancellation until 24 hours before check-in

🎯 Ready for booking! PreBook successful.
```

## ⚠️ Important Considerations

### Booking Code Expiry
- Booking codes have short expiry times (typically 10-30 minutes)
- Always PreBook immediately after search
- If PreBook fails, search again for fresh codes

### Price Changes
- Final price in PreBook may differ from search results
- Currency rates and taxes can change between search and PreBook
- Always display PreBook price to customers

### Time Limits
- PreBook responses include time limits for completion
- Customer must complete booking before time limit expires
- Time limits vary by hotel and rate type

### Multiple PreBooks
- Don't PreBook multiple rooms simultaneously for same customer
- Cancel unused PreBooks to free up inventory
- Some hotels limit concurrent PreBooks

## 🚦 Error Handling

```typescript
async function safePreBook(bookingCode: string) {
  try {
    const preBookResponse = await sdk.preBook.preBookHotel(bookingCode, "Limit");
    
    switch (preBookResponse.Status.Code) {
      case 200:
        const validation = sdk.preBook.validatePreBookResponse(preBookResponse);
        if (validation.isValid) {
          return {
            success: true,
            data: sdk.preBook.extractPreBookInfo(preBookResponse)
          };
        } else {
          return {
            success: false,
            error: `Validation failed: ${validation.errors.join(', ')}`
          };
        }
        
      case 400:
        return {
          success: false,
          error: 'Room no longer available'
        };
        
      case 401:
        return {
          success: false,
          error: 'Invalid booking code or expired'
        };
        
      default:
        return {
          success: false,
          error: preBookResponse.Status.Description
        };
    }
    
  } catch (error) {
    return {
      success: false,
      error: `Network error: ${error.message}`
    };
  }
}

// Usage
const result = await safePreBook(bookingCode);
if (result.success) {
  console.log('PreBook successful:', result.data);
} else {
  console.error('PreBook failed:', result.error);
}
```

## 🔄 Integration with Search

The PreBook API is designed to work seamlessly with the Search API:

```typescript
// Complete search-to-prebook flow
async function searchAndPreBook() {
  const sdk = new TBOHolidaysSDK();
  
  // 1. Search
  const searchResponse = await sdk.search.searchSingleRoom(...);
  
  if (searchResponse.Status.Code === 200) {
    // 2. Get booking codes
    const bookingCodes = sdk.search.extractBookingCodes(searchResponse);
    
    // 3. PreBook first option
    if (bookingCodes.length > 0) {
      const preBookResponse = await sdk.preBook.preBookHotel(bookingCodes[0], "Limit");
      
      // 4. Process PreBook result
      if (preBookResponse.Status.Code === 200) {
        const info = sdk.preBook.extractPreBookInfo(preBookResponse);
        
        // Ready for final booking
        return {
          success: true,
          prebookInfo: info,
          bookingCode: bookingCodes[0]
        };
      }
    }
  }
  
  return { success: false };
}
```

## 🔗 Next Steps

- [Complete Booking Flow](../examples/booking-flow.md) - Full reservation process
- [Error Handling Guide](../guides/error-handling.md) - Handle PreBook failures
- [Hotel Search API](./search.md) - Get booking codes for PreBook