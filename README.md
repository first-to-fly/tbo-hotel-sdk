# TBO Holidays Hotel API - TypeScript SDK

A comprehensive TypeScript SDK for integrating with the TBO Holidays Hotel API, featuring full type safety, modern async/await patterns, and production-ready error handling.

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env file with your TBO API credentials

# Run tests
npm run test
npm run test:utilities
npm run test:search
```

### Basic Usage

```typescript
import TBOHolidaysSDK from "./src/index";

// Initialize SDK
const sdk = new TBOHolidaysSDK();

// Search for hotels
const { checkIn, checkOut } = sdk.search.getTestDates(30, 1);
const searchResponse = await sdk.search.searchSingleRoom(
  checkIn,
  checkOut,
  2, // adults
  0, // children
  [], // children ages
  "AE", // guest nationality
  sdk.search.getSampleHotelCodes(5)
);

console.log(`Found ${searchResponse.HotelResult?.length || 0} hotels`);
```

## 📁 Project Structure

```
src/
├── types/
│   └── api-types.ts          # Complete TypeScript type definitions
├── clients/
│   ├── base-client.ts        # Base HTTP client with auth & retry logic
│   ├── hotel-search-client.ts # Hotel search functionality
│   ├── utilities-client.ts   # Countries, cities, hotel details
│   └── prebook-client.ts     # Pre-booking verification
├── examples/
│   ├── utilities.ts          # Utilities API examples
│   └── hotel-search.ts       # Hotel search examples
├── test.ts                   # Comprehensive test suite
└── index.ts                  # Main SDK export
```

## 🎯 Key Features

### ✅ **Full Type Safety**

- Complete TypeScript type definitions for all API endpoints
- Intellisense and autocomplete support
- Compile-time error checking

### ✅ **Modern Architecture**

- Async/await patterns throughout
- Promise-based API calls
- Modular client design

### ✅ **Production Ready**

- Automatic retry with exponential backoff
- Comprehensive error handling
- Request/response logging
- HTTP Basic Auth support

## 🧪 Testing

### Run Individual Tests

```bash
# Test utilities APIs
npm run test:utilities

# Test hotel search
npm run test:search

# Run comprehensive test suite
npm run test
```

### Test Results Expected

✅ **Countries**: 137+ countries available  
✅ **Cities**: Thousands of cities by country  
✅ **Hotel Search**: Real-time availability  
✅ **Hotel Details**: Comprehensive information  
✅ **PreBook**: Availability verification

## 📊 API Endpoints Covered

| Endpoint            | Client            | Status      | Description               |
| ------------------- | ----------------- | ----------- | ------------------------- |
| `/search`           | HotelSearchClient | ✅ Complete | Hotel availability search |
| `/PreBook`          | PreBookClient     | ✅ Complete | Booking verification      |
| `/CountryList`      | UtilitiesClient   | ✅ Complete | Get all countries         |
| `/CityList`         | UtilitiesClient   | ✅ Complete | Get cities by country     |
| `/Hoteldetails`     | UtilitiesClient   | ✅ Complete | Hotel information         |
| `/hotelcodelist`    | UtilitiesClient   | ✅ Complete | All hotel codes           |
| `/TBOHotelCodeList` | UtilitiesClient   | ✅ Complete | Hotels by city            |

## 🔐 Authentication

The SDK handles authentication automatically:

```typescript
// Default staging credentials
const sdk = new TBOHolidaysSDK();

// Custom credentials
const sdk = new TBOHolidaysSDK({
  baseURL: "your-api-url",
  username: "your-username",
  password: "your-password",
  timeout: 30000,
  retries: 3,
});
```

## 🌟 Complete Booking Flow Example

```typescript
import TBOHolidaysSDK from "./src/index";

async function bookHotel() {
  const sdk = new TBOHolidaysSDK();

  // 1. Search for hotels
  const { checkIn, checkOut } = sdk.search.getTestDates(30, 1);
  const searchResponse = await sdk.search.searchSingleRoom(
    checkIn,
    checkOut,
    1,
    0,
    [],
    "AE",
    sdk.search.getSampleHotelCodes(5)
  );

  if (searchResponse.Status.Code === 200) {
    // 2. Get booking codes
    const bookingCodes = sdk.search.extractBookingCodes(searchResponse);

    if (bookingCodes.length > 0) {
      // 3. PreBook verification
      const preBookResponse = await sdk.preBook.preBookHotel(
        bookingCodes[0],
        "Limit"
      );

      if (preBookResponse.Status.Code === 200) {
        const info = sdk.preBook.extractPreBookInfo(preBookResponse);
        console.log(
          `Ready to book: ${info.hotelName} for ${info.totalFare} ${info.currency}`
        );

        // 4. Proceed with actual booking...
      }
    }
  }
}
```

## 🔧 Configuration Options

```typescript
interface TBOClientConfig {
  baseURL?: string; // API base URL
  username?: string; // API username
  password?: string; // API password
  timeout?: number; // Request timeout (ms)
  retries?: number; // Retry attempts
}
```

## 🚦 Error Handling

The SDK provides comprehensive error handling:

```typescript
try {
  const response = await sdk.search.searchSingleRoom(...);
} catch (error: TBOError) {
  console.error('API Error:', error.message);
  console.error('Status Code:', error.code);
  console.error('Response:', error.response);
}
```

## 🔐 API Credentials

To use this SDK, you'll need to obtain API credentials from TBO Technology:

1. **Visit**: [TBO Technology Website](https://www.tbotechnology.in/)
2. **Register**: Create an account for API access
3. **Get Credentials**: Obtain your API username, password, and service URL
4. **Environment**: Choose between staging/test and production environments

Configure your credentials when initializing the SDK:

```typescript
const sdk = new TBOHolidaysSDK({
  baseURL: "your-api-service-url",
  username: "your-api-username",
  password: "your-api-password",
  timeout: 30000,
  retries: 3,
});
```
