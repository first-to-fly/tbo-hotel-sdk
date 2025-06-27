# Complete Booking Flow

This guide demonstrates the complete end-to-end booking process using the TBO Holidays TypeScript SDK, from initial search to final booking preparation.

## 🎯 Overview

The complete booking flow consists of these steps:

1. **🌍 Location Setup** - Get countries and cities
2. **🔍 Hotel Search** - Find available hotels and rooms  
3. **🔒 PreBook** - Verify availability and pricing
4. **💳 Final Booking** - Complete the reservation (not implemented in SDK)

## 🚀 Complete Booking Example

### Step-by-Step Implementation

```typescript
import 'dotenv/config';
import TBOHolidaysSDK from "tbo-holidays-typescript-sdk";

interface BookingFlowResult {
  success: boolean;
  step: string;
  data?: any;
  error?: string;
}

async function completeBookingFlow(): Promise<BookingFlowResult> {
  console.log('🎯 Complete Hotel Booking Flow\n');
  
  const sdk = new TBOHolidaysSDK();
  
  try {
    // Step 1: Test API Connection
    console.log('1. 🔌 Testing API Connection...');
    const connectionTest = await sdk.testConnection();
    
    if (!connectionTest.connected) {
      return {
        success: false,
        step: 'connection',
        error: `Connection failed: ${connectionTest.errors.join(', ')}`
      };
    }
    console.log('   ✅ API connection successful');
    
    // Step 2: Get Location Data
    console.log('\n2. 🌍 Getting Location Data...');
    
    // Get countries
    const countriesResponse = await sdk.utilities.getCountryList();
    if (countriesResponse.Status.Code !== 200) {
      return {
        success: false,
        step: 'countries',
        error: countriesResponse.Status.Description
      };
    }
    
    const countries = sdk.utilities.extractCountries(countriesResponse);
    console.log(`   ✅ Found ${countries.length} countries`);
    
    // Find UAE
    const uae = countries.find(c => c.Code === 'AE');
    if (!uae) {
      return {
        success: false,
        step: 'countries',
        error: 'UAE not found in country list'
      };
    }
    console.log(`   🇦🇪 Selected: ${uae.Name}`);
    
    // Get UAE cities
    const citiesResponse = await sdk.utilities.getCityList('AE');
    if (citiesResponse.Status.Code !== 200) {
      return {
        success: false,
        step: 'cities',
        error: citiesResponse.Status.Description
      };
    }
    
    const cities = sdk.utilities.extractCities(citiesResponse);
    console.log(`   ✅ Found ${cities.length} cities in UAE`);
    
    // Find Dubai
    const dubai = cities.find(c => c.Name.includes('Dubai'));
    if (dubai) {
      console.log(`   🏙️ Selected: ${dubai.Name} (${dubai.Code})`);
    }
    
    // Step 3: Hotel Search
    console.log('\n3. 🔍 Searching Hotels...');
    
    const { checkIn, checkOut } = sdk.search.getTestDates(30, 2); // 30 days out, 2 nights
    console.log(`   📅 Dates: ${checkIn} to ${checkOut} (2 nights)`);
    console.log(`   👥 Guests: 2 adults, 1 child (age 10)`);
    console.log(`   🌍 Nationality: UAE (AE)`);
    
    const searchResponse = await sdk.search.searchSingleRoom(
      checkIn,
      checkOut,
      2,      // adults
      1,      // children  
      [10],   // child age 10
      "AE",   // UAE nationality
      sdk.search.getSampleHotelCodes(5) // search 5 hotels
    );
    
    console.log(`   📊 Search Status: ${searchResponse.Status.Code} - ${searchResponse.Status.Description}`);
    
    if (searchResponse.Status.Code === 200) {
      const summary = sdk.search.getSearchSummary(searchResponse);
      console.log(`   ✅ Search Results:`);
      console.log(`      🏨 Hotels found: ${summary.totalHotels}`);
      console.log(`      🏠 Rooms available: ${summary.totalRooms}`);
      console.log(`      🎫 Booking codes: ${summary.totalBookingCodes}`);
      
      if (summary.priceRange) {
        console.log(`      💰 Price range: ${summary.priceRange.min} - ${summary.priceRange.max} ${summary.priceRange.currency}`);
      }
      
      // Show hotel details
      if (searchResponse.HotelResult && searchResponse.HotelResult.length > 0) {
        const hotel = searchResponse.HotelResult[0];
        console.log(`\n   🏨 Selected Hotel: ${hotel.HotelCode}`);
        console.log(`      💱 Currency: ${hotel.Currency}`);
        console.log(`      🏠 Available rooms: ${hotel.RoomDetails.length}`);
        
        // Show room options
        console.log(`\n   📋 Room Options:`);
        hotel.RoomDetails.forEach((room, index) => {
          console.log(`      ${index + 1}. ${room.RoomTypeName}`);
          console.log(`         💰 Price: ${room.TotalFare} ${hotel.Currency}`);
          console.log(`         🍽️ Meal: ${room.MealType}`);
          console.log(`         ↩️ Refundable: ${room.Refundable ? 'Yes' : 'No'}`);
        });
      }
      
    } else if (searchResponse.Status.Code === 201) {
      return {
        success: false,
        step: 'search',
        error: 'No rooms available for the selected criteria'
      };
    } else {
      return {
        success: false,
        step: 'search',
        error: searchResponse.Status.Description
      };
    }
    
    // Step 4: Get Booking Codes
    console.log('\n4. 📝 Extracting Booking Codes...');
    const bookingCodes = sdk.search.extractBookingCodes(searchResponse);
    
    if (bookingCodes.length === 0) {
      return {
        success: false,
        step: 'booking_codes',
        error: 'No booking codes available'
      };
    }
    
    console.log(`   ✅ Found ${bookingCodes.length} booking codes`);
    console.log(`   🎫 Selected booking code: ${bookingCodes[0].substring(0, 40)}...`);
    
    // Step 5: PreBook
    console.log('\n5. 🔒 PreBook Verification...');
    console.log(`   🎫 PreBooking with: ${bookingCodes[0].substring(0, 30)}...`);
    
    const preBookResponse = await sdk.preBook.preBookHotel(bookingCodes[0], "Limit");
    console.log(`   📊 PreBook Status: ${preBookResponse.Status.Code} - ${preBookResponse.Status.Description}`);
    
    if (preBookResponse.Status.Code === 200) {
      // Validate PreBook response
      const validation = sdk.preBook.validatePreBookResponse(preBookResponse);
      console.log(`   ✅ Validation: ${validation.message}`);
      
      if (validation.isValid) {
        // Extract final booking information
        const info = sdk.preBook.extractPreBookInfo(preBookResponse);
        
        console.log('\n   🎯 Final Booking Details:');
        console.log(`      🏨 Hotel: ${info.hotelName} (${info.hotelCode})`);
        console.log(`      🛏️ Room: ${info.roomType}`);
        console.log(`      💰 Total Price: ${info.totalFare} ${info.currency}`);
        console.log(`      📅 Check-in: ${info.checkIn}`);
        console.log(`      📅 Check-out: ${info.checkOut}`);
        console.log(`      👥 Guests: ${info.adultCount} adults, ${info.childCount} children`);
        console.log(`      ↩️ Refundable: ${info.isRefundable ? 'Yes' : 'No'}`);
        
        if (info.timeLimit) {
          console.log(`      ⏰ Complete booking by: ${info.timeLimit}`);
        }
        
        if (info.cancellationPolicy) {
          console.log(`      📋 Cancellation: ${info.cancellationPolicy}`);
        }
        
        // Step 6: Ready for Final Booking
        console.log('\n6. 💳 Ready for Final Booking');
        console.log('   🎉 PreBook successful! Ready to proceed with payment and final booking.');
        console.log('   📝 Note: Final booking implementation depends on your payment system');
        
        return {
          success: true,
          step: 'completed',
          data: {
            searchSummary: sdk.search.getSearchSummary(searchResponse),
            preBookInfo: info,
            bookingCode: bookingCodes[0],
            locationData: {
              country: uae,
              city: dubai
            }
          }
        };
        
      } else {
        return {
          success: false,
          step: 'prebook_validation',
          error: `PreBook validation failed: ${validation.errors.join(', ')}`
        };
      }
      
    } else {
      return {
        success: false,
        step: 'prebook',
        error: preBookResponse.Status.Description
      };
    }
    
  } catch (error) {
    return {
      success: false,
      step: 'unexpected_error',
      error: error.message
    };
  }
}

// Run the complete booking flow
async function runBookingFlow() {
  const result = await completeBookingFlow();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 BOOKING FLOW SUMMARY');
  console.log('='.repeat(60));
  
  if (result.success) {
    console.log('✅ Status: SUCCESS');
    console.log('🎯 All steps completed successfully');
    console.log('\n📋 Final Details:');
    
    if (result.data) {
      const { searchSummary, preBookInfo, locationData } = result.data;
      
      console.log(`🌍 Location: ${locationData.city?.Name}, ${locationData.country.Name}`);
      console.log(`🏨 Hotel: ${preBookInfo.hotelName}`);
      console.log(`💰 Price: ${preBookInfo.totalFare} ${preBookInfo.currency}`);
      console.log(`📅 Dates: ${preBookInfo.checkIn} to ${preBookInfo.checkOut}`);
      console.log(`👥 Guests: ${preBookInfo.adultCount} adults, ${preBookInfo.childCount} children`);
      console.log(`↩️ Refundable: ${preBookInfo.isRefundable ? 'Yes' : 'No'}`);
    }
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Collect customer payment information');
    console.log('   2. Implement final booking API call');
    console.log('   3. Send confirmation to customer');
    console.log('   4. Handle booking management (cancellation, modification)');
    
  } else {
    console.log('❌ Status: FAILED');
    console.log(`🚫 Failed at step: ${result.step}`);
    console.log(`💬 Error: ${result.error}`);
    
    console.log('\n🔧 Troubleshooting:');
    switch (result.step) {
      case 'connection':
        console.log('   - Check API credentials in .env file');
        console.log('   - Verify internet connectivity');
        break;
      case 'search':
        console.log('   - Try different dates (further in future)');
        console.log('   - Use different hotel codes');
        console.log('   - Check guest nationality requirements');
        break;
      case 'prebook':
        console.log('   - Booking codes may have expired - search again');
        console.log('   - Room may no longer be available');
        break;
      default:
        console.log('   - Check logs for detailed error information');
        console.log('   - Verify all API responses');
    }
  }
  
  console.log('='.repeat(60));
}

// Execute the booking flow
runBookingFlow();
```

### Expected Successful Output

```
🎯 Complete Hotel Booking Flow

1. 🔌 Testing API Connection...
   ✅ API connection successful

2. 🌍 Getting Location Data...
   ✅ Found 137 countries
   🇦🇪 Selected: United Arab Emirates
   ✅ Found 26 cities in UAE
   🏙️ Selected: Bur Dubai (151807)

3. 🔍 Searching Hotels...
   📅 Dates: 2025-07-27 to 2025-07-29 (2 nights)
   👥 Guests: 2 adults, 1 child (age 10)
   🌍 Nationality: UAE (AE)
   📊 Search Status: 200 - Successful
   ✅ Search Results:
      🏨 Hotels found: 1
      🏠 Rooms available: 5
      🎫 Booking codes: 5
      💰 Price range: 904.45 - 1253.05 USD

   🏨 Selected Hotel: 1407362
      💱 Currency: USD
      🏠 Available rooms: 5

   📋 Room Options:
      1. Luxury Room,1 King Bed,NonSmoking
         💰 Price: 904.45 USD
         🍽️ Meal: Room_Only
         ↩️ Refundable: Yes
      2. Premium Suite,2 Queen Beds,NonSmoking
         💰 Price: 1253.05 USD
         🍽️ Meal: Breakfast
         ↩️ Refundable: Yes

4. 📝 Extracting Booking Codes...
   ✅ Found 5 booking codes
   🎫 Selected booking code: 1407362!TB!1!TB!64ca9cb2-8d78-4e4b...

5. 🔒 PreBook Verification...
   🎫 PreBooking with: 1407362!TB!1!TB!64ca9cb2-8d78...
   📊 PreBook Status: 200 - Successful
   ✅ Validation: PreBook successful with valid booking information

   🎯 Final Booking Details:
      🏨 Hotel: Luxury Hotel Downtown (1407362)
      🛏️ Room: Luxury Room,1 King Bed,NonSmoking
      💰 Total Price: 904.45 USD
      📅 Check-in: 2025-07-27
      📅 Check-out: 2025-07-29
      👥 Guests: 2 adults, 1 children
      ↩️ Refundable: Yes
      ⏰ Complete booking by: 2025-07-26T15:30:00Z
      📋 Cancellation: Free cancellation until 24 hours before check-in

6. 💳 Ready for Final Booking
   🎉 PreBook successful! Ready to proceed with payment and final booking.
   📝 Note: Final booking implementation depends on your payment system

============================================================
📊 BOOKING FLOW SUMMARY
============================================================
✅ Status: SUCCESS
🎯 All steps completed successfully

📋 Final Details:
🌍 Location: Bur Dubai, United Arab Emirates
🏨 Hotel: Luxury Hotel Downtown
💰 Price: 904.45 USD
📅 Dates: 2025-07-27 to 2025-07-29
👥 Guests: 2 adults, 1 children
↩️ Refundable: Yes

🚀 Next Steps:
   1. Collect customer payment information
   2. Implement final booking API call
   3. Send confirmation to customer
   4. Handle booking management (cancellation, modification)
============================================================
```

## 🔄 Simplified Booking Flow

For simpler integration, here's a streamlined version:

```typescript
async function quickBookingFlow(
  checkIn: string,
  checkOut: string,
  adults: number,
  children: number,
  childrenAges: number[],
  nationality: string,
  hotelCodes: string
) {
  const sdk = new TBOHolidaysSDK();
  
  try {
    // 1. Search hotels
    console.log('🔍 Searching hotels...');
    const searchResponse = await sdk.search.searchSingleRoom(
      checkIn, checkOut, adults, children, childrenAges, nationality, hotelCodes
    );
    
    if (searchResponse.Status.Code !== 200) {
      throw new Error(`Search failed: ${searchResponse.Status.Description}`);
    }
    
    // 2. Get first booking code
    const bookingCodes = sdk.search.extractBookingCodes(searchResponse);
    if (bookingCodes.length === 0) {
      throw new Error('No booking codes available');
    }
    
    // 3. PreBook
    console.log('🔒 PreBooking...');
    const preBookResponse = await sdk.preBook.preBookHotel(bookingCodes[0], "Limit");
    
    if (preBookResponse.Status.Code !== 200) {
      throw new Error(`PreBook failed: ${preBookResponse.Status.Description}`);
    }
    
    // 4. Extract final details
    const info = sdk.preBook.extractPreBookInfo(preBookResponse);
    
    console.log('✅ Booking ready!');
    console.log(`Hotel: ${info.hotelName}`);
    console.log(`Price: ${info.totalFare} ${info.currency}`);
    console.log(`Dates: ${info.checkIn} to ${info.checkOut}`);
    
    return {
      success: true,
      bookingInfo: info,
      bookingCode: bookingCodes[0]
    };
    
  } catch (error) {
    console.error('❌ Booking flow failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Usage
const result = await quickBookingFlow(
  "2025-07-27",   // check-in
  "2025-07-28",   // check-out
  2,              // adults
  1,              // children
  [10],           // child ages
  "AE",           // nationality
  "1402689,1405349" // hotel codes
);

if (result.success) {
  console.log('Ready for payment:', result.bookingInfo);
} else {
  console.log('Booking failed:', result.error);
}
```

## 💳 Final Booking Implementation Notes

The SDK handles everything up to PreBook. For final booking, you'll need to:

### 1. Payment Processing
```typescript
// Implement your payment system
async function processPayment(bookingInfo, paymentDetails) {
  // Your payment gateway integration
  // Return payment confirmation
}
```

### 2. Final Booking API
```typescript
// Call TBO's final booking endpoint (not in current SDK)
async function finalizeBooking(preBookInfo, paymentConfirmation) {
  // This would be implemented based on TBO's final booking API
  // Returns booking confirmation and voucher
}
```

### 3. Customer Notification
```typescript
async function sendBookingConfirmation(bookingDetails, customerInfo) {
  // Send email/SMS confirmation
  // Include booking voucher and hotel details
}
```

## 🚦 Error Handling Best Practices

```typescript
async function robustBookingFlow() {
  const sdk = new TBOHolidaysSDK();
  
  try {
    // Implement retry logic for each step
    const searchResult = await retryOperation(
      () => sdk.search.searchSingleRoom(...),
      3 // retry 3 times
    );
    
    const preBookResult = await retryOperation(
      () => sdk.preBook.preBookHotel(...),
      2 // retry 2 times
    );
    
    return { success: true, data: preBookResult };
    
  } catch (error) {
    // Log error for debugging
    console.error('Booking flow error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return { success: false, error: error.message };
  }
}

async function retryOperation(operation, maxRetries) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${i + 1} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // exponential backoff
    }
  }
  
  throw lastError;
}
```

## 🔗 Related Documentation

- [Quick Start Guide](./quickstart.md) - Basic SDK setup
- [Hotel Search API](../api/search.md) - Detailed search documentation
- [PreBook API](../api/prebook.md) - PreBook verification details
- [Error Handling Guide](../guides/error-handling.md) - Comprehensive error management