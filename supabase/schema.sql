-- ════════════════════════════════════════════════════════════
-- pixxelovee — Supabase schema
-- Run once in the Supabase SQL editor (Project → SQL Editor → New query → Run)
-- ════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ─── profiles ───────────────────────────────────────────────
-- One row per auth.users entry. is_admin gates the /admin dashboard.
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  is_admin   boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own"
  on public.profiles for select
  using (auth.uid() = id);

-- security-definer helper so RLS policies below can check admin status
-- without recursively hitting profiles' own RLS.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ─── orders ─────────────────────────────────────────────────
-- One row per submission from the gamified order builder.
create table public.orders (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  customer_name  text not null,
  customer_email text not null,

  status text not null default 'pending'
    check (status in ('pending', 'in_review', 'in_progress', 'ready_for_review', 'delivered', 'cancelled')),

  -- Step 1: vibe & atmosphere
  vibe text not null
    check (vibe in ('cozy_room', 'sunset_roof', 'cyberpunk_alley', 'rainy_coffee_shop')),

  -- Step 2: character customization (photo refs live in `assets`, linked back via order_id)
  character_details jsonb not null default '{}'::jsonb,

  -- Step 3: music & interactive elements
  music_choice text,
  easter_eggs  jsonb not null default '[]'::jsonb,
  text_prompts jsonb not null default '[]'::jsonb,

  -- Step 4: instant estimate
  price_estimate    numeric(10, 2),
  timeline_estimate text,

  story_id    uuid,             -- linked once the admin builds the scene (FK added below)
  admin_notes text
);

-- ─── stories ────────────────────────────────────────────────
-- The published (or in-progress) interactive scene shown at /story/[slug].
create table public.stories (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  order_id uuid references public.orders(id) on delete set null,

  slug  text not null unique,   -- used as the [id] segment in /story/[id]
  title text not null default 'Untitled story',

  -- background, hotspots, ambient fx, music — see src/types/story.ts for the shape
  scene_data jsonb not null default '{}'::jsonb,

  is_published boolean not null default false,
  view_count   integer not null default 0
);

alter table public.orders
  add constraint orders_story_id_fkey
  foreign key (story_id) references public.stories(id) on delete set null;

-- ─── assets ─────────────────────────────────────────────────
-- Metadata for files in Supabase Storage: client-uploaded photo/audio
-- references, and the sprite/background art the admin drops in while
-- building a scene.
create table public.assets (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  order_id uuid references public.orders(id) on delete cascade,
  story_id uuid references public.stories(id) on delete cascade,

  asset_type text not null
    check (asset_type in ('photo_reference', 'audio_upload', 'sprite', 'background', 'sfx')),

  storage_bucket text not null,
  storage_path   text not null,
  file_name      text not null,
  content_type   text,
  size_bytes     integer,

  check (order_id is not null or story_id is not null)
);

-- ─── updated_at triggers ────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create trigger stories_set_updated_at
  before update on public.stories
  for each row execute function public.set_updated_at();

-- ─── view counter RPC (called anonymously from the public story page) ──
create or replace function public.increment_story_view(story_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.stories set view_count = view_count + 1 where id = story_id;
$$;

grant execute on function public.increment_story_view(uuid) to anon, authenticated;

-- ─── row level security ─────────────────────────────────────
alter table public.orders  enable row level security;
alter table public.stories enable row level security;
alter table public.assets  enable row level security;

-- orders: anyone can submit an order (public builder form); only admins read/update
create policy "orders: public insert"
  on public.orders for insert
  with check (true);

create policy "orders: admin read"
  on public.orders for select
  using (public.is_admin());

create policy "orders: admin update"
  on public.orders for update
  using (public.is_admin());

-- stories: published scenes are publicly readable (the /story/[id] page);
-- drafts and writes are admin-only
create policy "stories: public read published"
  on public.stories for select
  using (is_published = true);

create policy "stories: admin read all"
  on public.stories for select
  using (public.is_admin());

create policy "stories: admin insert"
  on public.stories for insert
  with check (public.is_admin());

create policy "stories: admin update"
  on public.stories for update
  using (public.is_admin());

create policy "stories: admin delete"
  on public.stories for delete
  using (public.is_admin());

-- assets: uploads happen from the public builder (photo/audio refs) and the
-- admin dashboard (scene art); reads are admin-only — published story art is
-- served straight from the public "story-assets" bucket, not through this table
create policy "assets: public insert"
  on public.assets for insert
  with check (true);

create policy "assets: admin read"
  on public.assets for select
  using (public.is_admin());

-- ─── storage buckets ─────────────────────────────────────────
insert into storage.buckets (id, name, public)
values
  ('photo-references', 'photo-references', false),  -- client reference photos, admin-only
  ('story-assets',      'story-assets',      true),  -- backgrounds/sprites/sfx served to viewers
  ('audio-uploads',     'audio-uploads',     false)  -- client-provided music, admin-only
on conflict (id) do nothing;

create policy "photo-references: public upload"
  on storage.objects for insert
  with check (bucket_id = 'photo-references');

create policy "photo-references: admin read"
  on storage.objects for select
  using (bucket_id = 'photo-references' and public.is_admin());

create policy "audio-uploads: public upload"
  on storage.objects for insert
  with check (bucket_id = 'audio-uploads');

create policy "audio-uploads: admin read"
  on storage.objects for select
  using (bucket_id = 'audio-uploads' and public.is_admin());

create policy "story-assets: public read"
  on storage.objects for select
  using (bucket_id = 'story-assets');

create policy "story-assets: admin write"
  on storage.objects for insert
  with check (bucket_id = 'story-assets' and public.is_admin());

create policy "story-assets: admin update"
  on storage.objects for update
  using (bucket_id = 'story-assets' and public.is_admin());

-- ─── storage hardening ───────────────────────────────────────
-- photo-references and audio-uploads accept anonymous inserts (the public
-- order builder), so cap size and mime type at the bucket level rather than
-- trusting the client.
update storage.buckets
set file_size_limit = 8388608,  -- 8MB
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
where id = 'photo-references';

update storage.buckets
set file_size_limit = 15728640, -- 15MB
    allowed_mime_types = array['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-m4a']
where id = 'audio-uploads';
