# Hotel Search API

The Hotel Search API is the core functionality for finding available hotels and rooms. It provides real-time availability, pricing, and booking codes for reservations.

## 🔍 Search Endpoint

### Endpoint Details
- **URL**: `/search`
- **Method**: `POST`
- **Authentication**: HTTP Basic Auth

### Basic Usage

```typescript
import TBOHolidaysSDK from "tbo-holidays-typescript-sdk";

const sdk = new TBOHolidaysSDK();

// Get test dates (30 days from now for 1 night)
const { checkIn, checkOut } = sdk.search.getTestDates(30, 1);

// Search for single room
const searchResponse = await sdk.search.searchSingleRoom(
  checkIn,        // "2025-07-27"
  checkOut,       // "2025-07-28"
  2,              // adults
  0,              // children
  [],             // children ages
  "AE",           // guest nationality
  "1402689,1405349,1405355" // hotel codes
);
```

## 📋 Request Parameters

### Required Parameters

```typescript
interface HotelSearchRequest {
  CheckIn: string;           // Format: "YYYY-MM-DD"
  CheckOut: string;          // Format: "YYYY-MM-DD"
  GuestNationality: string;  // ISO country code (e.g., "AE")
  PaxRooms: PaxRoom[];       // Room and guest configuration
  HotelCodes: string;        // Comma-separated hotel codes
  ResponseTime: number;      // Timeout in seconds (default: 20)
  IsDetailedResponse: boolean; // Include detailed room info
  Filters: SearchFilters;    // Search filters
}

interface PaxRoom {
  Adults: number;      // Number of adults (max per room varies)
  Children: number;    // Number of children
  ChildrenAges: number[]; // Ages of children (required if Children > 0)
}

interface SearchFilters {
  Refundable: boolean;    // Filter for refundable rates
  NoOfRooms: number;      // Number of rooms (0 = any)
  MealType: string;       // "All", "Room_Only", "Breakfast", etc.
}
```

## 🔧 Search Methods

### Single Room Search

```typescript
// Simple single room search
const response = await sdk.search.searchSingleRoom(
  "2025-07-27",    // check-in
  "2025-07-28",    // check-out
  2,               // adults
  1,               // children
  [8],             // child age 8
  "AE",            // nationality
  sdk.search.getSampleHotelCodes(5) // get 5 sample hotel codes
);
```

### Multiple Room Search

```typescript
// Search for multiple rooms
const rooms = [
  { Adults: 2, Children: 0, ChildrenAges: [] },
  { Adults: 1, Children: 1, ChildrenAges: [10] }
];

const response = await sdk.search.searchMultipleRooms(
  "2025-07-27",
  "2025-07-28",
  rooms,
  "US",
  "1402689,1405349"
);
```

### Advanced Search with Filters

```typescript
// Search with specific filters
const response = await sdk.search.searchWithFilters(
  "2025-07-27",
  "2025-07-28",
  [{ Adults: 2, Children: 0, ChildrenAges: [] }],
  "AE",
  "1402689,1405349,1405355",
  {
    Refundable: true,     // Only refundable rates
    NoOfRooms: 1,         // Exactly 1 room
    MealType: "Breakfast" // Include breakfast
  }
);
```

## 📥 Request Example

```http
POST /search HTTP/1.1
Host: api.tbotechnology.in
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
Content-Type: application/json

{
  "CheckIn": "2025-07-27",
  "CheckOut": "2025-07-28", 
  "GuestNationality": "AE",
  "PaxRooms": [
    {
      "Adults": 2,
      "Children": 1,
      "ChildrenAges": [8]
    }
  ],
  "HotelCodes": "1402689,1405349,1405355",
  "ResponseTime": 20.0,
  "IsDetailedResponse": true,
  "Filters": {
    "Refundable": false,
    "NoOfRooms": 0,
    "MealType": "All"
  }
}
```

## 📤 Response Structure

### Successful Response

```json
{
  "Status": {
    "Code": 200,
    "Description": "Successful"
  },
  "HotelResult": [
    {
      "HotelCode": "1407362",
      "Currency": "USD",
      "RoomDetails": [
        {
          "RoomTypeCode": "32479",
          "RoomTypeName": "Luxury Room,1 King Bed,NonSmoking",
          "RoomPromotion": "",
          "BookingCode": "1407362!TB!1!TB!64ca9cb2...",
          "TotalFare": 904.45,
          "TotalTax": 127.30,
          "MealType": "Room_Only",
          "Refundable": true,
          "CancellationPolicy": "...",
          "Amenities": ["WiFi", "AC", "TV"]
        }
      ]
    }
  ]
}
```

### No Results Response

```json
{
  "Status": {
    "Code": 201,
    "Description": "No Available rooms for given criteria"
  }
}
```

## 📊 Response Processing

### Extract Search Summary

```typescript
if (searchResponse.Status.Code === 200) {
  const summary = sdk.search.getSearchSummary(searchResponse);
  
  console.log(`Hotels found: ${summary.totalHotels}`);
  console.log(`Total rooms: ${summary.totalRooms}`);
  console.log(`Booking codes: ${summary.totalBookingCodes}`);
  console.log(`Price range: ${summary.priceRange.min} - ${summary.priceRange.max} ${summary.priceRange.currency}`);
}
```

### Extract Booking Codes

```typescript
// Get all booking codes for reservation
const bookingCodes = sdk.search.extractBookingCodes(searchResponse);

console.log(`Found ${bookingCodes.length} booking codes:`);
bookingCodes.forEach((code, index) => {
  console.log(`  ${index + 1}. ${code.substring(0, 30)}...`);
});
```

### Process Hotel Results

```typescript
if (searchResponse.HotelResult) {
  searchResponse.HotelResult.forEach(hotel => {
    console.log(`\n🏨 Hotel: ${hotel.HotelCode}`);
    console.log(`💱 Currency: ${hotel.Currency}`);
    console.log(`🏠 Rooms: ${hotel.RoomDetails.length}`);
    
    hotel.RoomDetails.forEach((room, index) => {
      console.log(`\n  Room ${index + 1}:`);
      console.log(`    🛏️ Type: ${room.RoomTypeName}`);
      console.log(`    💰 Total: ${room.TotalFare} ${hotel.Currency}`);
      console.log(`    🍽️ Meal: ${room.MealType}`);
      console.log(`    ↩️ Refundable: ${room.Refundable ? 'Yes' : 'No'}`);
      console.log(`    🎫 Booking Code: ${room.BookingCode.substring(0, 30)}...`);
    });
  });
}
```

## 🧪 Complete Search Test Example

```typescript
async function testHotelSearch() {
  const sdk = new TBOHolidaysSDK();
  
  console.log('🔍 Testing Hotel Search...');
  
  // 1. Single room search
  console.log('\n1. Single Room Search');
  const { checkIn, checkOut } = sdk.search.getTestDates(30, 1);
  console.log(`📅 Dates: ${checkIn} to ${checkOut}`);
  
  const singleRoomResponse = await sdk.search.searchSingleRoom(
    checkIn,
    checkOut,
    2, // adults
    0, // children  
    [], // no children ages
    "AE", // UAE nationality
    sdk.search.getSampleHotelCodes(5)
  );
  
  console.log(`📊 Status: ${singleRoomResponse.Status.Code} - ${singleRoomResponse.Status.Description}`);
  
  if (singleRoomResponse.Status.Code === 200) {
    const summary = sdk.search.getSearchSummary(singleRoomResponse);
    console.log(`✅ Found ${summary.totalHotels} hotels, ${summary.totalRooms} rooms`);
    
    if (summary.priceRange) {
      console.log(`💰 Price: ${summary.priceRange.min} - ${summary.priceRange.max} ${summary.priceRange.currency}`);
    }
    
    // Get booking codes for next step
    const bookingCodes = sdk.search.extractBookingCodes(singleRoomResponse);
    console.log(`🎫 Booking codes: ${bookingCodes.length}`);
    
  } else if (singleRoomResponse.Status.Code === 201) {
    console.log('ℹ️ No rooms available for criteria');
  } else {
    console.log(`❌ Search failed: ${singleRoomResponse.Status.Description}`);
  }
  
  // 2. Multiple room search
  console.log('\n2. Multiple Room Search');
  const multiRoomResponse = await sdk.search.searchMultipleRooms(
    checkIn,
    checkOut,
    [
      { Adults: 2, Children: 0, ChildrenAges: [] },
      { Adults: 1, Children: 1, ChildrenAges: [8] }
    ],
    "AE",
    sdk.search.getSampleHotelCodes(3)
  );
  
  console.log(`📊 Status: ${multiRoomResponse.Status.Code} - ${multiRoomResponse.Status.Description}`);
  
  // 3. Refundable search
  console.log('\n3. Refundable Rates Search');
  const refundableResponse = await sdk.search.searchWithFilters(
    checkIn,
    checkOut,
    [{ Adults: 1, Children: 0, ChildrenAges: [] }],
    "AE",
    sdk.search.getSampleHotelCodes(3),
    {
      Refundable: true,
      NoOfRooms: 1,
      MealType: "All"
    }
  );
  
  console.log(`📊 Status: ${refundableResponse.Status.Code} - ${refundableResponse.Status.Description}`);
  
  if (refundableResponse.Status.Code === 200) {
    const refundableSummary = sdk.search.getSearchSummary(refundableResponse);
    console.log(`✅ Refundable options: ${refundableSummary.totalHotels} hotels`);
  }
}
```

### Expected Output

```
🔍 Testing Hotel Search...

1. Single Room Search
📅 Dates: 2025-07-27 to 2025-07-28
📊 Status: 200 - Successful
✅ Found 1 hotels, 5 rooms
💰 Price: 904.45 - 1253.05 USD
🎫 Booking codes: 5

2. Multiple Room Search
📊 Status: 201 - No Available rooms for given criteria

3. Refundable Rates Search
📊 Status: 200 - Successful
✅ Refundable options: 1 hotels
```

## 🎯 Helper Methods

### Sample Hotel Codes

```typescript
// Get predefined sample hotel codes for testing
const sampleCodes = sdk.search.getSampleHotelCodes(5);
console.log(sampleCodes); // "1402689,1405349,1405355,1405361,1407362"
```

### Test Date Generation

```typescript
// Get dates for testing (daysFromNow, numberOfNights)
const { checkIn, checkOut } = sdk.search.getTestDates(30, 2);
console.log(`${checkIn} to ${checkOut}`); // "2025-07-27 to 2025-07-29"

// Custom date range
const { checkIn, checkOut } = sdk.search.getTestDates(60, 7); // 60 days out, 7 nights
```

## ⚠️ Important Notes

### Date Format
- Use ISO format: `YYYY-MM-DD`
- Check-out must be after check-in
- Dates should be in the future

### Hotel Codes
- Get valid codes from [Utilities API](./utilities.md)
- Can search multiple hotels with comma separation
- Invalid codes may return no results

### Guest Nationality
- Use ISO country codes (AE, US, GB, etc.)
- Affects pricing and availability
- Some hotels have nationality restrictions

### Children Ages
- Required if `Children > 0`
- Ages affect room pricing
- Different hotels have different age limits

## 🚦 Error Handling

```typescript
try {
  const response = await sdk.search.searchSingleRoom(...);
  
  switch (response.Status.Code) {
    case 200:
      console.log('✅ Search successful');
      // Process results
      break;
      
    case 201:
      console.log('ℹ️ No rooms available');
      // Handle no results
      break;
      
    default:
      console.log(`❌ Search failed: ${response.Status.Description}`);
      break;
  }
  
} catch (error) {
  console.error('🚫 Network error:', error.message);
}
```

## 🔗 Next Steps

- [PreBook API](./prebook.md) - Verify booking before payment
- [Complete Booking Flow](../examples/booking-flow.md) - End-to-end process
- [Error Handling Guide](../guides/error-handling.md) - Handle all scenarios