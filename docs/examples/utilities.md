# Utilities Examples

Real-world examples of using the Utilities API for location data and hotel information. All examples are based on our test suite that runs against the live TBO API.

## 🌍 Country List Examples

### Get All Countries

```typescript
import TBOHolidaysSDK from "tbo-holidays-typescript-sdk";

const sdk = new TBOHolidaysSDK();

async function getAllCountries() {
  try {
    const response = await sdk.utilities.getCountryList();
    
    if (response.Status.Code === 200) {
      const countries = sdk.utilities.extractCountries(response);
      
      console.log(`✅ Found ${countries.length} countries`);
      
      // Display first 10 countries
      console.log('📋 First 10 countries:');
      countries.slice(0, 10).forEach(country => {
        console.log(`   ${country.Code}: ${country.Name}`);
      });
      
      return countries;
    } else {
      console.error(`❌ Failed: ${response.Status.Description}`);
      return [];
    }
  } catch (error) {
    console.error('🚫 Error:', error.message);
    return [];
  }
}
```

### Find Popular Countries

```typescript
async function getPopularCountries() {
  const response = await sdk.utilities.getCountryList();
  const popularCountries = sdk.utilities.getPopularCountries(response);
  
  console.log('🌟 Popular countries:');
  popularCountries.forEach(country => {
    console.log(`   ${country.Code}: ${country.Name}`);
  });
  
  return popularCountries;
}

// Expected output:
// 🌟 Popular countries:
//    AU: Australia
//    CA: Canada
//    FR: France
//    DE: Germany
//    IN: India
//    IT: Italy
//    JP: Japan
//    AE: United Arab Emirates
//    GB: United Kingdom
//    US: United States
```

### Search for Specific Country

```typescript
async function findCountry(searchTerm: string) {
  const response = await sdk.utilities.getCountryList();
  const countries = sdk.utilities.extractCountries(response);
  
  const found = countries.filter(country => 
    country.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.Code.toLowerCase() === searchTerm.toLowerCase()
  );
  
  console.log(`🔍 Search results for "${searchTerm}":`)
  found.forEach(country => {
    console.log(`   ${country.Code}: ${country.Name}`);
  });
  
  return found;
}

// Usage examples:
await findCountry('United');    // United States, United Kingdom, United Arab Emirates
await findCountry('AE');        // United Arab Emirates
await findCountry('Emirates');  // United Arab Emirates
```

## 🏙️ City List Examples

### Get Cities for a Country

```typescript
async function getCitiesForCountry(countryCode: string) {
  try {
    const response = await sdk.utilities.getCityList(countryCode);
    
    if (response.Status.Code === 200) {
      const cities = sdk.utilities.extractCities(response);
      
      console.log(`✅ Found ${cities.length} cities in ${countryCode}`);
      
      // Display all cities
      console.log(`📋 ${countryCode} Cities:`);
      cities.forEach(city => {
        console.log(`   ${city.Code}: ${city.Name}`);
      });
      
      return cities;
    } else {
      console.error(`❌ Failed: ${response.Status.Description}`);
      return [];
    }
  } catch (error) {
    console.error('🚫 Error:', error.message);
    return [];
  }
}

// Example: Get UAE cities
const uaeCities = await getCitiesForCountry('AE');

// Expected output:
// ✅ Found 26 cities in AE
// 📋 AE Cities:
//    100765: Abu Dhabi
//    100687: Ajman
//    100812: Al Agah
//    100692: Al Ain
//    151807: Bur Dubai
//    115936: Dubai
//    137741: Sharjah
//    ...
```

### Search Cities by Name

```typescript
async function searchCities(countryCode: string, searchTerm: string) {
  const response = await sdk.utilities.getCityList(countryCode);
  const matchingCities = sdk.utilities.searchCities(response, searchTerm);
  
  console.log(`🔍 Found ${matchingCities.length} cities matching "${searchTerm}":`);
  matchingCities.forEach(city => {
    console.log(`   ${city.Code}: ${city.Name}`);
  });
  
  return matchingCities;
}

// Usage examples:
await searchCities('AE', 'Dubai');     // Bur Dubai, Dubai
await searchCities('AE', 'Abu');       // Abu Dhabi
await searchCities('US', 'New York'); // New York cities
```

### Get Major Cities for Popular Countries

```typescript
async function getMajorCities() {
  const popularCountries = ['AE', 'US', 'GB', 'FR', 'DE'];
  const majorCities = {};
  
  for (const countryCode of popularCountries) {
    try {
      const response = await sdk.utilities.getCityList(countryCode);
      const cities = sdk.utilities.extractCities(response);
      
      // Get first 5 cities as "major" cities
      majorCities[countryCode] = cities.slice(0, 5);
      
      console.log(`🏙️ Major cities in ${countryCode}:`);
      majorCities[countryCode].forEach(city => {
        console.log(`   ${city.Code}: ${city.Name}`);
      });
      console.log('');
      
    } catch (error) {
      console.error(`❌ Failed to get cities for ${countryCode}:`, error.message);
    }
  }
  
  return majorCities;
}
```

## 🏨 Hotel Details Examples

### Get Details for Specific Hotels

```typescript
async function getHotelDetails(hotelCodes: string) {
  try {
    console.log(`🔍 Getting details for: ${hotelCodes}`);
    
    const response = await sdk.utilities.getHotelDetails(hotelCodes);
    
    if (response.Status.Code === 200) {
      const hotels = sdk.utilities.extractHotelDetails(response);
      
      console.log(`✅ Retrieved details for ${hotels.length} hotels:\n`);
      
      hotels.forEach((hotel, index) => {
        console.log(`🏨 ${hotel.HotelName} (${hotel.HotelCode})`);
        console.log(`   ⭐ Rating: ${hotel.StarRating || 'N/A'} stars`);
        console.log(`   📍 Address: ${hotel.HotelAddress}`);
        console.log(`   🏙️ City: ${hotel.CityName || 'N/A'}`);
        console.log(`   📞 Contact: ${hotel.HotelContactNo || 'N/A'}`);
        
        if (hotel.Amenities && hotel.Amenities.length > 0) {
          const amenityNames = hotel.Amenities.map(a => a.Name).join(', ');
          console.log(`   🎯 Amenities: ${amenityNames}`);
        }
        
        console.log(''); // Empty line between hotels
      });
      
      return hotels;
    } else {
      console.error(`❌ Failed: ${response.Status.Description}`);
      return [];
    }
  } catch (error) {
    console.error('🚫 Error:', error.message);
    return [];
  }
}

// Usage examples:
await getHotelDetails("1402689");                    // Single hotel
await getHotelDetails("1402689,1405349,1405355");    // Multiple hotels

// Expected output:
// 🔍 Getting details for: 1402689,1405349,1405355
// ✅ Retrieved details for 3 hotels:
//
// 🏨 The Station Hotel (1402689)
//    ⭐ Rating: N/A stars
//    📍 Address: 14 Staplehurst Road Hither Green, Hither GreenLondon SE13 5NB
//    🏙️ City: N/A
//    📞 Contact: N/A
//
// 🏨 Dog and Fox (1405349)
//    ⭐ Rating: N/A stars
//    📍 Address: 24 Wimbledon High Street, Wimbledon VillageLondon SW19 5EA
//    🏙️ City: N/A
//    📞 Contact: N/A
```

### Compare Hotel Features

```typescript
async function compareHotels(hotelCodes: string[]) {
  const comparison = [];
  
  for (const code of hotelCodes) {
    const response = await sdk.utilities.getHotelDetails(code);
    if (response.Status.Code === 200) {
      const hotels = sdk.utilities.extractHotelDetails(response);
      if (hotels.length > 0) {
        comparison.push(hotels[0]);
      }
    }
  }
  
  console.log('🔄 Hotel Comparison:');
  console.log('='.repeat(80));
  
  comparison.forEach(hotel => {
    console.log(`🏨 ${hotel.HotelName}`);
    console.log(`   Code: ${hotel.HotelCode}`);
    console.log(`   Stars: ${hotel.StarRating || 'Not rated'}`);
    console.log(`   Location: ${hotel.HotelAddress}`);
    console.log(`   Amenities: ${hotel.Amenities?.length || 0} available`);
    console.log('-'.repeat(40));
  });
  
  return comparison;
}

// Usage:
await compareHotels(['1402689', '1405349', '1405355']);
```

## 🗺️ Complete Location Data Example

### Get Complete Location Hierarchy

```typescript
async function getCompleteLocationData(countryCode: string) {
  console.log(`🗺️ Getting complete location data for ${countryCode}...\n`);
  
  try {
    // 1. Get country information
    const countryResponse = await sdk.utilities.getCountryList();
    const countries = sdk.utilities.extractCountries(countryResponse);
    const country = countries.find(c => c.Code === countryCode);
    
    if (!country) {
      console.log(`❌ Country ${countryCode} not found`);
      return null;
    }
    
    console.log(`✅ Country: ${country.Name} (${country.Code})`);
    
    // 2. Get cities for the country
    const cityResponse = await sdk.utilities.getCityList(countryCode);
    
    if (cityResponse.Status.Code === 200) {
      const cities = sdk.utilities.extractCities(cityResponse);
      console.log(`🏙️ Cities: ${cities.length} total`);
      
      // Show major cities (first 5)
      console.log('🌆 Major cities:');
      cities.slice(0, 5).forEach(city => {
        console.log(`   ${city.Code}: ${city.Name}`);
      });
      
      const locationData = {
        country: country,
        cities: cities,
        totalCities: cities.length
      };
      
      return locationData;
      
    } else {
      console.log(`❌ Failed to get cities: ${cityResponse.Status.Description}`);
      return null;
    }
    
  } catch (error) {
    console.error('🚫 Error:', error.message);
    return null;
  }
}

// Usage examples:
await getCompleteLocationData('AE');  // United Arab Emirates
await getCompleteLocationData('US');  // United States  
await getCompleteLocationData('GB');  // United Kingdom

// Expected output for UAE:
// 🗺️ Getting complete location data for AE...
//
// ✅ Country: United Arab Emirates (AE)
// 🏙️ Cities: 26 total
// 🌆 Major cities:
//    100765: Abu Dhabi
//    100687: Ajman
//    151807: Bur Dubai
//    115936: Dubai
//    137741: Sharjah
```

## 🧪 Complete Utilities Test Suite

This example replicates our `npm run test:utilities` test suite:

```typescript
async function completeUtilitiesTest() {
  console.log('🌍 TBO Holidays API - Utilities Test\n');
  
  const sdk = new TBOHolidaysSDK();
  
  try {
    // Test 1: Country List
    console.log('1. 📍 Testing Country List...');
    const countriesResponse = await sdk.utilities.getCountryList();
    
    if (countriesResponse.Status.Code === 200) {
      const countries = sdk.utilities.extractCountries(countriesResponse);
      console.log(`   ✅ Found ${countries.length} countries`);
      
      // Show first 10
      console.log('   📋 First 10 countries:');
      countries.slice(0, 10).forEach(country => {
        console.log(`      ${country.Code}: ${country.Name}`);
      });
      
      // Show popular countries
      const popular = sdk.utilities.getPopularCountries(countriesResponse);
      console.log('\n   🌟 Popular countries:');
      popular.forEach(country => {
        console.log(`      ${country.Code}: ${country.Name}`);
      });
    } else {
      console.log(`   ❌ Failed: ${countriesResponse.Status.Description}`);
    }
    
    // Test 2: UAE Cities
    console.log('\n2. 🏙️ Testing City List for UAE...');
    const citiesResponse = await sdk.utilities.getCityList('AE');
    
    if (citiesResponse.Status.Code === 200) {
      const cities = sdk.utilities.extractCities(citiesResponse);
      console.log(`   ✅ Found ${cities.length} cities in UAE`);
      
      console.log('   📋 UAE Cities:');
      cities.slice(0, 10).forEach(city => {
        console.log(`      ${city.Code}: ${city.Name}`);
      });
    } else {
      console.log(`   ❌ Failed: ${citiesResponse.Status.Description}`);
    }
    
    // Test 3: Search Dubai Cities
    console.log('\n3. 🔍 Searching for Dubai cities...');
    const dubaiCities = sdk.utilities.searchCities(citiesResponse, 'Dubai');
    console.log(`   ✅ Found ${dubaiCities.length} Dubai cities:`);
    dubaiCities.forEach(city => {
      console.log(`      ${city.Code}: ${city.Name}`);
    });
    
    // Test 4: Hotel Details
    console.log('\n4. 🏨 Testing Hotel Details...');
    const sampleHotels = '1402689,1405349,1405355';
    console.log(`   🔍 Getting details for: ${sampleHotels}`);
    
    const hotelResponse = await sdk.utilities.getHotelDetails(sampleHotels);
    
    if (hotelResponse.Status.Code === 200) {
      const hotels = sdk.utilities.extractHotelDetails(hotelResponse);
      console.log(`   ✅ Retrieved details for ${hotels.length} hotels:`);
      
      hotels.forEach(hotel => {
        console.log(`\n   🏨 ${hotel.HotelName} (${hotel.HotelCode})`);
        console.log(`      ⭐ Rating: ${hotel.StarRating || 'N/A'} stars`);
        console.log(`      📍 Address: ${hotel.HotelAddress}`);
        console.log(`      🏙️ City: ${hotel.CityName || 'N/A'}`);
        console.log(`      📞 Contact: ${hotel.HotelContactNo || 'N/A'}`);
      });
    } else {
      console.log(`   ❌ Failed: ${hotelResponse.Status.Description}`);
    }
    
    // Test 5: Complete Location Data
    console.log('\n5. 🗺️ Getting complete location data for UAE...');
    const locationData = await getCompleteLocationData('AE');
    
    if (locationData) {
      console.log(`   ✅ Country: ${locationData.country.Name} (${locationData.country.Code})`);
      console.log(`   🏙️ Cities: ${locationData.totalCities} total`);
      console.log('   🌆 Major cities:');
      locationData.cities.slice(0, 5).forEach(city => {
        console.log(`      ${city.Code}: ${city.Name}`);
      });
    }
    
    console.log('\n🎉 Utilities test completed!');
    
  } catch (error) {
    console.error('🚫 Test failed:', error.message);
  }
}

// Run the complete test
completeUtilitiesTest();
```

## 🔗 Related Examples

- [Hotel Search Examples](./search.md) - Use city codes for searches
- [Quick Start Guide](./quickstart.md) - Basic SDK usage
- [Complete Booking Flow](./booking-flow.md) - End-to-end process