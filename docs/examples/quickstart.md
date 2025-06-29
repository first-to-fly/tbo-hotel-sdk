# Quick Start Guide

Get up and running with the TBO Holidays TypeScript SDK in 5 minutes. This guide walks you through installation, setup, and your first hotel search.

## 🚀 Installation

### From GitHub

```bash
# Install directly from GitHub
npm install https://github.com/first-to-fly/tbo-hotel-sdk

# Or using yarn
yarn add https://github.com/first-to-fly/tbo-hotel-sdk

# Or using pnpm
pnpm add https://github.com/first-to-fly/tbo-hotel-sdk
```

### Build TypeScript (if needed)

```bash
# Navigate to the package and build
cd node_modules/tbo-hotel-sdk
npm run build
```

## 🔐 Setup Credentials

### 1. Get TBO API Credentials

Visit [TBO Technology](https://www.tbotechnology.in/) to obtain:
- API Username
- API Password  
- Service URL

### 2. Configure Environment

Create a `.env` file in your project root:

```env
# TBO API Configuration
TBO_BASE_URL=http://api.tbotechnology.in/TBOHolidays_HotelAPI
TBO_USERNAME=your-api-username
TBO_PASSWORD=your-api-password
TBO_TIMEOUT=30000
TBO_RETRIES=3
```

### 3. Load Environment Variables

```typescript
import 'dotenv/config'; // Load .env file
import TBOHolidaysSDK from "tbo-hotel-sdk";
```

## 🏨 Your First Hotel Search

### Basic Search Example

```typescript
import 'dotenv/config';
import TBOHolidaysSDK from "tbo-hotel-sdk";

async function quickStart() {
  console.log('🚀 TBO SDK Quick Start\n');
  
  // Initialize SDK (uses environment variables)
  const sdk = new TBOHolidaysSDK();
  
  try {
    // 1. Test connection
    console.log('1. Testing API connection...');
    const connectionTest = await sdk.testConnection();
    
    if (!connectionTest.connected) {
      console.log('❌ Connection failed:', connectionTest.errors);
      return;
    }
    console.log('✅ Connected to TBO API');
    
    // 2. Get countries
    console.log('\n2. Getting countries...');
    const countries = await sdk.utilities.getCountryList();
    const countryList = sdk.utilities.extractCountries(countries);
    console.log(`✅ Found ${countryList.length} countries`);
    
    // 3. Search hotels
    console.log('\n3. Searching hotels...');
    const { checkIn, checkOut } = sdk.search.getTestDates(30, 1);
    console.log(`📅 Dates: ${checkIn} to ${checkOut}`);
    
    const searchResponse = await sdk.search.searchSingleRoom(
      checkIn,        // Check-in date
      checkOut,       // Check-out date
      2,              // Adults
      0,              // Children
      [],             // Children ages
      "AE",           // Guest nationality (UAE)
      sdk.search.getSampleHotelCodes(5) // Sample hotel codes
    );
    
    console.log(`📊 Search Status: ${searchResponse.Status.Code} - ${searchResponse.Status.Description}`);
    
    if (searchResponse.Status.Code === 200) {
      const summary = sdk.search.getSearchSummary(searchResponse);
      console.log(`✅ Found ${summary.totalHotels} hotels with ${summary.totalRooms} rooms`);
      
      if (summary.priceRange) {
        console.log(`💰 Price range: ${summary.priceRange.min} - ${summary.priceRange.max} ${summary.priceRange.currency}`);
      }
      
      // 4. Get booking codes for next step
      const bookingCodes = sdk.search.extractBookingCodes(searchResponse);
      console.log(`🎫 Booking codes available: ${bookingCodes.length}`);
      
      console.log('\n🎉 Quick start completed successfully!');
      console.log('💡 Next: Try PreBook with one of the booking codes');
      
    } else if (searchResponse.Status.Code === 201) {
      console.log('ℹ️ No rooms available for the search criteria');
    } else {
      console.log(`❌ Search failed: ${searchResponse.Status.Description}`);
    }
    
  } catch (error) {
    console.error('🚫 Error:', error.message);
  }
}

// Run the quick start
quickStart();
```

### Expected Output

```
🚀 TBO SDK Quick Start

1. Testing API connection...
✅ Connected to TBO API

2. Getting countries...
✅ Found 137 countries

3. Searching hotels...
📅 Dates: 2025-07-27 to 2025-07-28
📊 Search Status: 200 - Successful
✅ Found 1 hotels with 5 rooms
💰 Price range: 904.45 - 1253.05 USD
🎫 Booking codes available: 5

🎉 Quick start completed successfully!
💡 Next: Try PreBook with one of the booking codes
```

## 🔧 Configuration Options

### Custom Configuration

```typescript
// Custom SDK configuration
const sdk = new TBOHolidaysSDK({
  baseURL: "your-custom-api-url",
  username: "your-username",
  password: "your-password",
  timeout: 30000,
  retries: 3
});
```

### Environment Variables

```env
# All available environment variables
TBO_BASE_URL=http://api.tbotechnology.in/TBOHolidays_HotelAPI
TBO_USERNAME=your-username
TBO_PASSWORD=your-password
TBO_TIMEOUT=30000
TBO_RETRIES=3
TBO_LOG_LEVEL=info
TBO_LOG_REQUESTS=true
TBO_LOG_RESPONSES=false
```

## 🧪 Run Test Suites

The SDK comes with comprehensive test suites you can run:

### Simple Test
```bash
npm run test:simple
```
Tests basic API connectivity with sample requests.

### Utilities Test
```bash
npm run test:utilities
```
Tests country lists, city lists, and hotel details.

### Search Test
```bash
npm run test:search
```
Tests hotel search functionality with various parameters.

### Comprehensive Test
```bash
npm run test
```
Runs all SDK functionality tests.

## 📚 Next Steps

### Learn the APIs
- [Utilities API](../api/utilities.md) - Countries, cities, hotel details
- [Hotel Search API](../api/search.md) - Search hotels and rooms
- [PreBook API](../api/prebook.md) - Verify bookings before payment

### See Examples
- [Utilities Examples](./utilities.md) - Location and hotel data
- [Search Examples](./search.md) - Various search scenarios
- [Complete Booking Flow](./booking-flow.md) - End-to-end booking

### Advanced Topics
- [Error Handling](../guides/error-handling.md) - Handle API errors properly
- [TypeScript Integration](../guides/typescript.md) - Full type safety
- [Testing Guide](../guides/testing.md) - Test your integration

## ⚡ Common Use Cases

### Get Countries and Cities

```typescript
const sdk = new TBOHolidaysSDK();

// Get all countries
const countries = await sdk.utilities.getCountryList();
const countryList = sdk.utilities.extractCountries(countries);

// Get cities for a country
const cities = await sdk.utilities.getCityList('AE'); // UAE
const cityList = sdk.utilities.extractCities(cities);

// Find Dubai
const dubai = cityList.find(city => city.Name.includes('Dubai'));
```

### Search Hotels by Date

```typescript
// Search for next month
const { checkIn, checkOut } = sdk.search.getTestDates(30, 2); // 30 days out, 2 nights

const searchResponse = await sdk.search.searchSingleRoom(
  checkIn,
  checkOut, 
  2,        // adults
  1,        // children
  [8],      // child age 8
  "US",     // nationality
  "1402689,1405349" // hotel codes
);
```

### Check Hotel Details

```typescript
// Get detailed hotel information
const hotelDetails = await sdk.utilities.getHotelDetails("1402689,1405349");
const hotels = sdk.utilities.extractHotelDetails(hotelDetails);

hotels.forEach(hotel => {
  console.log(`${hotel.HotelName} - ${hotel.StarRating} stars`);
  console.log(`Address: ${hotel.HotelAddress}`);
});
```

## 🚦 Troubleshooting

### Common Issues

**"Access Credentials is incorrect"**
- Check TBO_USERNAME and TBO_PASSWORD in .env
- Verify credentials with TBO Technology

**"getaddrinfo ENOTFOUND"**
- Check TBO_BASE_URL is correct
- Verify internet connectivity

**"No Available rooms"**
- Try different dates (further in future)
- Use different hotel codes
- Check guest nationality requirements

### Debug Mode

Enable detailed logging:

```env
TBO_LOG_REQUESTS=true
TBO_LOG_RESPONSES=true
TBO_LOG_LEVEL=debug
```

This will show all API requests and responses for debugging.

## 🎯 You're Ready!

You now have:
- ✅ SDK installed and configured
- ✅ API credentials working
- ✅ First hotel search completed
- ✅ Understanding of basic workflow

Continue with the [API documentation](../api/overview.md) to explore all available features!