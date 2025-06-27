/**
 * Simple API connectivity test - matching Python approach exactly
 */

import 'dotenv/config';
import axios from 'axios';

async function simpleTest() {
  console.log('🔍 Simple TBO API Test - Python Style\n');
  
  const baseURL = process.env.TBO_BASE_URL || 'http://api.tbotechnology.in/TBOHolidays_HotelAPI';
  const auth = {
    username: process.env.TBO_USERNAME || 'your-username',
    password: process.env.TBO_PASSWORD || 'your-password'
  };

  if (!process.env.TBO_USERNAME || !process.env.TBO_PASSWORD) {
    console.log('⚠️  Using placeholder credentials. Set TBO_USERNAME and TBO_PASSWORD environment variables for actual testing.');
  }
  
  // Test 1: Country List (GET request with Basic Auth like Python)
  console.log('1. Testing CountryList with Basic Auth...');
  try {
    const response = await axios.get(`${baseURL}/CountryList`, {
      auth: auth,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    console.log(`   Status: ${response.status}`);
    console.log(`   Response Code: ${response.data?.Status?.Code}`);
    console.log(`   Description: ${response.data?.Status?.Description}`);
    if (response.data?.CountryList) {
      console.log(`   ✅ Found ${response.data.CountryList.length} countries`);
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 2: Hotel Search (POST request with Basic Auth)
  console.log('\n2. Testing Hotel Search with Basic Auth...');
  try {
    const searchData = {
      CheckIn: '2025-07-24',
      CheckOut: '2025-07-25',
      GuestNationality: 'AE',
      PaxRooms: [{ Adults: 1, Children: 0, ChildrenAges: [] }],
      HotelCodes: '1402689,1405349,1405355',
      ResponseTime: 20.0,
      IsDetailedResponse: true,
      Filters: { Refundable: false, NoOfRooms: 0, MealType: 'All' }
    };

    const response = await axios.post(`${baseURL}/search`, searchData, {
      auth: auth,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response Code: ${response.data?.Status?.Code}`);
    console.log(`   Description: ${response.data?.Status?.Description}`);
    if (response.data?.HotelResult) {
      console.log(`   ✅ Found ${response.data.HotelResult.length} hotels`);
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
    if (error.response) {
      console.log(`   Response: ${error.response.data?.Status?.Description || error.response.statusText}`);
    }
  }

  // Test 3: Hotel Details with Basic Auth
  console.log('\n3. Testing Hotel Details with Basic Auth...');
  try {
    const response = await axios.post(`${baseURL}/Hoteldetails`, {
      Hotelcodes: '1402689',
      Language: 'en'
    }, {
      auth: auth,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response Code: ${response.data?.Status?.Code}`);
    console.log(`   Description: ${response.data?.Status?.Description}`);
    if (response.data?.HotelDetails) {
      console.log(`   ✅ Found ${response.data.HotelDetails.length} hotel details`);
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
    if (error.response) {
      console.log(`   Response: ${error.response.data?.Status?.Description || error.response.statusText}`);
    }
  }

  console.log('\n🎉 Simple test completed!');
}

simpleTest();