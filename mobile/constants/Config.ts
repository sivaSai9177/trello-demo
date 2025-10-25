import Constants from 'expo-constants';
import { Platform } from 'react-native';

type Environment = {
  apiUrl: string;
  wsUrl: string;
};

// Get the correct localhost URL based on platform
const getLocalhost = () => {
  if (Platform.OS === 'android') {
    // Android Physical Device: Use your computer's IP address on the same network
    return '192.168.1.103';

    // Android Emulator: Uncomment the line below and comment out the line above
    // return '10.0.2.2';
  }
  // iOS simulator can use localhost directly
  return 'localhost';
};

const ENV: Record<string, Environment> = {
  dev: {
    apiUrl: `http://${getLocalhost()}:3002`,
    wsUrl: `ws://${getLocalhost()}:3002`,
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
