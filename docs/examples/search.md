# Hotel Search Examples

Real-world examples of hotel search functionality. All examples are based on our test suite (`npm run test:search`) that runs against the live TBO API.

## 🔍 Basic Search Examples

### Single Room Search

```typescript
import TBOHolidaysSDK from "tbo-hotel-sdk";

const sdk = new TBOHolidaysSDK();

async function basicHotelSearch() {
  console.log('🔍 Basic Hotel Search Example\n');
  
  try {
    // Get test dates (30 days from now, 1 night stay)
    const { checkIn, checkOut } = sdk.search.getTestDates(30, 1);
    console.log(`📅 Search dates: ${checkIn} to ${checkOut}`);
    
    // Search for single room
    const searchResponse = await sdk.search.searchSingleRoom(
      checkIn,        // "2025-07-27"
      checkOut,       // "2025-07-28"  
      2,              // 2 adults
      0,              // 0 children
      [],             // no children ages
      "AE",           // UAE nationality
      sdk.search.getSampleHotelCodes(5) // 5 sample hotels
    );
    
    console.log(`📊 Search Status: ${searchResponse.Status.Code} - ${searchResponse.Status.Description}`);
    
    if (searchResponse.Status.Code === 200) {
      // Get search summary
      const summary = sdk.search.getSearchSummary(searchResponse);
      
      console.log('✅ Search Results:');
      console.log(`   🏨 Hotels found: ${summary.totalHotels}`);
      console.log(`   🏠 Total rooms: ${summary.totalRooms}`);
      console.log(`   🎫 Booking codes: ${summary.totalBookingCodes}`);
      
      if (summary.priceRange) {
        console.log(`   💰 Price range: ${summary.priceRange.min} - ${summary.priceRange.max} ${summary.priceRange.currency}`);
      }
      
      // Show detailed results
      if (searchResponse.HotelResult) {
        searchResponse.HotelResult.forEach(hotel => {
          console.log(`\n🏨 Hotel: ${hotel.HotelCode}`);
          console.log(`   💱 Currency: ${hotel.Currency}`);
          console.log(`   🏠 Rooms available: ${hotel.RoomDetails.length}`);
          
          // Show first room as sample
          if (hotel.RoomDetails.length > 0) {
            const room = hotel.RoomDetails[0];
            console.log(`\n   📋 Sample Room:`);
            console.log(`      🛏️ Type: ${room.RoomTypeName}`);
            console.log(`      💰 Total Fare: ${room.TotalFare} ${hotel.Currency}`);
            console.log(`      🍽️ Meal Type: ${room.MealType}`);
            console.log(`      ↩️ Refundable: ${room.Refundable ? 'Yes' : 'No'}`);
            console.log(`      🎫 Booking Code: ${room.BookingCode.substring(0, 30)}...`);
          }
        });
      }
      
      // Extract booking codes for later use
      const bookingCodes = sdk.search.extractBookingCodes(searchResponse);
      console.log(`\n📝 Extracted ${bookingCodes.length} booking codes`);
      
      return searchResponse;
      
    } else if (searchResponse.Status.Code === 201) {
      console.log('ℹ️ No rooms available for the search criteria');
      return null;
    } else {
      console.log(`❌ Search failed: ${searchResponse.Status.Description}`);
      return null;
    }
    
  } catch (error) {
    console.error('🚫 Search error:', error.message);
    return null;
  }
}

// Expected output:
// 🔍 Basic Hotel Search Example
//
// 📅 Search dates: 2025-07-27 to 2025-07-28
// 📊 Search Status: 200 - Successful
// ✅ Search Results:
//    🏨 Hotels found: 1
//    🏠 Total rooms: 5
//    🎫 Booking codes: 5
//    💰 Price range: 904.45 - 1253.05 USD
//
// 🏨 Hotel: 1407362
//    💱 Currency: USD
//    🏠 Rooms available: 5
//
//    📋 Sample Room:
//       🛏️ Type: Luxury Room,1 King Bed,NonSmoking
//       💰 Total Fare: 904.45 USD
//       🍽️ Meal Type: Room_Only
//       ↩️ Refundable: Yes
//       🎫 Booking Code: 1407362!TB!1!TB!23c0b20e-74fe-...
//
// 📝 Extracted 5 booking codes
```

## 👨‍👩‍👧‍👦 Multiple Room Search

### Family Search with Children

```typescript
async function familySearch() {
  console.log('👨‍👩‍👧‍👦 Family Search Example\n');
  
  const { checkIn, checkOut } = sdk.search.getTestDates(45, 3); // 45 days out, 3 nights
  console.log(`📅 Family vacation: ${checkIn} to ${checkOut}`);
  
  // Define rooms for family
  const rooms = [
    { 
      Adults: 2, 
      Children: 2, 
      ChildrenAges: [8, 12] // Children ages 8 and 12
    },
    { 
      Adults: 1, 
      Children: 0, 
      ChildrenAges: [] // Grandparent room
    }
  ];
  
  try {
    const searchResponse = await sdk.search.searchMultipleRooms(
      checkIn,
      checkOut,
      rooms,
      "US", // US nationality
      sdk.search.getSampleHotelCodes(3)
    );
    
    console.log(`📊 Status: ${searchResponse.Status.Code} - ${searchResponse.Status.Description}`);
    
    if (searchResponse.Status.Code === 200) {
      const summary = sdk.search.getSearchSummary(searchResponse);
      console.log(`✅ Family rooms found: ${summary.totalHotels} hotels`);
      console.log(`   🏠 Total rooms: ${summary.totalRooms}`);
      
      return searchResponse;
    } else if (searchResponse.Status.Code === 201) {
      console.log('ℹ️ No family rooms available - try different dates or hotels');
      return null;
    } else {
      console.log(`❌ Family search failed: ${searchResponse.Status.Description}`);
      return null;
    }
    
  } catch (error) {
    console.error('🚫 Family search error:', error.message);
    return null;
  }
}
```

### Business Travel - Multiple Rooms

```typescript
async function businessTravelSearch() {
  console.log('💼 Business Travel Search Example\n');
  
  const { checkIn, checkOut } = sdk.search.getTestDates(14, 2); // 2 weeks out, 2 nights
  
  // Business group: 3 executives, 2 rooms
  const businessRooms = [
    { Adults: 2, Children: 0, ChildrenAges: [] }, // Room 1: 2 executives
    { Adults: 1, Children: 0, ChildrenAges: [] }  // Room 2: 1 executive
  ];
  
  const searchResponse = await sdk.search.searchMultipleRooms(
    checkIn,
    checkOut,
    businessRooms,
    "GB", // UK nationality
    "1402689,1405349" // Specific business hotels
  );
  
  console.log(`📊 Business travel results: ${searchResponse.Status.Code}`);
  
  if (searchResponse.Status.Code === 200) {
    console.log('✅ Business rooms available');
    const summary = sdk.search.getSearchSummary(searchResponse);
    console.log(`   🏨 Hotels: ${summary.totalHotels}`);
    console.log(`   💰 Budget: ${summary.priceRange?.min} - ${summary.priceRange?.max} ${summary.priceRange?.currency}`);
  }
  
  return searchResponse;
}
```

## 🎯 Advanced Search with Filters

### Refundable Rates Only

```typescript
async function refundableSearch() {
  console.log('↩️ Refundable Rates Search Example\n');
  
  const { checkIn, checkOut } = sdk.search.getTestDates(21, 1);
  
  try {
    const searchResponse = await sdk.search.searchWithFilters(
      checkIn,
      checkOut,
      [{ Adults: 1, Children: 0, ChildrenAges: [] }], // Solo traveler
      "AE",
      sdk.search.getSampleHotelCodes(5),
      {
        Refundable: true,    // Only refundable rates
        NoOfRooms: 1,        // Exactly 1 room
        MealType: "All"      // Any meal type
      }
    );
    
    console.log(`📊 Refundable search: ${searchResponse.Status.Code} - ${searchResponse.Status.Description}`);
    
    if (searchResponse.Status.Code === 200) {
      const summary = sdk.search.getSearchSummary(searchResponse);
      console.log(`✅ Refundable options available:`);
      console.log(`   🏨 Hotels: ${summary.totalHotels}`);
      console.log(`   🏠 Rooms: ${summary.totalRooms}`);
      console.log(`   ↩️ All rooms are refundable`);
      
      // Show refundable room details
      if (searchResponse.HotelResult) {
        searchResponse.HotelResult.forEach(hotel => {
          hotel.RoomDetails.forEach(room => {
            if (room.Refundable) {
              console.log(`\n   ✅ Refundable Room:`);
              console.log(`      🛏️ ${room.RoomTypeName}`);
              console.log(`      💰 ${room.TotalFare} ${hotel.Currency}`);
              console.log(`      📋 Cancellation: ${room.CancellationPolicy || 'Check hotel policy'}`);
            }
          });
        });
      }
      
    } else {
      console.log('ℹ️ No refundable rates available');
    }
    
    return searchResponse;
    
  } catch (error) {
    console.error('🚫 Refundable search error:', error.message);
    return null;
  }
}
```

### Breakfast Included Search

```typescript
async function breakfastIncludedSearch() {
  console.log('🍳 Breakfast Included Search Example\n');
  
  const { checkIn, checkOut } = sdk.search.getTestDates(30, 2);
  
  const searchResponse = await sdk.search.searchWithFilters(
    checkIn,
    checkOut,
    [{ Adults: 2, Children: 0, ChildrenAges: [] }],
    "US",
    sdk.search.getSampleHotelCodes(3),
    {
      Refundable: false,
      NoOfRooms: 1,
      MealType: "Breakfast" // Breakfast included
    }
  );
  
  console.log(`📊 Breakfast search: ${searchResponse.Status.Code}`);
  
  if (searchResponse.Status.Code === 200) {
    console.log('✅ Breakfast packages available');
    
    if (searchResponse.HotelResult) {
      searchResponse.HotelResult.forEach(hotel => {
        hotel.RoomDetails.forEach(room => {
          if (room.MealType.includes('Breakfast')) {
            console.log(`🍳 ${room.RoomTypeName} - ${room.MealType} - ${room.TotalFare} ${hotel.Currency}`);
          }
        });
      });
    }
  }
  
  return searchResponse;
}
```

## 📅 Date Range Examples

### Weekend Getaway

```typescript
async function weekendGetaway() {
  console.log('🌴 Weekend Getaway Search\n');
  
  // Next Friday to Sunday (2 nights)
  const { checkIn, checkOut } = sdk.search.getTestDates(10, 2); 
  
  const searchResponse = await sdk.search.searchSingleRoom(
    checkIn,
    checkOut,
    2, // couple
    0, // no children
    [],
    "AE",
    sdk.search.getSampleHotelCodes(5)
  );
  
  console.log(`📊 Weekend availability: ${searchResponse.Status.Code}`);
  
  if (searchResponse.Status.Code === 200) {
    const summary = sdk.search.getSearchSummary(searchResponse);
    console.log(`✅ Weekend getaway options:`);
    console.log(`   🏨 Hotels: ${summary.totalHotels}`);
    console.log(`   💰 Weekend rates: ${summary.priceRange?.min} - ${summary.priceRange?.max} ${summary.priceRange?.currency}`);
  }
  
  return searchResponse;
}
```

### Extended Stay

```typescript
async function extendedStay() {
  console.log('🏠 Extended Stay Search (7 nights)\n');
  
  // 7 night stay
  const { checkIn, checkOut } = sdk.search.getTestDates(30, 7);
  console.log(`📅 Extended stay: ${checkIn} to ${checkOut}`);
  
  const searchResponse = await sdk.search.searchSingleRoom(
    checkIn,
    checkOut,
    1, // solo traveler
    0,
    [],
    "US",
    sdk.search.getSampleHotelCodes(3)
  );
  
  if (searchResponse.Status.Code === 200) {
    const summary = sdk.search.getSearchSummary(searchResponse);
    console.log(`✅ Extended stay options:`);
    console.log(`   🏨 Hotels: ${summary.totalHotels}`);
    console.log(`   📅 Weekly rate: ${summary.priceRange?.min} - ${summary.priceRange?.max} ${summary.priceRange?.currency}`);
    
    // Calculate nightly rate
    if (summary.priceRange) {
      const avgNightly = (summary.priceRange.min + summary.priceRange.max) / 2 / 7;
      console.log(`   🌙 Avg per night: ~${avgNightly.toFixed(2)} ${summary.priceRange.currency}`);
    }
  }
  
  return searchResponse;
}
```

## 🌍 Multi-Nationality Search

### Compare Rates by Nationality

```typescript
async function compareRatesByNationality() {
  console.log('🌍 Nationality Rate Comparison\n');
  
  const { checkIn, checkOut } = sdk.search.getTestDates(30, 1);
  const hotelCodes = sdk.search.getSampleHotelCodes(2);
  const nationalities = ['AE', 'US', 'GB', 'IN'];
  
  const results = {};
  
  for (const nationality of nationalities) {
    try {
      console.log(`🔍 Searching rates for ${nationality} nationality...`);
      
      const searchResponse = await sdk.search.searchSingleRoom(
        checkIn,
        checkOut,
        2, 0, [], // 2 adults
        nationality,
        hotelCodes
      );
      
      if (searchResponse.Status.Code === 200) {
        const summary = sdk.search.getSearchSummary(searchResponse);
        results[nationality] = summary.priceRange;
        
        console.log(`   ✅ ${nationality}: ${summary.priceRange?.min} - ${summary.priceRange?.max} ${summary.priceRange?.currency}`);
      } else {
        console.log(`   ❌ ${nationality}: No availability`);
        results[nationality] = null;
      }
      
    } catch (error) {
      console.log(`   🚫 ${nationality}: Error - ${error.message}`);
      results[nationality] = null;
    }
  }
  
  console.log('\n📊 Rate Comparison Summary:');
  Object.entries(results).forEach(([nationality, priceRange]) => {
    if (priceRange) {
      console.log(`   ${nationality}: ${priceRange.min} - ${priceRange.max} ${priceRange.currency}`);
    } else {
      console.log(`   ${nationality}: No rates available`);
    }
  });
  
  return results;
}
```

## 🧪 Complete Search Test Suite

This replicates our `npm run test:search` functionality:

```typescript
async function completeSearchTest() {
  console.log('🔍 TBO Holidays API - Hotel Search Test\n');
  
  const sdk = new TBOHolidaysSDK();
  
  try {
    // Test 1: Single Room Search
    console.log('1. 🏨 Testing Single Room Search...');
    const { checkIn, checkOut } = sdk.search.getTestDates(30, 1);
    console.log(`   📅 Dates: ${checkIn} to ${checkOut}`);
    
    const singleRoomResponse = await sdk.search.searchSingleRoom(
      checkIn,
      checkOut,
      2, 0, [], // 2 adults, no children
      "AE",
      sdk.search.getSampleHotelCodes(5)
    );
    
    console.log(`   📊 Status: ${singleRoomResponse.Status.Code} - ${singleRoomResponse.Status.Description}`);
    
    if (singleRoomResponse.Status.Code === 200) {
      const summary = sdk.search.getSearchSummary(singleRoomResponse);
      console.log(`   ✅ Search successful!`);
      console.log(`      🏨 Hotels found: ${summary.totalHotels}`);
      console.log(`      🏠 Total rooms: ${summary.totalRooms}`);
      console.log(`      🎫 Booking codes: ${summary.totalBookingCodes}`);
      console.log(`      💰 Price range: ${summary.priceRange?.min} - ${summary.priceRange?.max} ${summary.priceRange?.currency}`);
      
      // Show sample hotel details
      if (singleRoomResponse.HotelResult && singleRoomResponse.HotelResult.length > 0) {
        const hotel = singleRoomResponse.HotelResult[0];
        console.log(`\n   🏨 Sample Hotel: ${hotel.HotelCode}`);
        console.log(`      💱 Currency: ${hotel.Currency}`);
        console.log(`      🏠 Rooms available: ${hotel.RoomDetails.length}`);
        
        if (hotel.RoomDetails.length > 0) {
          const room = hotel.RoomDetails[0];
          console.log(`\n      📋 Sample Room:`);
          console.log(`         🛏️ Type: ${room.RoomTypeName}`);
          console.log(`         💰 Total Fare: ${room.TotalFare} ${hotel.Currency}`);
          console.log(`         🍽️ Meal Type: ${room.MealType}`);
          console.log(`         ↩️ Refundable: ${room.Refundable ? 'Yes' : 'No'}`);
          console.log(`         🎫 Booking Code: ${room.BookingCode.substring(0, 30)}...`);
        }
      }
      
      const bookingCodes = sdk.search.extractBookingCodes(singleRoomResponse);
      console.log(`\n   📝 Extracted ${bookingCodes.length} booking codes`);
      
    } else if (singleRoomResponse.Status.Code === 201) {
      console.log(`   ℹ️ No rooms available for criteria`);
    } else {
      console.log(`   ❌ Search failed: ${singleRoomResponse.Status.Description}`);
    }
    
    // Test 2: Multiple Room Search  
    console.log('\n2. 🏠 Testing Multiple Room Search...');
    const multiRoomResponse = await sdk.search.searchMultipleRooms(
      checkIn,
      checkOut,
      [
        { Adults: 2, Children: 0, ChildrenAges: [] },
        { Adults: 1, Children: 1, ChildrenAges: [8] }
      ],
      "AE",
      sdk.search.getSampleHotelCodes(3)
    );
    
    console.log(`   📊 Status: ${multiRoomResponse.Status.Code} - ${multiRoomResponse.Status.Description}`);
    
    if (multiRoomResponse.Status.Code === 200) {
      const multiSummary = sdk.search.getSearchSummary(multiRoomResponse);
      console.log(`   ✅ Multi-room search successful!`);
      console.log(`      🏨 Hotels: ${multiSummary.totalHotels}`);
      console.log(`      🏠 Rooms: ${multiSummary.totalRooms}`);
    } else if (multiRoomResponse.Status.Code === 201) {
      console.log(`   ❌ Multi-room search failed: ${multiRoomResponse.Status.Description}`);
    }
    
    // Test 3: Refundable Search
    console.log('\n3. 🎯 Testing Search with Refundable Filter...');
    const refundableResponse = await sdk.search.searchWithFilters(
      checkIn,
      checkOut,
      [{ Adults: 1, Children: 0, ChildrenAges: [] }],
      "AE",
      sdk.search.getSampleHotelCodes(3),
      {
        Refundable: true,
        NoOfRooms: 1,
        MealType: "All"
      }
    );
    
    console.log(`   📊 Status: ${refundableResponse.Status.Code} - ${refundableResponse.Status.Description}`);
    
    if (refundableResponse.Status.Code === 200) {
      const refundableSummary = sdk.search.getSearchSummary(refundableResponse);
      console.log(`   ✅ Refundable search successful!`);
      console.log(`      🏨 Refundable hotels: ${refundableSummary.totalHotels}`);
      console.log(`      🏠 Refundable rooms: ${refundableSummary.totalRooms}`);
    } else {
      console.log(`   ❌ Refundable search failed: ${refundableResponse.Status.Description}`);
    }
    
    console.log('\n🎉 Hotel search test completed!');
    
  } catch (error) {
    console.error('🚫 Test suite failed:', error.message);
  }
}

// Run the complete test
completeSearchTest();
```

## 🔗 Next Steps

- [PreBook Examples](../api/prebook.md) - Verify availability before booking
- [Complete Booking Flow](./booking-flow.md) - End-to-end reservation process
- [Utilities Examples](./utilities.md) - Get hotel codes for searches