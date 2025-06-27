/**
 * TBO Holidays Hotel API TypeScript Types
 */

// Base API Response
export interface APIResponse<T = unknown> {
  Status: {
    Code: number;
    Description: string;
  };
  ResponseTime?: number;
  data?: T;
}

// Hotel Search Types
export interface PaxRoom {
  Adults: number;
  Children: number;
  ChildrenAges: number[];
}

export interface SearchFilters {
  Refundable: boolean;
  NoOfRooms: number;
  MealType: string;
}

export interface HotelSearchRequest {
  CheckIn: string;
  CheckOut: string;
  GuestNationality: string;
  PaxRooms: PaxRoom[];
  HotelCodes?: string;
  ResponseTime?: number;
  IsDetailedResponse?: boolean;
  Filters?: SearchFilters;
}

export interface CancellationPolicy {
  FromDate: string;
  ChargeType: string;
  CancellationCharge: number;
}

export interface Room {
  Name: string[];
  BookingCode: string;
  Inclusion: string;
  DayRates?: Array<Array<{ BasePrice: number }>>;
  TotalFare: number;
  TotalTax: number;
  RoomPromotion: any[];
  CancelPolicies: CancellationPolicy[];
  MealType: string;
  IsRefundable: boolean;
  WithTransfers: boolean;
}

export interface HotelResult {
  HotelCode: string;
  Currency: string;
  Rooms: Room[];
}

export interface HotelSearchResponse extends APIResponse {
  HotelResult: HotelResult[];
}

// PreBook Types
export interface PreBookRequest {
  BookingCode: string;
  PaymentMode: string;
}

export interface Price {
  RoomPrice: number;
  Tax: number;
  ExtraGuestCharge: number;
  ChildCharge: number;
  OtherCharges: number;
  Discount: number;
  PublishedPrice: number;
  PublishedPriceRoundedOff: number;
  OfferedPrice: number;
  OfferedPriceRoundedOff: number;
  AgentCommission: number;
  AgentMarkUp: number;
  ServiceTax: number;
  TDS: number;
  CurrencyCode: string;
}

export interface RoomDetails {
  RoomIndex: number;
  RoomTypeName: string;
  RatePlanName: string;
  BedTypeName: string;
  SmokingPreference: string;
  Inclusion: string[];
  RoomDescription?: string;
}

export interface HotelBookingDetails {
  BookingCode: string;
  HotelCode: string;
  HotelName: string;
  CheckIn: string;
  CheckOut: string;
  Price: Price;
  RoomDetails: RoomDetails[];
  CancellationPolicies: {
    CancelPolicies: CancellationPolicy[];
    NonRefundable: boolean;
  };
  HotelDetails: {
    Address: string;
    HotelContactNo: string;
    HotelEmailId: string;
    StarRating: number;
  };
}

export interface PreBookResponse extends APIResponse {
  HotelBookingDetails: HotelBookingDetails;
}

// Booking Types
export interface CustomerName {
  Title: string;
  FirstName: string;
  LastName: string;
  Type: 'Adult' | 'Child';
}

export interface CustomerDetails {
  CustomerNames: CustomerName[];
}

export interface CardHolderAddress {
  AddressLine1: string;
  AddressLine2?: string;
  City: string;
  PostalCode: string;
  CountryCode: string;
}

export interface PaymentInfo {
  CvvNumber: string;
  CardNumber?: string;
  CardExpirationMonth?: string;
  CardExpirationYear?: string;
  CardHolderFirstName?: string;
  CardHolderlastName?: string;
  BillingAmount?: number;
  BillingCurrency?: string;
  CardHolderAddress?: CardHolderAddress;
}

export interface HotelBookRequest {
  BookingCode: string;
  CustomerDetails: CustomerDetails[];
  ClientReferenceId?: string;
  BookingReferenceId?: string;
  TotalFare: number;
  EmailId: string;
  PhoneNumber: string;
  BookingType?: string;
  PaymentMode: 'Limit' | 'SavedCard' | 'Card';
  PaymentInfo?: PaymentInfo;
}

export interface BookingResponse extends APIResponse {
  BookingDetails: {
    ConfirmationNumber: string;
    BookingId: number;
    BookingReferenceId: string;
    BookingStatus: string;
    InvoiceNumber: string;
    HotelName: string;
    HotelCode: string;
    CheckIn: string;
    CheckOut: string;
    Price: Price;
    CustomerDetails: CustomerDetails[];
    HotelDetails: {
      Address: string;
      HotelContactNo: string;
      HotelEmailId: string;
    };
    CancellationPolicies: {
      CancelPolicies: CancellationPolicy[];
    };
  };
}

// Utilities Types
export interface Country {
  Code: string;
  Name: string;
}

export interface CountryListResponse extends APIResponse {
  CountryList: Country[];
}

export interface City {
  Code: string;
  Name: string;
  CountryCode: string;
}

export interface CityListRequest {
  CountryCode: string;
}

export interface CityListResponse extends APIResponse {
  CityList: City[];
}

export interface HotelDetailsRequest {
  Hotelcodes: string;
  Language?: string;
}

export interface HotelDetail {
  HotelCode: string;
  HotelName: string;
  StarRating: number;
  Address: string;
  City: string;
  Country: string;
  Pincode: string;
  ContactNumber: string;
  EmailId: string;
  Website: string;
  Description: string;
  Facilities: string[];
  HotelImages: Array<{
    ImageUrl: string;
    Description: string;
  }>;
  CheckInTime: string;
  CheckOutTime: string;
  Latitude: number;
  Longitude: number;
}

export interface HotelDetailsResponse extends APIResponse {
  HotelDetails: HotelDetail[];
}

// Cancellation Types
export interface CancelRequest {
  ConfirmationNumber: string;
}

export interface CancelResponse extends APIResponse {
  CancellationDetails: {
    ConfirmationNumber: string;
    BookingReferenceId: string;
    CancellationId: string;
    CancellationStatus: string;
    CancellationDate: string;
    HotelName: string;
    RefundDetails: {
      RefundAmount: number;
      CancellationCharge: number;
      Currency: string;
      OriginalBookingAmount: number;
      NetRefundAmount: number;
    };
  };
}

// Booking Details Types
export interface BookingDetailRequest {
  BookingReferenceId: string;
  PaymentMode: string;
}

export interface BookingDetailResponse extends APIResponse {
  BookingDetails: HotelBookingDetails;
}

export interface BookingsByDateRequest {
  FromDate: string;
  ToDate: string;
}

export interface BookingsByDateResponse extends APIResponse {
  BookingDetails: Array<{
    BookingId: number;
    BookingReferenceId: string;
    ConfirmationNumber: string;
    BookingStatus: string;
    HotelName: string;
    CheckIn: string;
    CheckOut: string;
    Price: {
      OfferedPrice: number;
      CurrencyCode: string;
    };
  }>;
}

// Client Configuration
export interface TBOClientConfig {
  baseURL?: string;
  username?: string;
  password?: string;
  timeout?: number;
  retries?: number;
}

// Error Types
export interface TBOError extends Error {
  code?: number;
  response?: any;
  request?: any;
}