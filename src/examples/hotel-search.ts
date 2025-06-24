/**
 * Hotel Search API Examples
 */

import { HotelSearchClient } from '../clients/hotel-search-client';

async function testHotelSearch() {
  console.log('🔍 TBO Holidays API - Hotel Search Test\n');

  const client = new HotelSearchClient();

  try {
    // Test 1: Single room search
    console.log('1. 🏨 Testing Single Room Search...');
    const { checkIn, checkOut } = client.getTestDates(30, 1);
    console.log(`   📅 Dates: ${checkIn} to ${checkOut}`);
    
    const singleRoomResponse = await client.searchSingleRoom(
      checkIn,
      checkOut,
      1, // adults
      0, // children
      [], // children ages
      'AE', // guest nationality
      client.getSampleHotelCodes(5), // hotel codes
      {
        responseTime: 20,
        isDetailedResponse: true,
        filters: {
          Refundable: false,
          NoOfRooms: 0,
          MealType: 'All'
        }
      }
    );

    console.log(`   📊 Status: ${singleRoomResponse.Status.Code} - ${singleRoomResponse.Status.Description}`);
    
    if (singleRoomResponse.Status.Code === 200) {
      const summary = client.getSearchSummary(singleRoomResponse);
      console.log(`   ✅ Search successful!`);
      console.log(`      🏨 Hotels found: ${summary.totalHotels}`);
      console.log(`      🏠 Total rooms: ${summary.totalRooms}`);
      console.log(`      🎫 Booking codes: ${summary.totalBookingCodes}`);
      
      if (summary.priceRange) {
        console.log(`      💰 Price range: ${summary.priceRange.min} - ${summary.priceRange.max} ${summary.priceRange.currency}`);
      }

      // Show hotel details
      if (singleRoomResponse.HotelResult && singleRoomResponse.HotelResult.length > 0) {
        const hotel = singleRoomResponse.HotelResult[0];
        console.log(`\n   🏨 Sample Hotel: ${hotel.HotelCode}`);
        console.log(`      💱 Currency: ${hotel.Currency}`);
        console.log(`      🏠 Rooms available: ${hotel.Rooms.length}`);
        
        if (hotel.Rooms.length > 0) {
          const room = hotel.Rooms[0];
          console.log(`\n      📋 Sample Room:`);
          console.log(`         🛏️ Type: ${room.Name.join(', ')}`);
          console.log(`         💰 Total Fare: ${room.TotalFare} ${hotel.Currency}`);
          console.log(`         🍽️ Meal Type: ${room.MealType}`);
          console.log(`         ↩️ Refundable: ${room.IsRefundable ? 'Yes' : 'No'}`);
          console.log(`         🎫 Booking Code: ${room.BookingCode.substring(0, 30)}...`);
        }
      }

      // Extract booking codes for later use
      const bookingCodes = client.extractBookingCodes(singleRoomResponse);
      console.log(`\n   📝 Extracted ${bookingCodes.length} booking codes`);

    } else {
      console.log(`   ❌ Search failed: ${singleRoomResponse.Status.Description}`);
    }

    // Test 2: Multiple room search
    console.log('\n2. 🏠 Testing Multiple Room Search...');
    const { checkIn: checkIn2, checkOut: checkOut2 } = client.getTestDates(45, 2);
    
    const roomConfigs = [
      { adults: 2, children: 1, childrenAges: [8] },
      { adults: 1, children: 0 }
    ];

    const multiRoomResponse = await client.searchMultipleRooms(
      checkIn2,
      checkOut2,
      roomConfigs,
      'AE',
      client.getSampleHotelCodes(3),
      {
        responseTime: 25,
        isDetailedResponse: false // Faster response
      }
    );

    console.log(`   📊 Status: ${multiRoomResponse.Status.Code} - ${multiRoomResponse.Status.Description}`);
    
    if (multiRoomResponse.Status.Code === 200) {
      const summary = client.getSearchSummary(multiRoomResponse);
      console.log(`   ✅ Multi-room search successful!`);
      console.log(`      🏨 Hotels found: ${summary.totalHotels}`);
      console.log(`      🏠 Total room combinations: ${summary.totalRooms}`);
      console.log(`      🎫 Booking codes: ${summary.totalBookingCodes}`);
      
      if (summary.priceRange) {
        console.log(`      💰 Price range: ${summary.priceRange.min} - ${summary.priceRange.max} ${summary.priceRange.currency}`);
      }
    } else {
      console.log(`   ❌ Multi-room search failed: ${multiRoomResponse.Status.Description}`);
    }

    // Test 3: Search with different filters
    console.log('\n3. 🎯 Testing Search with Refundable Filter...');
    
    const refundableResponse = await client.searchSingleRoom(
      checkIn,
      checkOut,
      2, // 2 adults
      0,
      [],
      'US', // US guest
      client.getSampleHotelCodes(5),
      {
        filters: {
          Refundable: true, // Only refundable rates
          NoOfRooms: 0,
          MealType: 'All'
        }
      }
    );

    console.log(`   📊 Status: ${refundableResponse.Status.Code} - ${refundableResponse.Status.Description}`);
    
    if (refundableResponse.Status.Code === 200) {
      const summary = client.getSearchSummary(refundableResponse);
      console.log(`   ✅ Refundable search successful!`);
      console.log(`      🏨 Refundable hotels: ${summary.totalHotels}`);
      console.log(`      🏠 Refundable rooms: ${summary.totalRooms}`);
    } else {
      console.log(`   ❌ Refundable search failed: ${refundableResponse.Status.Description}`);
    }

    console.log('\n🎉 Hotel search test completed!');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response);
    }
  }
}

// Run the test
if (require.main === module) {
  testHotelSearch();
}

export default testHotelSearch;