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

  const { data: story } = await supabase
    .from('stories')
    .select('id, slug, title, scene_data, is_published, view_count')
    .eq('slug', id)
    .eq('is_published', true)
    .single<Story>();

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

  const { data: story } = await supabase
    .from('stories')
    .select('title')
    .eq('slug', id)
    .eq('is_published', true)
    .single();

  return {
    title: story?.title ? `${story.title} — pixxelovee` : 'A pixel story — pixxelovee',
  };
}
