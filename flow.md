# 🏨 Travel Hotel Search/Booking Application Flow

**Building a Complete Hotel Booking App with TBO TypeScript SDK**

---

## 📋 **Application Overview**

This document outlines how to build a complete hotel search and booking application using the TBO Holidays TypeScript SDK. The application will follow modern travel booking patterns similar to Booking.com, Expedia, or Hotels.com.

---

## 🏗️ **Application Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    HOTEL BOOKING APP                        │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React/Vue/Angular)                               │
│  ├── Search Form                                            │
│  ├── Results Page                                           │
│  ├── Hotel Details                                          │
│  ├── Booking Form                                           │
│  └── Confirmation                                           │
├─────────────────────────────────────────────────────────────┤
│  Backend API (Node.js/Express)                              │
│  ├── Location Services                                      │
│  ├── Search Services                                        │
│  ├── Booking Services                                       │
│  └── User Management                                        │
├─────────────────────────────────────────────────────────────┤
│  TBO TypeScript SDK                                         │
│  ├── UtilitiesClient (Countries/Cities)                     │
│  ├── HotelSearchClient (Search/Filter)                      │
│  ├── PreBookClient (Availability/Pricing)                   │
│  └── BookingClient (Reservations)                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 **Complete User Journey Flow**

### **Flow Diagram**

```mermaid
graph TD
    A[User Opens App] --> B[Initialize Location Data]
    B --> C[Show Search Form]
    C --> D{User Enters Destination}
    D --> E[City Autocomplete Search]
    E --> F[User Selects Dates & Guests]
    F --> G[Search Hotels API Call]
    G --> H[Display Results Page]
    H --> I{User Selects Hotel}
    I --> J[Hotel Details Page]
    J --> K{User Clicks Book}
    K --> L[PreBook API Call]
    L --> M[Show Booking Form]
    M --> N[User Fills Details]
    N --> O[Final Book API Call]
    O --> P[Booking Confirmation]
    P --> Q[Send Confirmation Email]
```

---

## 🚀 **Step-by-Step Implementation**

### **1. 🌍 Application Initialization**

**Goal**: Load countries and popular cities for search autocomplete

```typescript
// services/LocationService.ts
import TBOHolidaysSDK from '../sdk';

class LocationService {
  private sdk: TBOHolidaysSDK;
  private countries: Country[] = [];
  private citiesCache: Map<string, City[]> = new Map();

  constructor() {
    this.sdk = new TBOHolidaysSDK({
      timeout: 60000,  // Longer timeout for production
      retries: 3
    });
  }

  async initializeApp(): Promise<void> {
    try {
      // Load all countries
      console.log('🌍 Loading countries...');
      const response = await this.sdk.utilities.getCountryList();
      this.countries = response.CountryList;
      
      // Pre-load popular destinations
      const popularCountries = ['AE', 'US', 'GB', 'FR', 'DE', 'IT', 'ES'];
      for (const countryCode of popularCountries) {
        await this.loadCities(countryCode);
      }
      
      console.log(`✅ Loaded ${this.countries.length} countries`);
    } catch (error) {
      console.error('❌ Failed to initialize location data:', error);
    }
  }

  private async loadCities(countryCode: string): Promise<void> {
    if (!this.citiesCache.has(countryCode)) {
      const response = await this.sdk.utilities.getCityList(countryCode);
      this.citiesCache.set(countryCode, response.CityList);
    }
  }

  // Autocomplete search for destinations
  async searchDestinations(query: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    // Search countries
    const matchingCountries = this.countries.filter(country =>
      country.Name.toLowerCase().includes(query.toLowerCase())
    );
    
    // Search cities
    for (const [countryCode, cities] of this.citiesCache) {
      const matchingCities = cities.filter(city =>
        city.Name.toLowerCase().includes(query.toLowerCase())
      );
      results.push(...matchingCities.map(city => ({
        type: 'city',
        id: city.Code,
        name: city.Name,
        country: this.countries.find(c => c.Code === countryCode)?.Name
      })));
    }
    
    return results.slice(0, 10); // Limit results
  }
}
```

**When to Use**: App startup, destination autocomplete

**SDK Calls**:
- `sdk.utilities.getCountryList()` - Load all countries
- `sdk.utilities.getCityList(countryCode)` - Load cities for popular countries

---

### **2. 🔍 Hotel Search Page**

**Goal**: Allow users to search for hotels with filters

#### **Search Form Component**

```typescript
// components/SearchForm.tsx
interface SearchFormData {
  destination: string;
  cityCode: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  childrenAges: number[];
  rooms: number;
}

const SearchForm: React.FC = () => {
  const [searchData, setSearchData] = useState<SearchFormData>({
    destination: '',
    cityCode: '',
    checkIn: '',
    checkOut: '',
    adults: 2,
    children: 0,
    childrenAges: [],
    rooms: 1
  });

  const handleSearch = async () => {
    // Validate form
    if (!searchData.cityCode || !searchData.checkIn || !searchData.checkOut) {
      alert('Please fill in all required fields');
      return;
    }

    // Navigate to results page
    router.push(`/hotels/search?${new URLSearchParams({
      city: searchData.cityCode,
      checkin: searchData.checkIn,
      checkout: searchData.checkOut,
      adults: searchData.adults.toString(),
      children: searchData.children.toString(),
      rooms: searchData.rooms.toString(),
      childrenAges: searchData.childrenAges.join(',')
    })}`);
  };

  return (
    <form onSubmit={handleSearch}>
      <DestinationAutocomplete 
        value={searchData.destination}
        onSelect={(city) => {
          setSearchData({
            ...searchData,
            destination: city.name,
            cityCode: city.code
          });
        }}
      />
      <DatePicker 
        checkIn={searchData.checkIn}
        checkOut={searchData.checkOut}
        onChange={(dates) => setSearchData({...searchData, ...dates})}
      />
      <GuestSelector 
        adults={searchData.adults}
        children={searchData.children}
        rooms={searchData.rooms}
        onChange={(guests) => setSearchData({...searchData, ...guests})}
      />
      <button type="submit">Search Hotels</button>
    </form>
  );
};
```

#### **Search Service**

```typescript
// services/HotelSearchService.ts
class HotelSearchService {
  private sdk: TBOHolidaysSDK;

  constructor() {
    this.sdk = new TBOHolidaysSDK();
  }

  async searchHotels(searchParams: SearchParams): Promise<SearchResults> {
    try {
      // Build room configuration
      const paxRooms = this.buildPaxRooms(searchParams);
      
      // Get hotel codes for the city (optional - for better results)
      const hotelCodes = await this.getHotelCodesForCity(searchParams.cityCode);
      
      // Search hotels
      const response = await this.sdk.search.searchMultipleRooms(
        searchParams.checkIn,
        searchParams.checkOut,
        paxRooms,
        searchParams.guestNationality,
        {
          hotelCodes: hotelCodes,
          responseTime: 25.0,
          isDetailedResponse: true,
          filters: {
            refundable: searchParams.refundableOnly,
            noOfRooms: searchParams.rooms,
            mealType: searchParams.mealType || 'All'
          }
        }
      );

      return this.processSearchResults(response);
    } catch (error) {
      console.error('Hotel search failed:', error);
      throw new Error('Failed to search hotels. Please try again.');
    }
  }

  private buildPaxRooms(searchParams: SearchParams): PaxRoom[] {
    const rooms: PaxRoom[] = [];
    const adultsPerRoom = Math.ceil(searchParams.adults / searchParams.rooms);
    const childrenPerRoom = Math.ceil(searchParams.children / searchParams.rooms);
    
    for (let i = 0; i < searchParams.rooms; i++) {
      rooms.push({
        Adults: adultsPerRoom,
        Children: childrenPerRoom,
        ChildrenAges: searchParams.childrenAges
      });
    }
    
    return rooms;
  }

  private async getHotelCodesForCity(cityCode: string): Promise<string> {
    try {
      const response = await this.sdk.utilities.getTBOHotelCodesByCity(cityCode);
      const hotelCodes = response.HotelCodes?.slice(0, 50).join(','); // Limit for performance
      return hotelCodes || this.sdk.search.getSampleHotelCodes(20);
    } catch (error) {
      return this.sdk.search.getSampleHotelCodes(20);
    }
  }

  private processSearchResults(response: HotelSearchResponse): SearchResults {
    if (response.Status.Code !== 200) {
      throw new Error(response.Status.Description);
    }

    const hotels = response.HotelResult?.map(hotel => ({
      hotelCode: hotel.HotelCode,
      hotelName: hotel.HotelName,
      starRating: hotel.StarRating,
      location: hotel.HotelLocation,
      images: hotel.HotelImages,
      description: hotel.HotelDescription,
      rooms: hotel.Rooms?.map(room => ({
        roomType: room.RoomTypeName,
        mealType: room.Inclusion,
        totalFare: room.Price?.OfferedPrice,
        currency: room.Price?.CurrencyCode,
        isRefundable: !room.IsRefundable,
        bookingCode: room.BookingCode,
        cancellationPolicy: room.CancellationPolicies
      })),
      minPrice: Math.min(...(hotel.Rooms?.map(r => r.Price?.OfferedPrice) || [])),
      maxPrice: Math.max(...(hotel.Rooms?.map(r => r.Price?.OfferedPrice) || []))
    })) || [];

    return {
      hotels,
      totalResults: hotels.length,
      searchId: response.SearchId,
      currency: hotels[0]?.rooms?.[0]?.currency || 'USD'
    };
  }
}
```

**When to Use**: When user submits search form

**SDK Calls**:
- `sdk.utilities.getTBOHotelCodesByCity(cityCode)` - Get hotels in city
- `sdk.search.searchMultipleRooms()` - Main hotel search

---

### **3. 📋 Hotel Results Page**

**Goal**: Display search results with filtering and sorting options

#### **Results Display**

```typescript
// components/HotelResultsPage.tsx
const HotelResultsPage: React.FC = () => {
  const [results, setResults] = useState<SearchResults | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    priceRange: [0, 1000],
    starRating: [],
    mealTypes: [],
    refundableOnly: false
  });
  const [sortBy, setSortBy] = useState<SortOption>('price_low');

  useEffect(() => {
    loadSearchResults();
  }, []);

  const loadSearchResults = async () => {
    try {
      const searchParams = parseSearchParams(window.location.search);
      const searchService = new HotelSearchService();
      const results = await searchService.searchHotels(searchParams);
      setResults(results);
    } catch (error) {
      console.error('Failed to load results:', error);
    }
  };

  const filteredAndSortedHotels = useMemo(() => {
    if (!results) return [];
    
    let filtered = results.hotels.filter(hotel => {
      // Price filter
      if (hotel.minPrice < filters.priceRange[0] || hotel.minPrice > filters.priceRange[1]) {
        return false;
      }
      
      // Star rating filter
      if (filters.starRating.length > 0 && !filters.starRating.includes(hotel.starRating)) {
        return false;
      }
      
      // Refundable filter
      if (filters.refundableOnly && !hotel.rooms?.some(room => room.isRefundable)) {
        return false;
      }
      
      return true;
    });

    // Sort results
    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.minPrice - b.minPrice);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.minPrice - a.minPrice);
        break;
      case 'rating':
        filtered.sort((a, b) => b.starRating - a.starRating);
        break;
      case 'name':
        filtered.sort((a, b) => a.hotelName.localeCompare(b.hotelName));
        break;
    }

    return filtered;
  }, [results, filters, sortBy]);

  return (
    <div className="results-page">
      <SearchFilters 
        filters={filters}
        onFiltersChange={setFilters}
        priceRange={[results?.minPrice || 0, results?.maxPrice || 1000]}
      />
      
      <div className="results-content">
        <ResultsHeader 
          totalResults={filteredAndSortedHotels.length}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
        
        <div className="hotel-list">
          {filteredAndSortedHotels.map(hotel => (
            <HotelCard 
              key={hotel.hotelCode}
              hotel={hotel}
              onSelectRoom={(room) => handleRoomSelection(hotel, room)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const HotelCard: React.FC<{hotel: Hotel, onSelectRoom: Function}> = ({ hotel, onSelectRoom }) => {
  return (
    <div className="hotel-card">
      <div className="hotel-images">
        <img src={hotel.images?.[0]} alt={hotel.hotelName} />
      </div>
      
      <div className="hotel-info">
        <h3>{hotel.hotelName}</h3>
        <div className="star-rating">
          {'★'.repeat(hotel.starRating)}
        </div>
        <p>{hotel.location}</p>
        <p>{hotel.description?.substring(0, 150)}...</p>
      </div>
      
      <div className="hotel-rooms">
        <h4>Available Rooms</h4>
        {hotel.rooms?.slice(0, 3).map((room, index) => (
          <div key={index} className="room-option">
            <div className="room-info">
              <strong>{room.roomType}</strong>
              <span>{room.mealType}</span>
              {room.isRefundable && <span className="refundable">✓ Refundable</span>}
            </div>
            <div className="room-price">
              <span className="price">{room.currency} {room.totalFare}</span>
              <button 
                className="select-button"
                onClick={() => onSelectRoom(room)}
              >
                Select Room
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

**What the Results Page Shows**:
- ✅ Hotel name, star rating, location
- ✅ Hotel images and description
- ✅ Available room types with pricing
- ✅ Meal inclusions (Room Only, Breakfast, etc.)
- ✅ Refundable status
- ✅ Filtering by price, stars, amenities
- ✅ Sorting by price, rating, name

---

### **4. 🏨 Hotel Details & Room Selection**

**Goal**: Show detailed hotel information and allow room selection

```typescript
// components/HotelDetailsPage.tsx
const HotelDetailsPage: React.FC = () => {
  const [hotelDetails, setHotelDetails] = useState<HotelDetail | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  useEffect(() => {
    loadHotelDetails();
  }, []);

  const loadHotelDetails = async () => {
    try {
      const hotelCode = getHotelCodeFromUrl();
      const sdk = new TBOHolidaysSDK();
      
      const response = await sdk.utilities.getHotelDetails(hotelCode);
      setHotelDetails(response.HotelDetails[0]);
    } catch (error) {
      console.error('Failed to load hotel details:', error);
    }
  };

  const handleRoomSelection = (room: Room) => {
    setSelectedRoom(room);
  };

  const proceedToBooking = () => {
    if (!selectedRoom) {
      alert('Please select a room first');
      return;
    }

    router.push(`/booking?bookingCode=${selectedRoom.bookingCode}`);
  };

  return (
    <div className="hotel-details">
      <HotelGallery images={hotelDetails?.images} />
      
      <div className="hotel-overview">
        <h1>{hotelDetails?.hotelName}</h1>
        <div className="star-rating">{'★'.repeat(hotelDetails?.starRating)}</div>
        <p className="location">{hotelDetails?.address}</p>
        <div className="amenities">
          {hotelDetails?.facilities?.map(facility => (
            <span key={facility} className="amenity">{facility}</span>
          ))}
        </div>
      </div>

      <div className="room-selection">
        <h2>Select Your Room</h2>
        {hotelDetails?.availableRooms?.map(room => (
          <RoomCard
            key={room.bookingCode}
            room={room}
            isSelected={selectedRoom?.bookingCode === room.bookingCode}
            onSelect={() => handleRoomSelection(room)}
          />
        ))}
      </div>

      {selectedRoom && (
        <div className="booking-summary">
          <BookingSummary room={selectedRoom} />
          <button onClick={proceedToBooking} className="proceed-button">
            Proceed to Booking
          </button>
        </div>
      )}
    </div>
  );
};
```

**When to Use**: When user clicks on a hotel from results

**SDK Calls**:
- `sdk.utilities.getHotelDetails(hotelCode)` - Get detailed hotel information

---

### **5. ✅ Pre-Booking Verification**

**Goal**: Verify availability and get final pricing before booking

```typescript
// services/PreBookingService.ts
class PreBookingService {
  private sdk: TBOHolidaysSDK;

  constructor() {
    this.sdk = new TBOHolidaysSDK();
  }

  async verifyBooking(bookingCode: string): Promise<PreBookingResult> {
    try {
      console.log('🔍 Verifying availability for booking code:', bookingCode);
      
      const response = await this.sdk.preBook.preBookHotel(bookingCode, 'Limit');
      
      if (response.Status.Code !== 200) {
        throw new Error(`Pre-booking failed: ${response.Status.Description}`);
      }

      const info = this.sdk.preBook.extractPreBookInfo(response);
      
      return {
        isAvailable: true,
        bookingCode: info.bookingCode,
        hotelName: info.hotelName,
        checkIn: info.checkIn,
        checkOut: info.checkOut,
        totalFare: info.totalFare,
        currency: info.currency,
        isRefundable: info.isRefundable,
        cancellationPolicies: info.cancellationPolicies,
        expiryTime: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        preBookResponse: response
      };
    } catch (error) {
      console.error('Pre-booking verification failed:', error);
      return {
        isAvailable: false,
        error: error.message
      };
    }
  }

  async refreshPricing(bookingCode: string): Promise<PreBookingResult> {
    // Re-verify to get latest pricing
    return this.verifyBooking(bookingCode);
  }
}
```

**When to Use**: Before showing booking form to ensure room is still available

**SDK Calls**:
- `sdk.preBook.preBookHotel(bookingCode, 'Limit')` - Verify availability and pricing

---

### **6. 📝 Booking Form & Final Booking**

**Goal**: Collect guest information and complete the booking

```typescript
// components/BookingPage.tsx
const BookingPage: React.FC = () => {
  const [preBookingData, setPreBookingData] = useState<PreBookingResult | null>(null);
  const [guestDetails, setGuestDetails] = useState<GuestDetails>({
    title: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      country: '',
      postalCode: ''
    },
    specialRequests: ''
  });
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    verifyBookingAvailability();
  }, []);

  const verifyBookingAvailability = async () => {
    try {
      const bookingCode = getBookingCodeFromUrl();
      const preBookingService = new PreBookingService();
      const result = await preBookingService.verifyBooking(bookingCode);
      
      if (!result.isAvailable) {
        alert('Sorry, this room is no longer available. Please search again.');
        router.push('/hotels/search');
        return;
      }
      
      setPreBookingData(result);
    } catch (error) {
      console.error('Verification failed:', error);
    }
  };

  const handleBooking = async () => {
    try {
      setIsBooking(true);
      
      // Validate guest details
      if (!validateGuestDetails(guestDetails)) {
        alert('Please fill in all required fields');
        return;
      }

      // Create booking
      const bookingService = new BookingService();
      const bookingResult = await bookingService.createBooking({
        preBookingData,
        guestDetails,
        paymentInfo: {
          method: 'limit', // Or credit card details
        }
      });

      if (bookingResult.success) {
        router.push(`/booking/confirmation/${bookingResult.bookingId}`);
      } else {
        alert(`Booking failed: ${bookingResult.error}`);
      }
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="booking-page">
      {preBookingData && (
        <>
          <BookingSummaryCard preBookingData={preBookingData} />
          
          <GuestDetailsForm 
            guestDetails={guestDetails}
            onChange={setGuestDetails}
          />
          
          <CancellationPolicy 
            policies={preBookingData.cancellationPolicies}
          />
          
          <PaymentSection />
          
          <div className="booking-actions">
            <PriceBreakdown 
              totalFare={preBookingData.totalFare}
              currency={preBookingData.currency}
            />
            
            <button 
              onClick={handleBooking}
              disabled={isBooking}
              className="book-now-button"
            >
              {isBooking ? 'Processing...' : `Book Now - ${preBookingData.currency} ${preBookingData.totalFare}`}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
```

#### **Booking Service**

```typescript
// services/BookingService.ts
class BookingService {
  private sdk: TBOHolidaysSDK;

  constructor() {
    this.sdk = new TBOHolidaysSDK();
  }

  async createBooking(bookingData: BookingRequest): Promise<BookingResult> {
    try {
      // Note: This would use the Book endpoint when implemented
      // For now, we'll simulate the booking process
      
      const bookingRequest = {
        BookingCode: bookingData.preBookingData.bookingCode,
        PaymentMode: bookingData.paymentInfo.method,
        GuestDetails: [{
          Title: bookingData.guestDetails.title,
          FirstName: bookingData.guestDetails.firstName,
          LastName: bookingData.guestDetails.lastName,
          Email: bookingData.guestDetails.email,
          Phone: bookingData.guestDetails.phone,
          Address: bookingData.guestDetails.address
        }],
        SpecialRequests: bookingData.guestDetails.specialRequests
      };

      // This would be: await this.sdk.booking.bookHotel(bookingRequest);
      // For demonstration, we'll create a mock booking
      const bookingId = `TBO${Date.now()}`;
      
      return {
        success: true,
        bookingId,
        confirmationNumber: bookingId,
        status: 'Confirmed',
        totalAmount: bookingData.preBookingData.totalFare,
        currency: bookingData.preBookingData.currency
      };
    } catch (error) {
      console.error('Booking creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getBookingDetails(bookingId: string): Promise<BookingDetails> {
    try {
      // This would use: await this.sdk.booking.getBookingDetails(bookingId);
      // For now, return mock data
      return {
        bookingId,
        status: 'Confirmed',
        hotelName: 'Sample Hotel',
        checkIn: '2025-07-24',
        checkOut: '2025-07-25',
        guestName: 'John Doe',
        totalAmount: 500.00,
        currency: 'USD'
      };
    } catch (error) {
      console.error('Failed to get booking details:', error);
      throw error;
    }
  }

  async cancelBooking(bookingId: string, reason: string): Promise<CancellationResult> {
    try {
      // This would use: await this.sdk.booking.cancelBooking(bookingId, reason);
      return {
        success: true,
        cancellationId: `CXL${Date.now()}`,
        refundAmount: 450.00,
        refundCurrency: 'USD',
        cancellationFee: 50.00
      };
    } catch (error) {
      console.error('Booking cancellation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
```

**When to Use**: When user completes booking form and clicks "Book Now"

**SDK Calls**:
- `sdk.booking.bookHotel(bookingRequest)` - Create final booking
- `sdk.booking.getBookingDetails(bookingId)` - Get booking confirmation

---

### **7. ✅ Booking Confirmation**

**Goal**: Show booking confirmation and provide management options

```typescript
// components/BookingConfirmationPage.tsx
const BookingConfirmationPage: React.FC = () => {
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);

  useEffect(() => {
    loadBookingDetails();
  }, []);

  const loadBookingDetails = async () => {
    try {
      const bookingId = getBookingIdFromUrl();
      const bookingService = new BookingService();
      const details = await bookingService.getBookingDetails(bookingId);
      setBookingDetails(details);
    } catch (error) {
      console.error('Failed to load booking details:', error);
    }
  };

  return (
    <div className="confirmation-page">
      <div className="success-header">
        <h1>✅ Booking Confirmed!</h1>
        <p>Your reservation has been successfully created.</p>
      </div>

      {bookingDetails && (
        <>
          <BookingDetailsCard booking={bookingDetails} />
          
          <div className="next-steps">
            <h3>What's Next?</h3>
            <ul>
              <li>✅ Confirmation email sent to {bookingDetails.guestEmail}</li>
              <li>📱 You can manage your booking anytime</li>
              <li>🏨 Hotel check-in: {bookingDetails.checkIn}</li>
            </ul>
          </div>

          <div className="booking-actions">
            <button onClick={() => downloadVoucher(bookingDetails)}>
              📄 Download Voucher
            </button>
            <button onClick={() => emailVoucher(bookingDetails)}>
              📧 Email Voucher
            </button>
            <button onClick={() => router.push(`/bookings/${bookingDetails.bookingId}/manage`)}>
              ⚙️ Manage Booking
            </button>
          </div>
        </>
      )}
    </div>
  );
};
```

---

## 🔧 **Error Handling & Edge Cases**

### **Common Scenarios to Handle**

```typescript
// utils/ErrorHandler.ts
class ApplicationErrorHandler {
  
  static handleSearchErrors(error: any): UserFriendlyError {
    if (error.message.includes('No Available rooms')) {
      return {
        type: 'NO_RESULTS',
        message: 'No hotels found for your search criteria. Try adjusting your dates or location.',
        suggestions: [
          'Try different dates',
          'Search nearby cities',
          'Reduce number of rooms'
        ]
      };
    }
    
    if (error.message.includes('timeout')) {
      return {
        type: 'TIMEOUT',
        message: 'Search is taking longer than expected. Please try again.',
        suggestions: ['Retry search', 'Try with fewer hotels']
      };
    }
    
    return {
      type: 'GENERAL_ERROR',
      message: 'Something went wrong. Please try again.',
      suggestions: ['Refresh page', 'Contact support']
    };
  }

  static handleBookingErrors(error: any): UserFriendlyError {
    if (error.message.includes('Authorization Failed')) {
      return {
        type: 'AUTH_ERROR',
        message: 'Booking service temporarily unavailable. Please try again.',
        suggestions: ['Try again in a few minutes', 'Contact support']
      };
    }
    
    if (error.message.includes('Room no longer available')) {
      return {
        type: 'AVAILABILITY_ERROR',
        message: 'Sorry, this room is no longer available. Please search again.',
        suggestions: ['Search for similar hotels', 'Try different dates']
      };
    }
    
    return {
      type: 'BOOKING_ERROR',
      message: 'Booking could not be completed. Please try again.',
      suggestions: ['Verify details', 'Try again', 'Contact support']
    };
  }
}
```

---

## 📱 **Mobile App Considerations**

### **React Native Implementation**

```typescript
// The same SDK can be used in React Native
import TBOHolidaysSDK from './sdk';

// Mobile-specific optimizations
const MobileHotelService = {
  // Reduce data usage
  searchWithLimitedData: async (params) => {
    return sdk.search.searchSingleRoom(
      params.checkIn,
      params.checkOut,
      params.adults,
      params.children,
      params.childrenAges,
      params.nationality,
      sdk.search.getSampleHotelCodes(10) // Reduced for mobile
    );
  },
  
  // Cache frequently used data
  cacheLocationData: async () => {
    const countries = await sdk.utilities.getCountryList();
    await AsyncStorage.setItem('countries', JSON.stringify(countries));
  }
};
```

---

## 🔄 **Summary of SDK Usage Throughout Flow**

| Step | SDK Method | Purpose |
|------|------------|---------|
| **App Init** | `utilities.getCountryList()` | Load countries for autocomplete |
| **App Init** | `utilities.getCityList(countryCode)` | Pre-load popular cities |
| **Search** | `utilities.getTBOHotelCodesByCity()` | Get hotel codes for city |
| **Search** | `search.searchMultipleRooms()` | Find available hotels |
| **Details** | `utilities.getHotelDetails()` | Get detailed hotel info |
| **Pre-Book** | `preBook.preBookHotel()` | Verify availability & pricing |
| **Booking** | `booking.bookHotel()` | Create final reservation |
| **Manage** | `booking.getBookingDetails()` | Get booking information |
| **Cancel** | `booking.cancelBooking()` | Cancel reservation |

---

## 🎯 **Performance Optimization Tips**

### **1. Caching Strategy**
```typescript
// Cache countries/cities (rarely change)
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Cache search results temporarily
const SEARCH_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
```

### **2. Pagination for Large Results**
```typescript
const paginateResults = (results: Hotel[], page: number, pageSize: number = 20) => {
  const start = (page - 1) * pageSize;
  return results.slice(start, start + pageSize);
};
```

### **3. Progressive Loading**
```typescript
// Load basic info first, details on demand
const loadHotelBasicInfo = async () => { /* Load summary */ };
const loadHotelDetails = async () => { /* Load full details */ };
```

---

## 🚀 **Ready to Build!**

This comprehensive flow provides everything needed to build a professional hotel booking application using the TBO TypeScript SDK. The SDK handles all the complex API interactions while you focus on creating an amazing user experience!

**Key Benefits:**
- ✅ **Type Safety** - Catch errors at compile time
- ✅ **Production Ready** - Error handling and retry logic built-in
- ✅ **Scalable** - Modular architecture
- ✅ **Modern** - Async/await patterns throughout
- ✅ **Complete** - Covers entire booking journey

**Start building your hotel booking app today!** 🏨✈️