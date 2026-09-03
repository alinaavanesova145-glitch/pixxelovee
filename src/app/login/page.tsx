'use client';

import { useState, type FormEvent } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm?next=/admin` },
    });

    if (error) {
      setStatus('error');
      setErrorMessage(error.message);
      return;
    }
    setStatus('sent');
  }

  if (status === 'sent') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center">
        <p className="font-heading text-xl font-semibold text-[#FFB6C1]">check your inbox ♥</p>
        <p className="max-w-sm text-sm text-white/60">
          We sent a sign-in link to {email}. Open it on this device to reach the admin dashboard.
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 font-heading text-lg font-semibold text-white">admin sign-in</h1>
        <p className="mb-6 text-sm text-white/50">Enter your email for a magic link.</p>

        <form onSubmit={handleSubmit}>
          <label className="mb-4 block text-xs text-white/60">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#FFB6C1]/50 focus:outline-none"
            />
          </label>

          {errorMessage && <p className="mb-4 text-xs text-red-400">{errorMessage}</p>}

          <button
            type="submit"
            disabled={status === 'sending' || !email}
            className="w-full rounded-full bg-neon py-3 font-heading text-sm font-semibold text-white shadow-[0_0_20px_rgba(255,62,165,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_32px_rgba(255,62,165,0.65)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0"
          >
            {status === 'sending' ? 'sending…' : 'send magic link'}
          </button>
        </form>
      </div>
    </main>
  );
}
