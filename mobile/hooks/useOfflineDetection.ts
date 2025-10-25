import { useEffect } from 'react';
import { useRouter, usePathname } from 'expo-router';
import { useNetworkStatus } from './useNetworkStatus';

export function useOfflineDetection() {
  const { isOnline } = useNetworkStatus();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only navigate to offline page if not already there
    if (!isOnline && pathname !== '/offline') {
      router.push('/offline');
    } else if (isOnline && pathname === '/offline') {
      // Auto-redirect back to home when online
      router.replace('/');
    }
  }, [isOnline, pathname]);

  return { isOnline };
}
