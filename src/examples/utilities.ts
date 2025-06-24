/**
 * Utilities API Examples
 */

import { UtilitiesClient } from '../clients/utilities-client';

async function testUtilities() {
  console.log('🌍 TBO Holidays API - Utilities Test\n');

  const client = new UtilitiesClient();

  try {
    // Test 1: Get all countries
    console.log('1. 📍 Testing Country List...');
    const countriesResponse = await client.getCountryList();
    
    if (countriesResponse.Status.Code === 200) {
      const countries = client.extractCountries(countriesResponse);
      console.log(`   ✅ Found ${countries.length} countries`);
      
      // Show first 10 countries
      console.log('   📋 First 10 countries:');
      countries.slice(0, 10).forEach(country => {
        console.log(`      ${country.Code}: ${country.Name}`);
      });

      // Find popular countries
      const popular = await client.getPopularCountries();
      console.log('\n   🌟 Popular countries:');
      popular.forEach(country => {
        console.log(`      ${country.Code}: ${country.Name}`);
      });
    } else {
      console.log(`   ❌ Failed: ${countriesResponse.Status.Description}`);
    }

    // Test 2: Get cities for UAE
    console.log('\n2. 🏙️ Testing City List for UAE...');
    const citiesResponse = await client.getCityList('AE');
    
    if (citiesResponse.Status.Code === 200) {
      const cities = client.extractCities(citiesResponse);
      console.log(`   ✅ Found ${cities.length} cities in UAE`);
      
      // Show cities
      console.log('   📋 UAE Cities:');
      cities.slice(0, 10).forEach(city => {
        console.log(`      ${city.Code}: ${city.Name}`);
      });
    } else {
      console.log(`   ❌ Failed: ${citiesResponse.Status.Description}`);
    }

    // Test 3: Search for Dubai cities
    console.log('\n3. 🔍 Searching for Dubai cities...');
    const dubaiCities = await client.findCitiesByName('AE', 'Dubai');
    console.log(`   ✅ Found ${dubaiCities.length} Dubai cities:`);
    dubaiCities.forEach(city => {
      console.log(`      ${city.Code}: ${city.Name}`);
    });

    // Test 4: Get hotel details
    console.log('\n4. 🏨 Testing Hotel Details...');
    const hotelCodes = client.getSampleHotelCodes(3);
    console.log(`   🔍 Getting details for: ${hotelCodes}`);
    
    const hotelDetailsResponse = await client.getHotelDetails(hotelCodes);
    
    if (hotelDetailsResponse.Status.Code === 200) {
      const hotels = client.extractHotelDetails(hotelDetailsResponse);
      console.log(`   ✅ Retrieved details for ${hotels.length} hotels:`);
      
      hotels.forEach(hotel => {
        console.log(`\n   🏨 ${hotel.HotelName} (${hotel.HotelCode})`);
        console.log(`      ⭐ Rating: ${hotel.StarRating || 'N/A'} stars`);
        console.log(`      📍 Address: ${hotel.Address}`);
        console.log(`      🏙️ City: ${hotel.City || 'N/A'}`);
        console.log(`      📞 Contact: ${hotel.ContactNumber || 'N/A'}`);
        if (hotel.Facilities && hotel.Facilities.length > 0) {
          console.log(`      🎯 Facilities: ${hotel.Facilities.slice(0, 5).join(', ')}`);
        }
      });
    } else {
      console.log(`   ❌ Failed: ${hotelDetailsResponse.Status.Description}`);
    }

    // Test 5: Get location data for UAE
    console.log('\n5. 🗺️ Getting complete location data for UAE...');
    const locationData = await client.getLocationData('AE');
    
    if (locationData.country) {
      console.log(`   ✅ Country: ${locationData.country.Name} (${locationData.country.Code})`);
      console.log(`   🏙️ Cities: ${locationData.cities.length} total`);
      
      // Show major cities
      const majorCities = locationData.cities.filter(city => 
        ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman'].some(major => 
          city.Name.includes(major)
        )
      );
      
      console.log('   🌆 Major cities:');
      majorCities.forEach(city => {
        console.log(`      ${city.Code}: ${city.Name}`);
      });
    } else {
      console.log('   ❌ Failed to get location data');
    }

    console.log('\n🎉 Utilities test completed!');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  }
}

// Run the test
if (require.main === module) {
  testUtilities();
}

export default testUtilities;