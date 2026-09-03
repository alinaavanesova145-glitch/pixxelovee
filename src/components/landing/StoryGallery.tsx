import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface GalleryStory {
  slug: string;
  title: string;
  view_count: number;
}

export async function StoryGallery() {
  const supabase = await createSupabaseServerClient();
  const { data: stories } = await supabase
    .from('stories')
    .select('slug, title, view_count')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(6)
    .returns<GalleryStory[]>();

  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <h2 className="mb-2 font-pixel text-sm text-white">past stories</h2>
      <p className="mb-8 text-sm text-white/50">A few worlds we&apos;ve already built.</p>

      {!stories || stories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 p-10 text-center">
          <p className="text-sm text-white/40">No stories published yet — yours could be the first.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {stories.map((story) => (
            <Link
              key={story.slug}
              href={`/story/${story.slug}`}
              className="rounded-xl border border-white/10 p-5 transition-colors hover:border-[#FFB6C1]/40"
            >
              <p className="font-pixel text-[10px] text-white">{story.title}</p>
              <p className="mt-2 text-xs text-white/40">{story.view_count} views</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
