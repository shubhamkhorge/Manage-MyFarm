// Central place to compute the server URL per platform
// - iOS simulator and web can hit localhost
// - Android emulator must use 10.0.2.2 to reach the host machine
// You can override by setting SERVER_URL in env at runtime if needed.

import { Platform } from 'react-native';

const getDefaultServerUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  // ios, web, others
  return 'http://localhost:3000';
};

export const SERVER_URL: string = (typeof process !== 'undefined' && process.env && (process.env as any).SERVER_URL)
  ? (process.env as any).SERVER_URL as string
  : getDefaultServerUrl();

