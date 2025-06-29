# API Overview

This document provides a comprehensive overview of all TBO Holidays API endpoints supported by the TypeScript SDK.

## 🌐 Base Configuration

```typescript
import TBOHolidaysSDK from "tbo-hotel-sdk";

const sdk = new TBOHolidaysSDK({
  baseURL: "http://api.tbotechnology.in/TBOHolidays_HotelAPI",
  username: "your-username",
  password: "your-password",
  timeout: 30000,
  retries: 3
});
```

## 📊 Supported Endpoints

| Endpoint | Method | Client | Purpose | Status |
|----------|--------|--------|---------|--------|
| `/CountryList` | GET | UtilitiesClient | Get all countries | ✅ Active |
| `/CityList` | POST | UtilitiesClient | Get cities by country | ✅ Active |
| `/Hoteldetails` | POST | UtilitiesClient | Get hotel information | ✅ Active |
| `/hotelcodelist` | POST | UtilitiesClient | Get all hotel codes | ✅ Active |
| `/TBOHotelCodeList` | POST | UtilitiesClient | Get hotels by city | ✅ Active |
| `/search` | POST | HotelSearchClient | Search hotel availability | ✅ Active |
| `/PreBook` | POST | PreBookClient | Verify booking availability | ✅ Active |

## 🔐 Authentication

All API calls use HTTP Basic Authentication:

```http
Authorization: Basic base64(username:password)
Content-Type: application/json
Accept: application/json
```

## 📥 Common Response Structure

All API responses follow this structure:

```typescript
interface APIResponse<T> {
  Status: {
    Code: number;        // HTTP-like status code
    Description: string; // Human-readable status message
  };
  ResponseTime?: number; // API response time in milliseconds
  data?: T;             // Endpoint-specific data
}
```

## 🚦 Status Codes

### Success Codes
- **200** - Success / Successful
- **201** - No Available rooms for given criteria (still successful response)

### Error Codes  
- **401** - Access Credentials is incorrect / Login Failed for Member
- **500** - Unexpected Error / Internal server error

## 🧪 Testing Connectivity

Use the built-in connection test to verify API access:

```typescript
const sdk = new TBOHolidaysSDK();

// Test all endpoints
const connectionTest = await sdk.testConnection();

console.log(`Connected: ${connectionTest.connected}`);
console.log('Endpoint Status:', connectionTest.endpoints);

if (connectionTest.errors.length > 0) {
  console.log('Errors:', connectionTest.errors);
}
```

### Sample Connection Test Response

```json
{
  "connected": true,
  "endpoints": {
    "CountryList": true,
    "HotelSearch": true
  },
  "errors": []
}
```

## 🔄 Retry Logic

The SDK automatically retries failed requests with exponential backoff:

- **Default Retries**: 3 attempts
- **Timeout**: 30 seconds per request
- **Backoff**: Exponential (1s, 2s, 4s)

## 📝 Request Logging

Enable request/response logging for debugging:

```bash
# In your .env file
TBO_LOG_REQUESTS=true
TBO_LOG_RESPONSES=true
TBO_LOG_LEVEL=info
```

### Sample Log Output

```
📤 Making GET request to /CountryList
📥 Received response: 200 OK
📤 Making POST request to /search
📥 Received response: 200 OK
```

## 🌍 Environment Configuration

### Staging Environment
```bash
TBO_BASE_URL=http://api.tbotechnology.in/TBOHolidays_HotelAPI
TBO_USERNAME=your-staging-username
TBO_PASSWORD=your-staging-password
```

### Production Environment
```bash
TBO_BASE_URL=https://api.tboholidays.com/TBOHolidays_HotelAPI
TBO_USERNAME=your-production-username  
TBO_PASSWORD=your-production-password
```

## ⚡ Performance Considerations

- **Concurrent Requests**: SDK supports parallel API calls
- **Response Caching**: No built-in caching (implement as needed)
- **Rate Limiting**: Respect TBO's rate limits (check with TBO)
- **Connection Pooling**: Handled automatically by axios

## 🔍 Debugging Tips

1. **Enable Logging**: Set `TBO_LOG_REQUESTS=true` to see all API calls
2. **Check Credentials**: Verify username/password are correct
3. **Network Issues**: Ensure API endpoint is accessible
4. **Response Inspection**: Log full response objects for debugging

```typescript
try {
  const response = await sdk.utilities.getCountryList();
  console.log('Full Response:', JSON.stringify(response, null, 2));
} catch (error) {
  console.error('Error Details:', error);
  if (error.response) {
    console.error('Response Data:', error.response.data);
  }
}
```

## 📚 Next Steps

- [Utilities API Documentation](./utilities.md) - Countries, cities, hotel details
- [Hotel Search API Documentation](./search.md) - Hotel availability search  
- [PreBook API Documentation](./prebook.md) - Booking verification
- [Quick Start Guide](../examples/quickstart.md) - Get started in 5 minutes