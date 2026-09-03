import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Completes Supabase's PKCE magic-link flow. The email link Supabase sends
 * verifies the token on Supabase's own server, then redirects back here
 * (the `emailRedirectTo` passed from /login) with a `?code=...` param —
 * this exchanges that code for a real session cookie before sending the
 * user on to wherever they were headed (default: /admin).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/admin';

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
