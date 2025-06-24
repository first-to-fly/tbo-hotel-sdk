/**
 * Hotel Search Client for TBO API
 */

import { TBOBaseClient } from './base-client';
import {
  HotelSearchRequest,
  HotelSearchResponse,
  PaxRoom,
  SearchFilters,
  TBOClientConfig,
} from '../types/api-types';

export class HotelSearchClient extends TBOBaseClient {
  constructor(config?: TBOClientConfig) {
    super(config);
  }

  /**
   * Search for available hotels
   */
  async searchHotels(request: HotelSearchRequest): Promise<HotelSearchResponse> {
    return this.makeRequest<HotelSearchResponse>('search', request, 'POST');
  }

  /**
   * Search for a single room
   */
  async searchSingleRoom(
    checkIn: string,
    checkOut: string,
    adults: number = 1,
    children: number = 0,
    childrenAges: number[] = [],
    guestNationality: string = 'AE',
    hotelCodes?: string,
    options: {
      responseTime?: number;
      isDetailedResponse?: boolean;
      filters?: SearchFilters;
    } = {}
  ): Promise<HotelSearchResponse> {
    const paxRooms: PaxRoom[] = [{
      Adults: adults,
      Children: children,
      ChildrenAges: childrenAges,
    }];

    const request: HotelSearchRequest = {
      CheckIn: checkIn,
      CheckOut: checkOut,
      GuestNationality: guestNationality,
      PaxRooms: paxRooms,
      ResponseTime: options.responseTime || 20.0,
      IsDetailedResponse: options.isDetailedResponse !== false,
      Filters: options.filters || {
        Refundable: false,
        NoOfRooms: 0,
        MealType: 'All',
      },
    };

    if (hotelCodes) {
      request.HotelCodes = hotelCodes;
    }

    return this.searchHotels(request);
  }

  /**
   * Search for multiple rooms
   */
  async searchMultipleRooms(
    checkIn: string,
    checkOut: string,
    roomConfigs: Array<{
      adults: number;
      children?: number;
      childrenAges?: number[];
    }>,
    guestNationality: string = 'AE',
    hotelCodes?: string,
    options: {
      responseTime?: number;
      isDetailedResponse?: boolean;
      filters?: SearchFilters;
    } = {}
  ): Promise<HotelSearchResponse> {
    const paxRooms: PaxRoom[] = roomConfigs.map(config => ({
      Adults: config.adults,
      Children: config.children || 0,
      ChildrenAges: config.childrenAges || [],
    }));

    const request: HotelSearchRequest = {
      CheckIn: checkIn,
      CheckOut: checkOut,
      GuestNationality: guestNationality,
      PaxRooms: paxRooms,
      ResponseTime: options.responseTime || 25.0,
      IsDetailedResponse: options.isDetailedResponse !== false,
      Filters: options.filters || {
        Refundable: false,
        NoOfRooms: 0,
        MealType: 'All',
      },
    };

    if (hotelCodes) {
      request.HotelCodes = hotelCodes;
    }

    return this.searchHotels(request);
  }

  /**
   * Extract booking codes from search response
   */
  extractBookingCodes(response: HotelSearchResponse): string[] {
    const bookingCodes: string[] = [];
    
    if (response.HotelResult) {
      for (const hotel of response.HotelResult) {
        if (hotel.Rooms) {
          for (const room of hotel.Rooms) {
            if (room.BookingCode) {
              bookingCodes.push(room.BookingCode);
            }
          }
        }
      }
    }
    
    return bookingCodes;
  }

  /**
   * Get search summary
   */
  getSearchSummary(response: HotelSearchResponse): {
    totalHotels: number;
    totalRooms: number;
    totalBookingCodes: number;
    priceRange: { min: number; max: number; currency: string } | null;
  } {
    let totalHotels = 0;
    let totalRooms = 0;
    let totalBookingCodes = 0;
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let currency = '';

    if (response.HotelResult) {
      totalHotels = response.HotelResult.length;
      
      for (const hotel of response.HotelResult) {
        if (hotel.Rooms) {
          totalRooms += hotel.Rooms.length;
          currency = hotel.Currency || currency;
          
          for (const room of hotel.Rooms) {
            if (room.BookingCode) {
              totalBookingCodes++;
            }
            if (room.TotalFare) {
              minPrice = Math.min(minPrice, room.TotalFare);
              maxPrice = Math.max(maxPrice, room.TotalFare);
            }
          }
        }
      }
    }

    return {
      totalHotels,
      totalRooms,
      totalBookingCodes,
      priceRange: totalBookingCodes > 0 ? {
        min: minPrice === Infinity ? 0 : minPrice,
        max: maxPrice === -Infinity ? 0 : maxPrice,
        currency,
      } : null,
    };
  }
}