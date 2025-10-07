'use client';

import { ReactNode, useCallback, useRef } from 'react';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithAuth } from 'convex/react';
import { AuthKitProvider, useAuth, useAccessToken } from '@workos-inc/authkit-nextjs/components';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <AuthKitProvider>
      <ConvexProviderWithAuth client={convex} useAuth={useAuthFromAuthKit}>
        {children}
      </ConvexProviderWithAuth>
    </AuthKitProvider>
  );
}

function useAuthFromAuthKit() {
  const { user, loading: isLoading } = useAuth();
  const { accessToken, loading: tokenLoading, error: tokenError } = useAccessToken();
  const loading = (isLoading ?? false) || (tokenLoading ?? false);
  const authenticated = !!user && !!accessToken && !loading;

  const stableAccessToken = useRef<string | null>(null);
  
  // Clear token ref when user signs out
  if (!user || !accessToken || tokenError) {
    if (stableAccessToken.current) {
      console.log('[Convex Auth] Clearing stale access token');
      stableAccessToken.current = null;
    }
  } else if (accessToken && !tokenError) {
    stableAccessToken.current = accessToken;
    
    // Decode JWT to inspect (for debugging only - don't verify signature here)
    try {
      const parts = accessToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('[Convex Auth] Access token obtained', {
          iss: payload.iss,
          sub: payload.sub,
          aud: payload.aud,
          exp: new Date(payload.exp * 1000).toISOString(),
        });
      }
    } catch (e) {
      console.log('[Convex Auth] Access token obtained (could not decode)');
    }
  }

  const fetchAccessToken = useCallback(async () => {
    // Don't return token if user is not authenticated
    if (!user || tokenError) {
      console.log('[Convex Auth] No access token available - user signed out', { tokenError });
      return null;
    }
    
    if (stableAccessToken.current && !tokenError) {
      console.log('[Convex Auth] Returning stable access token');
      return stableAccessToken.current;
    }
    console.log('[Convex Auth] No access token available', { tokenError });
    return null;
  }, [user, tokenError]);

  // Log auth state changes
  console.log('[Convex Auth] State:', { 
    hasUser: !!user, 
    hasToken: !!accessToken, 
    isLoading: loading,
    isAuthenticated: authenticated,
    tokenError: tokenError?.message 
  });

  return {
    isLoading: loading,
    isAuthenticated: authenticated,
    fetchAccessToken,
  };
}