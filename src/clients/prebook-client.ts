/**
 * PreBook Client for TBO API
 */

import { TBOBaseClient } from './base-client';
import {
  PreBookRequest,
  PreBookResponse,
  TBOClientConfig,
} from '../types/api-types';

export class PreBookClient extends TBOBaseClient {
  constructor(config?: TBOClientConfig) {
    super(config);
  }

  /**
   * Pre-book a hotel to verify availability and get final pricing
   */
  async preBookHotel(bookingCode: string, paymentMode: string = 'Limit'): Promise<PreBookResponse> {
    const request: PreBookRequest = {
      BookingCode: bookingCode,
      PaymentMode: paymentMode,
    };

    return this.makeRequest<PreBookResponse>('PreBook', request, 'POST');
  }

  /**
   * Extract pre-book information
   */
  extractPreBookInfo(response: PreBookResponse): {
    status: { code: number; description: string } | null;
    bookingCode: string | null;
    totalFare: number | null;
    currency: string | null;
    hotelName: string | null;
    checkIn: string | null;
    checkOut: string | null;
    isRefundable: boolean;
    cancellationPolicies: any[] | null;
  } {
    const info = {
      status: null as { code: number; description: string } | null,
      bookingCode: null as string | null,
      totalFare: null as number | null,
      currency: null as string | null,
      hotelName: null as string | null,
      checkIn: null as string | null,
      checkOut: null as string | null,
      isRefundable: false,
      cancellationPolicies: null as any[] | null,
    };

    // Extract status
    if (response.Status) {
      info.status = {
        code: response.Status.Code,
        description: response.Status.Description,
      };
    }

    // Extract booking details
    if (response.HotelBookingDetails) {
      const details = response.HotelBookingDetails;
      
      info.bookingCode = details.BookingCode;
      info.hotelName = details.HotelName;
      info.checkIn = details.CheckIn;
      info.checkOut = details.CheckOut;

      // Extract pricing
      if (details.Price) {
        info.totalFare = details.Price.OfferedPrice;
        info.currency = details.Price.CurrencyCode;
      }

      // Extract cancellation policies
      if (details.CancellationPolicies) {
        info.cancellationPolicies = details.CancellationPolicies.CancelPolicies;
        info.isRefundable = !details.CancellationPolicies.NonRefundable;
        
        // Check if first policy has no charge (free cancellation period)
        if (details.CancellationPolicies.CancelPolicies && 
            details.CancellationPolicies.CancelPolicies.length > 0) {
          const firstPolicy = details.CancellationPolicies.CancelPolicies[0];
          if (firstPolicy.CancellationCharge === 0) {
            info.isRefundable = true;
          }
        }
      }
    }

    return info;
  }

  /**
   * Validate pre-book response
   */
  validatePreBookResponse(response: PreBookResponse): { isValid: boolean; message: string } {
    const info = this.extractPreBookInfo(response);

    if (!info.status) {
      return { isValid: false, message: 'No status information in response' };
    }

    if (info.status.code !== 200) {
      return { isValid: false, message: `Pre-book failed: ${info.status.description}` };
    }

    if (!info.bookingCode) {
      return { isValid: false, message: 'No booking code in response' };
    }

    if (!info.totalFare) {
      return { isValid: false, message: 'No pricing information available' };
    }

    return { isValid: true, message: 'Pre-book successful' };
  }

  /**
   * Print pre-book summary
   */
  printPreBookSummary(response: PreBookResponse): void {
    const info = this.extractPreBookInfo(response);
    const validation = this.validatePreBookResponse(response);

    console.log('\n' + '='.repeat(60));
    console.log('PRE-BOOKING SUMMARY');
    console.log('='.repeat(60));
    
    if (validation.isValid) {
      console.log(`✅ ${validation.message}`);
      console.log(`Hotel Name: ${info.hotelName}`);
      console.log(`Check-in: ${info.checkIn}`);
      console.log(`Check-out: ${info.checkOut}`);
      console.log(`Total Fare: ${info.totalFare} ${info.currency}`);
      console.log(`Refundable: ${info.isRefundable ? 'Yes' : 'No'}`);
      console.log(`Booking Code: ${info.bookingCode}`);
    } else {
      console.log(`❌ ${validation.message}`);
      if (info.status) {
        console.log(`Status: ${info.status.code} - ${info.status.description}`);
      }
    }
    
    console.log('='.repeat(60));
  }
}