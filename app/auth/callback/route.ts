import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Supabase may pass token as 'token' or 'access_token' in query params
  const token = searchParams.get('token') || searchParams.get('access_token');
  const type = searchParams.get('type');

  // Handle password recovery - redirect to reset password page
  if (type === 'recovery' && token) {
    const resetUrl = new URL('/auth/reset-password', request.url);
    // Pass token as query params - the reset password page will handle it
    resetUrl.searchParams.set('access_token', token);
    resetUrl.searchParams.set('type', type);
    return NextResponse.redirect(resetUrl.toString());
  }

  // For other auth callbacks (email verification, etc.), redirect to home
  return NextResponse.redirect(new URL('/', request.url));
}

