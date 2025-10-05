import { handleAuth } from '@workos-inc/authkit-nextjs';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest) => {
  try {
    const response = await handleAuth()(request);
    
    // If authentication was successful, redirect to dashboard
    if (response.status === 302 || response.status === 307) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    return response;
  } catch (error) {
    console.error('Auth callback error:', error);
    // Redirect to auth page with error on failure
    return NextResponse.redirect(new URL('/auth?error=auth_failed', request.url));
  }
};