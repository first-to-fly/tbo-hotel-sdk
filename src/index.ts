/**
 * TBO Holidays Hotel API - TypeScript SDK
 * Main entry point
 */

// Export all types
export * from './types/api-types';

// Export all clients
export { TBOBaseClient } from './clients/base-client';
export { HotelSearchClient } from './clients/hotel-search-client';
export { UtilitiesClient } from './clients/utilities-client';
export { PreBookClient } from './clients/prebook-client';

// Main SDK class
import { TBOClientConfig } from './types/api-types';
import { HotelSearchClient } from './clients/hotel-search-client';
import { UtilitiesClient } from './clients/utilities-client';
import { PreBookClient } from './clients/prebook-client';

export class TBOHolidaysSDK {
  public search: HotelSearchClient;
  public utilities: UtilitiesClient;
  public preBook: PreBookClient;

  constructor(config?: TBOClientConfig) {
    this.search = new HotelSearchClient(config);
    this.utilities = new UtilitiesClient(config);
    this.preBook = new PreBookClient(config);
  }

  /**
   * Get SDK information
   */
  getInfo(): {
    name: string;
    version: string;
    description: string;
    endpoints: string[];
  } {
    return {
      name: 'TBO Holidays TypeScript SDK',
      version: '1.0.0',
      description: 'TypeScript SDK for TBO Holidays Hotel API',
      endpoints: [
        'Hotel Search',
        'PreBook',
        'Hotel Book',
        'Booking Details',
        'Cancellation',
        'Country List',
        'City List',
        'Hotel Details',
      ],
    };
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<{
    connected: boolean;
    endpoints: Record<string, boolean>;
    errors: string[];
  }> {
    const results = {
      connected: true,
      endpoints: {} as Record<string, boolean>,
      errors: [] as string[],
    };

    // Test country list (simplest endpoint)
    try {
      const response = await this.utilities.getCountryList();
      results.endpoints['CountryList'] = response.Status.Code === 200;
      if (response.Status.Code !== 200) {
        results.errors.push(`CountryList: ${response.Status.Description}`);
      }
    } catch (error: any) {
      results.endpoints['CountryList'] = false;
      results.errors.push(`CountryList: ${error.message}`);
      results.connected = false;
    }

    // Test hotel search
    try {
      const { checkIn, checkOut } = this.search.getTestDates(30, 1);
      const response = await this.search.searchSingleRoom(
        checkIn,
        checkOut,
        1,
        0,
        [],
        'AE',
        this.search.getSampleHotelCodes(3)
      );
      results.endpoints['HotelSearch'] = response.Status.Code === 200;
      if (response.Status.Code !== 200) {
        results.errors.push(`HotelSearch: ${response.Status.Description}`);
      }
    } catch (error: any) {
      results.endpoints['HotelSearch'] = false;
      results.errors.push(`HotelSearch: ${error.message}`);
    }

    return results;
  }
}

// Default export
export default TBOHolidaysSDK;