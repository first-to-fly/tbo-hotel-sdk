/**
 * Utilities Client for TBO API (Countries, Cities, Hotel Details)
 */

import { TBOBaseClient } from './base-client';
import {
  CountryListResponse,
  CityListRequest,
  CityListResponse,
  HotelDetailsRequest,
  HotelDetailsResponse,
  Country,
  City,
  HotelDetail,
  TBOClientConfig,
} from '../types/api-types';

export class UtilitiesClient extends TBOBaseClient {
  constructor(config?: TBOClientConfig) {
    super(config);
  }

  /**
   * Get list of all countries
   */
  async getCountryList(): Promise<CountryListResponse> {
    return this.makeRequest<CountryListResponse>('CountryList', {}, 'GET');
  }

  /**
   * Get list of cities for a specific country
   */
  async getCityList(countryCode: string): Promise<CityListResponse> {
    const request: CityListRequest = {
      CountryCode: countryCode,
    };
    return this.makeRequest<CityListResponse>('CityList', request, 'POST');
  }

  /**
   * Get detailed information for specific hotels
   */
  async getHotelDetails(hotelCodes: string, language: string = 'en'): Promise<HotelDetailsResponse> {
    const request: HotelDetailsRequest = {
      Hotelcodes: hotelCodes,
      Language: language,
    };
    return this.makeRequest<HotelDetailsResponse>('Hoteldetails', request, 'POST');
  }

  /**
   * Get all hotel codes list
   */
  async getHotelCodesList(): Promise<any> {
    return this.makeRequest('hotelcodelist', {}, 'GET');
  }

  /**
   * Get TBO hotel codes for a specific city
   */
  async getTBOHotelCodesByCity(cityCode: string, isDetailedResponse: boolean = true): Promise<any> {
    const request = {
      CityCode: cityCode,
      IsDetailedResponse: isDetailedResponse.toString(),
    };
    return this.makeRequest('TBOHotelCodeList', request, 'POST');
  }

  /**
   * Extract countries from response
   */
  extractCountries(response: CountryListResponse): Country[] {
    return response.CountryList || [];
  }

  /**
   * Extract cities from response
   */
  extractCities(response: CityListResponse): City[] {
    return response.CityList || [];
  }

  /**
   * Extract hotel details from response
   */
  extractHotelDetails(response: HotelDetailsResponse): HotelDetail[] {
    return response.HotelDetails || [];
  }

  /**
   * Find countries by name (case-insensitive search)
   */
  async findCountriesByName(searchTerm: string): Promise<Country[]> {
    const response = await this.getCountryList();
    const countries = this.extractCountries(response);
    
    return countries.filter(country =>
      country.Name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  /**
   * Find cities by name within a country
   */
  async findCitiesByName(countryCode: string, searchTerm: string): Promise<City[]> {
    const response = await this.getCityList(countryCode);
    const cities = this.extractCities(response);
    
    return cities.filter(city =>
      city.Name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  /**
   * Get popular countries
   */
  async getPopularCountries(): Promise<Country[]> {
    const response = await this.getCountryList();
    const countries = this.extractCountries(response);
    const popularCodes = ['AE', 'US', 'GB', 'IN', 'FR', 'DE', 'JP', 'AU', 'CA', 'IT'];
    
    return countries.filter(country => popularCodes.includes(country.Code));
  }

  /**
   * Get location data for a specific country
   */
  async getLocationData(countryCode: string): Promise<{
    country: Country | null;
    cities: City[];
  }> {
    try {
      // Get country info
      const countriesResponse = await this.getCountryList();
      const countries = this.extractCountries(countriesResponse);
      const country = countries.find(c => c.Code === countryCode) || null;

      // Get cities
      const citiesResponse = await this.getCityList(countryCode);
      const cities = this.extractCities(citiesResponse);

      return { country, cities };
    } catch (error) {
      console.error(`Error getting location data for ${countryCode}:`, error);
      return { country: null, cities: [] };
    }
  }

  /**
   * Search hotels by city name
   */
  async searchHotelsByCity(cityName: string, countryCode: string): Promise<string[]> {
    try {
      // First, find the city
      const cities = await this.findCitiesByName(countryCode, cityName);
      
      if (cities.length === 0) {
        console.log(`No cities found matching "${cityName}" in ${countryCode}`);
        return [];
      }

      const city = cities[0]; // Use first match
      
      // Get hotel codes for this city
      const hotelCodesResponse = await this.getTBOHotelCodesByCity(city.Code);
      
      if (hotelCodesResponse.Hotels) {
        return hotelCodesResponse.Hotels.map((hotel: any) => hotel.HotelCode);
      }
      
      return [];
    } catch (error) {
      console.error(`Error searching hotels in ${cityName}:`, error);
      return [];
    }
  }

  /**
   * Get comprehensive hotel information
   */
  async getComprehensiveHotelInfo(hotelCodes: string[]): Promise<HotelDetail[]> {
    try {
      const codesString = hotelCodes.slice(0, 20).join(','); // Limit to 20 hotels
      const response = await this.getHotelDetails(codesString);
      return this.extractHotelDetails(response);
    } catch (error) {
      console.error('Error getting comprehensive hotel info:', error);
      return [];
    }
  }
}