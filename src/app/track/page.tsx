'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

interface OrderStatus {
  id: string;
  created_at: string;
  customer_name: string;
  status: string;
  vibe: string;
  relationship_type: string | null;
  price_estimate: number | null;
  timeline_estimate: string | null;
  story_slug: string | null;
  story_is_published: boolean | null;
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'found' | 'not_found' | 'error'>('idle');
  const [order, setOrder] = useState<OrderStatus | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setOrder(null);

    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .rpc('get_order_by_id_and_email', { order_id: orderId.trim(), customer_email: email.trim() })
      .single<OrderStatus>();

    if (error || !data) {
      setStatus('not_found');
      return;
    }

    setOrder(data);
    setStatus('found');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 font-heading text-lg font-semibold text-white">track your story</h1>
        <p className="mb-6 text-sm text-white/50">
          Enter the order ID from your confirmation and the email you checked out with.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="mb-4 block text-xs text-white/60">
            Order ID
            <input
              type="text"
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. 8f2c1a90-4b3d-4e2a-9c1f-..."
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 font-mono text-xs text-white placeholder:text-white/30 focus:border-[#FFB6C1]/50 focus:outline-none"
            />
          </label>

          <label className="mb-6 block text-xs text-white/60">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#FFB6C1]/50 focus:outline-none"
            />
          </label>

          {status === 'not_found' && (
            <p className="mb-4 text-xs text-red-400">
              No order matches that ID and email. Double-check both and try again.
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full rounded-full bg-neon py-3 font-heading text-sm font-semibold text-white shadow-[0_0_20px_rgba(255,62,165,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_32px_rgba(255,62,165,0.65)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0"
          >
            {status === 'loading' ? 'looking…' : 'check status'}
          </button>
        </form>

        {status === 'found' && order && (
          <div className="mt-8 rounded-xl border border-white/10 p-4">
            <p className="text-sm text-white">Hi {order.customer_name} ♥</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/60">
              <span className="rounded-full border border-white/15 px-2 py-0.5">{order.status.replace(/_/g, ' ')}</span>
              <span className="rounded-full border border-white/15 px-2 py-0.5">{order.vibe.replace(/_/g, ' ')}</span>
              {order.price_estimate != null && (
                <span className="rounded-full border border-white/15 px-2 py-0.5">${order.price_estimate}</span>
              )}
              {order.timeline_estimate && (
                <span className="rounded-full border border-white/15 px-2 py-0.5">{order.timeline_estimate}</span>
              )}
            </div>

            {order.story_is_published && order.story_slug ? (
              <Link
                href={`/story/${order.story_slug}`}
                className="mt-4 inline-block rounded-full bg-neon px-5 py-2 font-heading text-xs font-semibold text-white shadow-[0_0_16px_rgba(255,62,165,0.35)] transition-all duration-200 hover:-translate-y-0.5"
              >
                view your story ♥
              </Link>
            ) : (
              <p className="mt-4 text-xs text-white/40">
                Your story isn&apos;t ready yet — we&apos;ll email you when it is.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
