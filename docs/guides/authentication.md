# Authentication Guide

Complete guide to authentication and configuration for the TBO Holidays TypeScript SDK.

## 🔐 Authentication Overview

The TBO Holidays API uses HTTP Basic Authentication for all requests. The SDK handles authentication automatically once configured.

### Authentication Method
- **Type**: HTTP Basic Auth
- **Format**: `Authorization: Basic base64(username:password)`
- **Required**: All API endpoints require authentication

## ⚙️ Configuration Methods

### 1. Environment Variables (Recommended)

Create a `.env` file in your project root:

```env
# TBO API Configuration
TBO_BASE_URL=http://api.tbotechnology.in/TBOHolidays_HotelAPI
TBO_USERNAME=your-api-username
TBO_PASSWORD=your-api-password
TBO_TIMEOUT=30000
TBO_RETRIES=3

# Optional logging
TBO_LOG_LEVEL=info
TBO_LOG_REQUESTS=true
TBO_LOG_RESPONSES=false
```

Load environment variables in your application:

```typescript
import 'dotenv/config'; // Load .env file
import TBOHolidaysSDK from "tbo-hotel-sdk";

// SDK automatically uses environment variables
const sdk = new TBOHolidaysSDK();
```

### 2. Direct Configuration

```typescript
import TBOHolidaysSDK from "tbo-hotel-sdk";

const sdk = new TBOHolidaysSDK({
  baseURL: "http://api.tbotechnology.in/TBOHolidays_HotelAPI",
  username: "your-api-username",
  password: "your-api-password",
  timeout: 30000,
  retries: 3
});
```

### 3. Mixed Configuration

Environment variables with override:

```typescript
const sdk = new TBOHolidaysSDK({
  // Override specific settings while using env vars for credentials
  timeout: 60000,    // Custom timeout
  retries: 5         // Custom retry count
  // username and password from environment variables
});
```

## 🌍 Environment Configuration

### Staging Environment

```env
# Staging/Test Environment
TBO_BASE_URL=http://api.tbotechnology.in/TBOHolidays_HotelAPI
TBO_USERNAME=your-staging-username
TBO_PASSWORD=your-staging-password
```

### Production Environment

```env
# Production Environment
TBO_BASE_URL=https://api.tboholidays.com/TBOHolidays_HotelAPI
TBO_USERNAME=your-production-username
TBO_PASSWORD=your-production-password
```

### Multiple Environments

```typescript
// config/environments.ts
export const environments = {
  development: {
    baseURL: "http://api.tbotechnology.in/TBOHolidays_HotelAPI",
    username: process.env.TBO_DEV_USERNAME,
    password: process.env.TBO_DEV_PASSWORD
  },
  
  staging: {
    baseURL: "http://api.tbotechnology.in/TBOHolidays_HotelAPI",
    username: process.env.TBO_STAGING_USERNAME,
    password: process.env.TBO_STAGING_PASSWORD
  },
  
  production: {
    baseURL: "https://api.tboholidays.com/TBOHolidays_HotelAPI",
    username: process.env.TBO_PROD_USERNAME,
    password: process.env.TBO_PROD_PASSWORD
  }
};

// Usage
const env = process.env.NODE_ENV || 'development';
const config = environments[env];

const sdk = new TBOHolidaysSDK(config);
```

## 🔧 Configuration Options

### Complete Configuration Interface

```typescript
interface TBOClientConfig {
  baseURL?: string;     // API base URL
  username?: string;    // API username
  password?: string;    // API password
  timeout?: number;     // Request timeout in milliseconds
  retries?: number;     // Number of retry attempts
}
```

### Default Values

```typescript
const defaultConfig = {
  baseURL: 'http://api.tbotechnology.in/TBOHolidays_HotelAPI',
  username: process.env.TBO_USERNAME || '',
  password: process.env.TBO_PASSWORD || '',
  timeout: 30000,    // 30 seconds
  retries: 3         // 3 retry attempts
};
```

## 🧪 Testing Authentication

### Connection Test

```typescript
async function testAuthentication() {
  const sdk = new TBOHolidaysSDK();
  
  try {
    console.log('🔐 Testing authentication...');
    
    // Test with country list (simplest endpoint)
    const response = await sdk.utilities.getCountryList();
    
    switch (response.Status.Code) {
      case 200:
        console.log('✅ Authentication successful');
        console.log('🌍 API access confirmed');
        return true;
        
      case 401:
        console.log('❌ Authentication failed');
        console.log('🔑 Check your username and password');
        return false;
        
      default:
        console.log(`⚠️ Unexpected response: ${response.Status.Code}`);
        console.log(`📝 Description: ${response.Status.Description}`);
        return false;
    }
    
  } catch (error) {
    console.error('🚫 Connection error:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('🌐 Check your base URL and internet connection');
    }
    
    return false;
  }
}

// Usage
const isAuthenticated = await testAuthentication();
if (isAuthenticated) {
  console.log('Ready to use TBO API');
} else {
  console.log('Fix authentication before proceeding');
}
```

### Built-in Connection Test

```typescript
// Use SDK's built-in connection test
const sdk = new TBOHolidaysSDK();
const connectionTest = await sdk.testConnection();

console.log(`Connected: ${connectionTest.connected}`);
console.log('Endpoint Status:', connectionTest.endpoints);

if (connectionTest.errors.length > 0) {
  console.log('Errors:', connectionTest.errors);
}
```

## 🛡️ Security Best Practices

### 1. Environment Variables

```bash
# Never commit credentials to version control
echo ".env" >> .gitignore

# Use different credentials for different environments
# Development
TBO_DEV_USERNAME=dev-username
TBO_DEV_PASSWORD=dev-password

# Production  
TBO_PROD_USERNAME=prod-username
TBO_PROD_PASSWORD=prod-password
```

### 2. Credential Rotation

```typescript
// Implement credential rotation
class CredentialManager {
  private credentials: Map<string, { username: string; password: string; expires: Date }>;
  
  constructor() {
    this.credentials = new Map();
  }
  
  async getCredentials(environment: string): Promise<{ username: string; password: string }> {
    const cached = this.credentials.get(environment);
    
    if (cached && cached.expires > new Date()) {
      return { username: cached.username, password: cached.password };
    }
    
    // Fetch fresh credentials from secure store
    const fresh = await this.fetchCredentials(environment);
    
    // Cache with expiry
    this.credentials.set(environment, {
      ...fresh,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
    
    return fresh;
  }
  
  private async fetchCredentials(environment: string) {
    // Implement secure credential fetching
    // e.g., AWS Secrets Manager, Azure Key Vault, etc.
    throw new Error('Implement credential fetching');
  }
}
```

### 3. Secrets Management

```typescript
// AWS Secrets Manager example
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

async function getTBOCredentials(environment: string) {
  const client = new SecretsManagerClient({ region: "us-east-1" });
  
  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: `tbo-api-credentials-${environment}`
      })
    );
    
    const credentials = JSON.parse(response.SecretString);
    
    return {
      username: credentials.username,
      password: credentials.password
    };
    
  } catch (error) {
    console.error('Failed to retrieve credentials:', error);
    throw error;
  }
}

// Usage
const credentials = await getTBOCredentials('production');
const sdk = new TBOHolidaysSDK({
  username: credentials.username,
  password: credentials.password
});
```

## 🔄 Authentication Middleware

### Request Interceptor

```typescript
import axios from 'axios';

// Custom authentication interceptor
class TBOAuth {
  constructor(private username: string, private password: string) {}
  
  setupInterceptors(axiosInstance: any) {
    // Request interceptor
    axiosInstance.interceptors.request.use(
      (config: any) => {
        // Add authentication header
        const credentials = Buffer.from(`${this.username}:${this.password}`).toString('base64');
        config.headers.Authorization = `Basic ${credentials}`;
        
        // Log request (remove in production)
        console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
        
        return config;
      },
      (error: any) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );
    
    // Response interceptor
    axiosInstance.interceptors.response.use(
      (response: any) => {
        console.log(`📥 ${response.status} ${response.statusText}`);
        return response;
      },
      (error: any) => {
        if (error.response?.status === 401) {
          console.error('🔐 Authentication failed - check credentials');
        }
        return Promise.reject(error);
      }
    );
  }
}
```

## 🐛 Troubleshooting Authentication

### Common Authentication Errors

#### 1. "Access Credentials is incorrect"

```typescript
// Status Code: 401
// Description: "Access Credentials is incorrect"

// Solutions:
// 1. Check username/password
const credentials = {
  username: process.env.TBO_USERNAME,
  password: process.env.TBO_PASSWORD
};

console.log('Username:', credentials.username ? '✅ Set' : '❌ Missing');
console.log('Password:', credentials.password ? '✅ Set' : '❌ Missing');

// 2. Verify environment variables are loaded
if (!process.env.TBO_USERNAME || !process.env.TBO_PASSWORD) {
  console.error('❌ Environment variables not loaded');
  console.log('Make sure to import dotenv/config');
}

// 3. Test with known working credentials
const testSdk = new TBOHolidaysSDK({
  username: 'known-working-username',
  password: 'known-working-password'
});
```

#### 2. "Login Failed for Member"

```typescript
// Status Code: 401  
// Description: "Login Failed for Member"

// This typically indicates:
// 1. Account is suspended or inactive
// 2. IP address restrictions
// 3. Account limits exceeded

async function diagnoseLoginFailure() {
  console.log('🔍 Diagnosing login failure...');
  
  // Check if credentials are being sent
  const sdk = new TBOHolidaysSDK();
  
  try {
    const response = await sdk.utilities.getCountryList();
    console.log('Response:', response.Status);
  } catch (error) {
    console.log('Request headers:', error.config?.headers);
    console.log('Auth header present:', !!error.config?.headers?.Authorization);
  }
}
```

#### 3. Connection Errors

```typescript
async function diagnoseConnection() {
  const issues = [];
  
  // Test DNS resolution
  try {
    const dns = require('dns');
    await new Promise((resolve, reject) => {
      dns.lookup('api.tbotechnology.in', (err) => {
        if (err) reject(err);
        else resolve(null);
      });
    });
    console.log('✅ DNS resolution working');
  } catch (error) {
    issues.push('❌ DNS resolution failed');
  }
  
  // Test basic connectivity
  try {
    const response = await fetch('http://api.tbotechnology.in');
    console.log('✅ Basic connectivity working');
  } catch (error) {
    issues.push('❌ Basic connectivity failed');
  }
  
  // Test with SDK
  try {
    const sdk = new TBOHolidaysSDK();
    await sdk.utilities.getCountryList();
    console.log('✅ SDK connectivity working');
  } catch (error) {
    issues.push(`❌ SDK error: ${error.message}`);
  }
  
  if (issues.length > 0) {
    console.log('🚨 Issues found:');
    issues.forEach(issue => console.log(`   ${issue}`));
  }
}
```

### Debug Mode

```typescript
// Enable debug logging
const sdk = new TBOHolidaysSDK({
  // ... your config
});

// Set environment variable for detailed logging
process.env.TBO_LOG_REQUESTS = 'true';
process.env.TBO_LOG_RESPONSES = 'true';
process.env.TBO_LOG_LEVEL = 'debug';

// This will log all requests and responses
const response = await sdk.utilities.getCountryList();
```

## 📝 Configuration Examples

### Development Setup

```typescript
// development.ts
import 'dotenv/config';
import TBOHolidaysSDK from "tbo-hotel-sdk";

const sdk = new TBOHolidaysSDK({
  timeout: 10000,  // Shorter timeout for development
  retries: 1       // Fewer retries for faster feedback
});

export default sdk;
```

### Production Setup

```typescript
// production.ts
import TBOHolidaysSDK from "tbo-hotel-sdk";

const sdk = new TBOHolidaysSDK({
  baseURL: process.env.TBO_PROD_BASE_URL,
  username: process.env.TBO_PROD_USERNAME,
  password: process.env.TBO_PROD_PASSWORD,
  timeout: 60000,  // Longer timeout for production
  retries: 5       // More retries for reliability
});

export default sdk;
```

### Testing Setup

```typescript
// test-setup.ts
import TBOHolidaysSDK from "tbo-hotel-sdk";

// Mock SDK for testing
export const mockSdk = {
  utilities: {
    getCountryList: jest.fn(),
    getCityList: jest.fn(),
    getHotelDetails: jest.fn()
  },
  search: {
    searchSingleRoom: jest.fn(),
    searchMultipleRooms: jest.fn()
  },
  preBook: {
    preBookHotel: jest.fn()
  }
};

// Real SDK with test credentials
export const testSdk = new TBOHolidaysSDK({
  username: process.env.TBO_TEST_USERNAME,
  password: process.env.TBO_TEST_PASSWORD,
  timeout: 5000
});
```

## 🔗 Related Documentation

- [Quick Start Guide](../examples/quickstart.md) - Basic authentication setup
- [Error Handling](./error-handling.md) - Handle authentication errors
- [API Overview](../api/overview.md) - Authentication requirements per endpoint