import Constants from 'expo-constants';

type Environment = {
  apiUrl: string;
  wsUrl: string;
};

const ENV: Record<string, Environment> = {
  dev: {
    apiUrl: 'http://localhost:3002',
    wsUrl: 'ws://localhost:3002',
  },
  staging: {
    apiUrl: 'https://staging-api.example.com',
    wsUrl: 'wss://staging-api.example.com',
  },
  prod: {
    apiUrl: 'https://api.example.com',
    wsUrl: 'wss://api.example.com',
  },
};

const getEnvVars = (): Environment => {
  // Check if running in development mode
  if (__DEV__) {
    return ENV.dev;
  }

  // Check for staging environment
  if (Constants.expoConfig?.extra?.environment === 'staging') {
    return ENV.staging;
  }

  // Default to production
  return ENV.prod;
};

export default getEnvVars();
