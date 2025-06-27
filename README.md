# TBO Holidays Hotel API - TypeScript SDK

[![GitHub](https://img.shields.io/badge/GitHub-first--to--fly%2Ftbo--typescript--sdk-blue?logo=github)](https://github.com/first-to-fly/tbo-typescript-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A comprehensive TypeScript SDK for integrating with the TBO Holidays Hotel API, featuring full type safety, modern async/await patterns, and production-ready error handling.

## 📚 Documentation

**[👉 Complete Documentation](./docs/README.md)** - Comprehensive guides, API reference, and examples

### Quick Links
- [🚀 Quick Start Guide](./docs/examples/quickstart.md) - Get started in 5 minutes
- [📊 API Overview](./docs/api/overview.md) - All endpoints and status codes
- [🔍 Hotel Search API](./docs/api/search.md) - Search hotels with examples
- [🌍 Utilities API](./docs/api/utilities.md) - Countries, cities, hotel details
- [🔒 PreBook API](./docs/api/prebook.md) - Booking verification
- [🎯 Complete Booking Flow](./docs/examples/booking-flow.md) - End-to-end example

## 🚀 Quick Start

### Installation

Since this package is not yet published to npm, you can install it directly from GitHub:

```bash
# Install from GitHub
npm install https://github.com/first-to-fly/tbo-typescript-sdk

# Or using yarn
yarn add https://github.com/first-to-fly/tbo-typescript-sdk

# Or using pnpm
pnpm add https://github.com/first-to-fly/tbo-typescript-sdk
```

**Note**: After installation, you may need to build the TypeScript files:

```bash
# Navigate to the installed package and build
cd node_modules/tbo-holidays-typescript-sdk
npm run build
```

Or if you prefer to use the TypeScript files directly with ts-node or a bundler that supports TypeScript.

### Development Setup

If you want to clone and develop the SDK locally:

```bash
# Clone the repository
git clone https://github.com/first-to-fly/tbo-typescript-sdk.git
cd tbo-typescript-sdk

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
import TBOHolidaysSDK from "tbo-holidays-typescript-sdk";

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
import TBOHolidaysSDK from "tbo-holidays-typescript-sdk";

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
