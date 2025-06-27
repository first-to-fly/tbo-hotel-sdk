# TBO Holidays TypeScript SDK Documentation

Welcome to the comprehensive documentation for the TBO Holidays TypeScript SDK. This documentation provides detailed examples, API references, and guides to help you integrate hotel booking functionality into your applications.

## 📚 Documentation Structure

### API Reference
- [**API Overview**](./api/overview.md) - Complete API endpoint reference with status codes
- [**Utilities API**](./api/utilities.md) - Countries, cities, and hotel details
- [**Hotel Search API**](./api/search.md) - Hotel availability and room search
- [**PreBook API**](./api/prebook.md) - Booking verification and preparation

### Examples
- [**Quick Start Guide**](./examples/quickstart.md) - Get started in 5 minutes
- [**Utilities Examples**](./examples/utilities.md) - Country/city lists and hotel details
- [**Search Examples**](./examples/search.md) - Hotel search with various filters
- [**Complete Booking Flow**](./examples/booking-flow.md) - End-to-end booking process

### Guides
- [**Authentication**](./guides/authentication.md) - API credentials and configuration
- [**Error Handling**](./guides/error-handling.md) - Comprehensive error management
- [**TypeScript Integration**](./guides/typescript.md) - Type safety and IntelliSense
- [**Testing**](./guides/testing.md) - Testing your integration

## 🚀 Quick Navigation

| What do you want to do? | Go to |
|------------------------|-------|
| Get started quickly | [Quick Start Guide](./examples/quickstart.md) |
| See all available APIs | [API Overview](./api/overview.md) |
| Search for hotels | [Hotel Search API](./api/search.md) |
| Get country/city lists | [Utilities API](./api/utilities.md) |
| Understand booking flow | [Complete Booking Flow](./examples/booking-flow.md) |
| Handle errors properly | [Error Handling Guide](./guides/error-handling.md) |

## 📊 Live Test Results

The SDK has been tested with real TBO API endpoints:

- ✅ **137 Countries** available via CountryList API
- ✅ **26 UAE Cities** including Dubai, Abu Dhabi, Sharjah  
- ✅ **Hotel Search** returning real availability and pricing
- ✅ **Hotel Details** with comprehensive property information
- ✅ **PreBook** verification for booking preparation
- ✅ **Price Range** from $904.45 - $1,253.05 USD for sample searches

## 🛠️ SDK Features Covered

### Core Functionality
- **Hotel Search** - Real-time availability with flexible date ranges
- **Location Services** - Complete country and city databases
- **Hotel Information** - Detailed property data and amenities
- **Booking Preparation** - PreBook verification before payment

### Developer Experience  
- **Full TypeScript Support** - Complete type definitions and IntelliSense
- **Error Handling** - Comprehensive error types and handling patterns
- **Async/Await** - Modern JavaScript patterns throughout
- **Request/Response Logging** - Debug-friendly API interaction tracking

### Production Ready
- **Authentication** - Secure HTTP Basic Auth implementation  
- **Retry Logic** - Automatic retry with exponential backoff
- **Environment Configuration** - Flexible staging/production setup
- **Comprehensive Testing** - All endpoints tested and verified

## 📝 Examples From Test Suites

All examples in this documentation are derived from our comprehensive test suites:

- **`npm run test:simple`** - Basic API connectivity tests
- **`npm run test:utilities`** - Countries, cities, and hotel details  
- **`npm run test:search`** - Hotel search with various parameters
- **`npm run test`** - Complete SDK functionality verification

Each test demonstrates real API calls with actual request/response data, ensuring all examples work with the live TBO API.