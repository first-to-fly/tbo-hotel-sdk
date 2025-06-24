/**
 * Base HTTP client for TBO Holidays Hotel API
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { TBOClientConfig, TBOError, APIResponse } from '../types/api-types';

export class TBOBaseClient {
  private client: AxiosInstance;
  private config: Required<TBOClientConfig>;

  constructor(config: TBOClientConfig = {}) {
    this.config = {
      baseURL: config.baseURL || 'http://api.tbotechnology.in/TBOHolidays_HotelAPI',
      username: config.username || process.env.TBO_USERNAME || '',
      password: config.password || process.env.TBO_PASSWORD || '',
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
    };

    if (!this.config.username || !this.config.password) {
      console.warn('⚠️  TBO API credentials not provided. Please set username and password in config or environment variables (TBO_USERNAME, TBO_PASSWORD)');
    }

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      auth: {
        username: this.config.username,
        password: this.config.password,
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`📤 Making ${config.method?.toUpperCase()} request to ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request error:', error.message);
        return Promise.reject(this.createTBOError(error));
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`📥 Received response: ${response.status} ${response.statusText}`);
        return response;
      },
      async (error) => {
        console.error('❌ Response error:', error.message);
        
        // Retry logic
        const config = error.config as AxiosRequestConfig & { _retryCount?: number };
        if (config && (config._retryCount || 0) < this.config.retries) {
          config._retryCount = (config._retryCount || 0) + 1;
          
          console.log(`🔄 Retrying request... Attempt ${config._retryCount}`);
          await this.delay(1000 * config._retryCount); // Exponential backoff
          
          return this.client.request(config);
        }
        
        return Promise.reject(this.createTBOError(error));
      }
    );
  }

  private createTBOError(error: any): TBOError {
    const tboError = new Error(error.message) as TBOError;
    tboError.code = error.response?.status;
    tboError.response = error.response?.data;
    tboError.request = error.config;
    return tboError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Make HTTP request with automatic authentication handling
   */
  protected async makeRequest<T extends APIResponse>(
    endpoint: string,
    data: any = {},
    method: 'GET' | 'POST' = 'POST'
  ): Promise<T> {
    const config: AxiosRequestConfig & { _retryCount?: number } = {
      method,
      url: `/${endpoint}`,
      _retryCount: 0,
    };

    // Add data
    if (method === 'POST') {
      config.data = data;
    } else if (method === 'GET' && Object.keys(data).length > 0) {
      config.params = data;
    }

    try {
      const response: AxiosResponse<T> = await this.client.request(config);
      return response.data;
    } catch (error: any) {
      throw this.createTBOError(error);
    }
  }

  /**
   * Utility methods
   */
  public formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  public getTestDates(daysAhead: number = 30, nights: number = 1): { checkIn: string; checkOut: string } {
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + daysAhead);
    
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + nights);
    
    return {
      checkIn: this.formatDate(checkIn),
      checkOut: this.formatDate(checkOut),
    };
  }

  public getSampleHotelCodes(limit: number = 10): string {
    const codes = [
      '1402689', '1405349', '1405355', '1407362', '1413911',
      '1414353', '1415021', '1415135', '1415356', '1415518',
      '1415792', '1416419', '1416455', '1416461', '1416726',
      '1440549', '1440646', '1440710', '1440886', '1440924'
    ];
    return codes.slice(0, limit).join(',');
  }

  public prettyPrint(data: any, title: string = 'API Response'): void {
    console.log(`\n${'='.repeat(60)}`);
    console.log(title);
    console.log('='.repeat(60));
    console.log(JSON.stringify(data, null, 2));
    console.log('='.repeat(60));
  }
}