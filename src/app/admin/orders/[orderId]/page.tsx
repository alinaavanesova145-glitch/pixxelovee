import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { AssetRow, OrderRow } from '@/types/order';
import type { Story } from '@/types/story';
import { OrderDetailView } from './OrderDetailView';

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { orderId } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single<OrderRow>();
  if (!order) notFound();

  const { data: assets } = await supabase
    .from('assets')
    .select('id, asset_type, storage_bucket, storage_path, file_name')
    .eq('order_id', orderId)
    .returns<AssetRow[]>();

  const assetsWithUrls = await Promise.all(
    (assets ?? []).map(async (asset) => {
      const { data: signed } = await supabase.storage
        .from(asset.storage_bucket)
        .createSignedUrl(asset.storage_path, 3600);
      return { ...asset, signedUrl: signed?.signedUrl ?? null };
    })
  );

  let existingStory: Story | null = null;
  if (order.story_id) {
    const { data } = await supabase
      .from('stories')
      .select('id, slug, title, scene_data, is_published, view_count')
      .eq('id', order.story_id)
      .single<Story>();
    existingStory = data;
  }

  return (
    <main className="min-h-screen bg-black px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <OrderDetailView order={order} assets={assetsWithUrls} existingStory={existingStory} />
      </div>
    </main>
  );
}
