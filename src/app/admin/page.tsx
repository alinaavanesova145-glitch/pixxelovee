import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const STATUSES = [
  'all',
  'pending',
  'in_review',
  'in_progress',
  'ready_for_review',
  'delivered',
  'cancelled',
] as const;

interface OrderListRow {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  vibe: string;
  status: string;
  price_estimate: number | null;
  story_id: string | null;
}

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const { status } = await searchParams;
  const activeStatus = status && (STATUSES as readonly string[]).includes(status) ? status : 'all';

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from('orders')
    .select('id, created_at, customer_name, customer_email, vibe, status, price_estimate, story_id')
    .order('created_at', { ascending: false });

  if (activeStatus !== 'all') query = query.eq('status', activeStatus);

  const { data: orders, error } = await query.returns<OrderListRow[]>();

  return (
    <main className="min-h-screen bg-black px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 font-heading text-lg font-semibold text-white">orders</h1>

        <div className="mb-6 flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={s === 'all' ? '/admin' : `/admin?status=${s}`}
              className={`rounded-full border px-3 py-1 font-pixel text-[9px] uppercase tracking-wide transition-colors ${
                activeStatus === s
                  ? 'border-[#FFB6C1] bg-[#FFB6C1]/10 text-[#FFB6C1]'
                  : 'border-white/15 text-white/50 hover:border-white/30'
              }`}
            >
              {s.replace(/_/g, ' ')}
            </Link>
          ))}
        </div>

        {error && <p className="text-sm text-red-400">Failed to load orders: {error.message}</p>}

        {!error && (!orders || orders.length === 0) && (
          <p className="text-sm text-white/40">
            No orders {activeStatus !== 'all' ? `with status "${activeStatus.replace(/_/g, ' ')}"` : 'yet'}.
          </p>
        )}

        {!error && orders && orders.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/40">
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Vibe</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Estimate</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Story</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="text-white hover:text-[#FFB6C1]">
                        {order.customer_name}
                      </Link>
                      <p className="text-xs text-white/40">{order.customer_email}</p>
                    </td>
                    <td className="px-4 py-3 text-white/70">{order.vibe.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/70">
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {order.price_estimate != null ? `$${order.price_estimate}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-white/40">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-white/40">{order.story_id ? 'linked' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
