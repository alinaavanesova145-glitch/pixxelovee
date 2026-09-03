import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Story } from '@/types/story';
import { StoryViewer } from './StoryViewer';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StoryPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  // A story that isn't opted into the public gallery must still load for
  // anyone with the actual link — this RPC checks is_published only, not
  // gallery_opt_in (unlike a direct `.from('stories')` select, which the
  // RLS policy now restricts to opted-in rows).
  const { data: story } = await supabase.rpc('get_published_story_by_slug', { slug: id }).single<Story>();

  if (!story) notFound();

  // Fire-and-forget — a missed view isn't worth blocking the page render for.
  void supabase.rpc('increment_story_view', { story_id: story.id });

  return (
    <main className="fixed inset-0 overflow-hidden bg-black">
      <StoryViewer scene={story.scene_data} />
    </main>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: story } = await supabase.rpc('get_published_story_by_slug', { slug: id }).single<Story>();

  return {
    title: story?.title ? `${story.title} — pixxelovee` : 'A pixel story — pixxelovee',
  };
}
