# Utilities API

The Utilities API provides access to location data (countries, cities) and hotel information. This is typically the first API you'll use to get reference data for hotel searches.

## 🌍 CountryList API

Get a list of all supported countries.

### Endpoint
- **URL**: `/CountryList`
- **Method**: `GET`
- **Authentication**: HTTP Basic Auth

### Usage

```typescript
import TBOHolidaysSDK from "tbo-holidays-typescript-sdk";

const sdk = new TBOHolidaysSDK();

// Get all countries
const response = await sdk.utilities.getCountryList();

// Extract countries array
const countries = sdk.utilities.extractCountries(response);

// Find popular countries
const popularCountries = sdk.utilities.getPopularCountries(response);
```

### Request Example

```http
GET /CountryList HTTP/1.1
Host: api.tbotechnology.in
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
Content-Type: application/json
Accept: application/json
```

### Response Example

```json
{
  "Status": {
    "Code": 200,
    "Description": "Success"
  },
  "CountryList": [
    {
      "Code": "AE",
      "Name": "United Arab Emirates"
    },
    {
      "Code": "US", 
      "Name": "United States"
    },
    {
      "Code": "GB",
      "Name": "United Kingdom"
    }
  ]
}
```

### Response Types

```typescript
interface CountryListResponse {
  Status: {
    Code: number;
    Description: string;
  };
  CountryList: Country[];
}

interface Country {
  Code: string;    // ISO country code (e.g., "AE", "US")
  Name: string;    // Full country name
}
```

### Test Results
- ✅ **137 countries** available
- ✅ Includes all major destinations (US, UK, AE, IN, etc.)
- ✅ Standard ISO country codes

---

## 🏙️ CityList API

Get cities for a specific country.

### Endpoint
- **URL**: `/CityList`
- **Method**: `POST`
- **Authentication**: HTTP Basic Auth

### Usage

```typescript
// Get cities for UAE
const cityResponse = await sdk.utilities.getCityList('AE');

// Extract cities array
const cities = sdk.utilities.extractCities(cityResponse);

// Search for specific cities
const dubaiCities = sdk.utilities.searchCities(cityResponse, 'Dubai');
```

### Request Example

```http
POST /CityList HTTP/1.1
Host: api.tbotechnology.in
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
Content-Type: application/json

{
  "CountryCode": "AE"
}
```

### Response Example

```json
{
  "Status": {
    "Code": 200,
    "Description": "Success"
  },
  "CityList": [
    {
      "Code": "151807",
      "Name": "Bur Dubai"
    },
    {
      "Code": "115936", 
      "Name": "Dubai"
    },
    {
      "Code": "100765",
      "Name": "Abu Dhabi"
    }
  ]
}
```

### Response Types

```typescript
interface CityListResponse {
  Status: {
    Code: number;
    Description: string;
  };
  CityList: City[];
}

interface City {
  Code: string;    // City code for API calls
  Name: string;    // City name
}
```

### Test Results for UAE
- ✅ **26 cities** available
- ✅ Major cities: Dubai, Abu Dhabi, Sharjah
- ✅ Tourist areas: Bur Dubai, Deira, Al Ain

---

## 🏨 Hotel Details API

Get detailed information about specific hotels.

### Endpoint
- **URL**: `/Hoteldetails`
- **Method**: `POST`
- **Authentication**: HTTP Basic Auth

### Usage

```typescript
// Get details for specific hotels
const hotelCodes = "1402689,1405349,1405355";
const detailsResponse = await sdk.utilities.getHotelDetails(hotelCodes);

// Extract hotel details
const hotels = sdk.utilities.extractHotelDetails(detailsResponse);

// Process each hotel
hotels.forEach(hotel => {
  console.log(`${hotel.HotelName} - ${hotel.StarRating} stars`);
  console.log(`Address: ${hotel.HotelAddress}`);
});
```

### Request Example

```http
POST /Hoteldetails HTTP/1.1
Host: api.tbotechnology.in
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
Content-Type: application/json

{
  "Hotelcodes": "1402689,1405349,1405355",
  "Language": "en"
}
```

### Response Example

```json
{
  "Status": {
    "Code": 200,
    "Description": "Successful"
  },
  "HotelDetails": [
    {
      "HotelCode": "1402689",
      "HotelName": "The Station Hotel",
      "StarRating": 0,
      "HotelAddress": "14 Staplehurst Road Hither Green, Hither GreenLondon SE13 5NB",
      "HotelContactNo": "",
      "HotelDescription": "Located in London...",
      "Amenities": [
        {
          "Id": "1",
          "Name": "Air Conditioning"
        }
      ]
    }
  ]
}
```

### Response Types

```typescript
interface HotelDetailsResponse {
  Status: {
    Code: number;
    Description: string;
  };
  HotelDetails: HotelDetail[];
}

interface HotelDetail {
  HotelCode: string;
  HotelName: string;
  StarRating: number;
  HotelAddress: string;
  HotelContactNo: string;
  HotelDescription: string;
  Amenities: Amenity[];
}

interface Amenity {
  Id: string;
  Name: string;
}
```

---

## 🏨 Hotel Code List APIs

Get hotel codes for booking searches.

### All Hotel Codes

```typescript
// Get all hotel codes (large response)
const allHotels = await sdk.utilities.getAllHotelCodes();
```

### Hotels by City

```typescript
// Get hotels in specific city
const dubaiHotels = await sdk.utilities.getHotelsByCity("115936"); // Dubai city code
```

---

## 🧪 Complete Utilities Test Example

This example demonstrates all utilities APIs working together:

```typescript
async function testUtilities() {
  const sdk = new TBOHolidaysSDK();
  
  // 1. Get all countries
  console.log('1. Getting countries...');
  const countries = await sdk.utilities.getCountryList();
  const countryList = sdk.utilities.extractCountries(countries);
  console.log(`✅ Found ${countryList.length} countries`);
  
  // 2. Find UAE
  const uae = countryList.find(c => c.Code === 'AE');
  if (uae) {
    console.log(`🇦🇪 Found: ${uae.Name}`);
    
    // 3. Get UAE cities  
    console.log('2. Getting UAE cities...');
    const cities = await sdk.utilities.getCityList('AE');
    const cityList = sdk.utilities.extractCities(cities);
    console.log(`✅ Found ${cityList.length} cities`);
    
    // 4. Find Dubai
    const dubai = cityList.find(c => c.Name.includes('Dubai'));
    if (dubai) {
      console.log(`🏙️ Found Dubai: ${dubai.Name} (${dubai.Code})`);
    }
  }
  
  // 5. Get hotel details
  console.log('3. Getting hotel details...');
  const sampleHotels = "1402689,1405349,1405355";
  const hotelDetails = await sdk.utilities.getHotelDetails(sampleHotels);
  const hotels = sdk.utilities.extractHotelDetails(hotelDetails);
  
  console.log(`✅ Retrieved ${hotels.length} hotel details:`);
  hotels.forEach(hotel => {
    console.log(`  🏨 ${hotel.HotelName}`);
    console.log(`     📍 ${hotel.HotelAddress}`);
    console.log(`     ⭐ ${hotel.StarRating} stars`);
  });
}
```

### Expected Output

```
1. Getting countries...
✅ Found 137 countries
🇦🇪 Found: United Arab Emirates

2. Getting UAE cities...
✅ Found 26 cities
🏙️ Found Dubai: Bur Dubai (151807)

3. Getting hotel details...
✅ Retrieved 3 hotel details:
  🏨 The Station Hotel
     📍 14 Staplehurst Road Hither Green, Hither GreenLondon SE13 5NB
     ⭐ 0 stars
  🏨 Dog and Fox
     📍 24 Wimbledon High Street, Wimbledon VillageLondon SW19 5EA
     ⭐ 0 stars
  🏨 Premier Inn London Hackney
     📍 25 27 Dalston Place, HackneyLondon E8 3DF
     ⭐ 0 stars
```

## 🚦 Error Handling

```typescript
try {
  const countries = await sdk.utilities.getCountryList();
  
  if (countries.Status.Code !== 200) {
    console.error(`API Error: ${countries.Status.Description}`);
    return;
  }
  
  // Process successful response
  const countryList = sdk.utilities.extractCountries(countries);
  
} catch (error) {
  console.error('Network or other error:', error.message);
}
```

## 🔗 Related Documentation

- [Hotel Search API](./search.md) - Use city codes for hotel searches
- [Quick Start Guide](../examples/quickstart.md) - Complete workflow
- [Error Handling](../guides/error-handling.md) - Comprehensive error management