-- Supabase: Authentication > Providers > Anonymous Sign-ins 활성화 후 실행
create table if not exists public.studio_favorites (
 user_id uuid not null references auth.users(id) on delete cascade,
 item_id text not null, title text not null,
 created_at timestamptz not null default now(),
 primary key(user_id,item_id)
);
alter table public.studio_favorites enable row level security;
drop policy if exists "own favorites" on public.studio_favorites;
create policy "own favorites" on public.studio_favorites for all to authenticated
 using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
