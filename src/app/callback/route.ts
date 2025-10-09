import { handleAuth } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

export const GET = handleAuth({
  onSuccess: (data) => {
  },
  onError: (params: {
    error?: unknown;
    request: NextRequest;
}) => {
    console.log(params.error);
    return NextResponse.redirect(new URL('/auth?error=auth_failed', params.request.url));
  },
  returnPathname: '/dashboard',
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});