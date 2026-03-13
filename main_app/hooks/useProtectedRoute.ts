import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

export function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = !segments[0];
    
    console.log('[Auth Hook] Status:', { isSignedIn, inAuthGroup, segment: segments[0] });

    if (!isSignedIn && !inAuthGroup) {
      console.log('[Auth Hook] Guest found outside auth. Redirecting to Login...');
      router.replace('/' as any);
    } else if (isSignedIn && inAuthGroup) {
      console.log('[Auth Hook] User signed in. Redirecting to Welcome...');
      router.replace('/welcome' as any);
    }
  }, [isSignedIn, segments, isLoaded]);
}
