-- ============================================================
-- Argumint — Supabase schema
-- Run this once in the Supabase SQL Editor (or `supabase db push`).
-- ============================================================

-- ---------- Tables ----------

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  username    text not null unique,
  total_score integer not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.debate_topics (
  id          bigint generated always as identity primary key,
  title       text not null,
  description text not null,
  start_time  timestamptz not null default now(),
  end_time    timestamptz not null,
  status      text not null default 'scheduled' check (status in ('scheduled', 'active', 'closed')),
  created_at  timestamptz not null default now()
);

-- Pool of candidate topics the daily cron rotates through.
create table if not exists public.topic_pool (
  id          bigint generated always as identity primary key,
  title       text not null,
  description text not null,
  used_at     timestamptz
);

create table if not exists public.participations (
  id        bigint generated always as identity primary key,
  user_id   uuid not null references public.profiles (id) on delete cascade,
  topic_id  bigint not null references public.debate_topics (id) on delete cascade,
  side      text not null check (side in ('PRO', 'CON')),
  joined_at timestamptz not null default now(),
  unique (user_id, topic_id)
);

create table if not exists public.posts (
  id             bigint generated always as identity primary key,
  topic_id       bigint not null references public.debate_topics (id) on delete cascade,
  user_id        uuid not null references public.profiles (id) on delete cascade,
  parent_post_id bigint references public.posts (id) on delete set null,
  side           text not null check (side in ('PRO', 'CON')),
  type           text not null check (type in ('argument', 'rebuttal')),
  title          text,
  content        text not null,
  -- Denormalized so list queries and realtime INSERT payloads need no join.
  username       text not null,
  upvotes        integer not null default 0,
  downvotes      integer not null default 0,
  hot_score      double precision not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.votes (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  post_id    bigint not null references public.posts (id) on delete cascade,
  value      smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

create table if not exists public.notifications (
  id              bigint generated always as identity primary key,
  user_id         uuid not null references public.profiles (id) on delete cascade,
  type            text not null check (type in ('reply', 'vote', 'mention')),
  sender_id       uuid not null references public.profiles (id) on delete cascade,
  sender_username text not null,
  post_id         bigint references public.posts (id) on delete cascade,
  is_read         boolean not null default false,
  created_at      timestamptz not null default now()
);

-- Ephemeral "live activity" feed events, consumed via Realtime.
create table if not exists public.activities (
  id         bigint generated always as identity primary key,
  topic_id   bigint not null references public.debate_topics (id) on delete cascade,
  username   text not null,
  action     text not null,
  target     text not null,
  created_at timestamptz not null default now()
);

-- ---------- Indexes ----------

create index if not exists idx_posts_topic_hot     on public.posts (topic_id, hot_score desc);
create index if not exists idx_posts_user          on public.posts (user_id);
create index if not exists idx_votes_post          on public.votes (post_id);
create index if not exists idx_participations_topic on public.participations (topic_id);
create index if not exists idx_notifications_user  on public.notifications (user_id, created_at desc);
create index if not exists idx_activities_topic    on public.activities (topic_id, created_at desc);
create index if not exists idx_debate_topics_status on public.debate_topics (status);

-- ---------- Row Level Security ----------
-- Writes always go through Next.js route handlers using the service-role key
-- (which bypasses RLS). Anon key is only used client-side for Realtime reads,
-- so public tables get read-only policies and private tables get none.

alter table public.profiles       enable row level security;
alter table public.debate_topics  enable row level security;
alter table public.topic_pool     enable row level security;
alter table public.participations enable row level security;
alter table public.posts          enable row level security;
alter table public.votes          enable row level security;
alter table public.notifications  enable row level security;
alter table public.activities     enable row level security;

drop policy if exists "public read profiles"       on public.profiles;
drop policy if exists "public read debate_topics"  on public.debate_topics;
drop policy if exists "public read participations" on public.participations;
drop policy if exists "public read posts"          on public.posts;
drop policy if exists "public read activities"     on public.activities;

create policy "public read profiles"       on public.profiles       for select using (true);
create policy "public read debate_topics"  on public.debate_topics  for select using (true);
create policy "public read participations" on public.participations for select using (true);
create policy "public read posts"          on public.posts          for select using (true);
create policy "public read activities"     on public.activities     for select using (true);
-- topic_pool, votes, notifications: no anon policies (service role only).

-- ---------- Realtime ----------
-- Guarded so reruns don't fail with "already member of publication".

do $$
declare
  t text;
begin
  foreach t in array array['posts', 'participations', 'activities'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end;
$$;

-- ---------- Voting RPC ----------
-- Ports the FastAPI vote endpoint into a single atomic transaction:
-- toggles/changes the vote, maintains denormalized counters, recomputes the
-- Reddit-style hot score, adjusts author reputation (+5 upvote / -2 downvote)
-- and emits notification + live-activity rows.

create or replace function public.cast_vote(
  p_post_id  bigint,
  p_user_id  uuid,
  p_value    integer,
  p_username text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_post          posts%rowtype;
  v_existing      votes%rowtype;
  v_score_delta   integer := 0;
  v_action        text := 'none';
  v_author_name   text;
  v_hours         double precision;
begin
  select * into v_post from posts where id = p_post_id for update;
  if not found then
    raise exception 'POST_NOT_FOUND';
  end if;

  select username into v_author_name from profiles where id = v_post.user_id;

  select * into v_existing from votes
    where user_id = p_user_id and post_id = p_post_id;

  if found then
    -- Roll back the effect of the previous vote first.
    if v_existing.value = 1 then
      v_post.upvotes := v_post.upvotes - 1;
      v_score_delta := v_score_delta - 5;
    else
      v_post.downvotes := v_post.downvotes - 1;
      v_score_delta := v_score_delta + 2;
    end if;

    if v_existing.value = p_value then
      delete from votes where id = v_existing.id;
      v_action := 'removed';
    else
      update votes set value = p_value where id = v_existing.id;
      if p_value = 1 then
        v_post.upvotes := v_post.upvotes + 1;
        v_score_delta := v_score_delta + 5;
      elsif p_value = -1 then
        v_post.downvotes := v_post.downvotes + 1;
        v_score_delta := v_score_delta - 2;
      end if;
      v_action := 'changed';
    end if;
  elsif p_value <> 0 then
    insert into votes (user_id, post_id, value) values (p_user_id, p_post_id, p_value);
    if p_value = 1 then
      v_post.upvotes := v_post.upvotes + 1;
      v_score_delta := v_score_delta + 5;
    else
      v_post.downvotes := v_post.downvotes + 1;
      v_score_delta := v_score_delta - 2;
    end if;
    v_action := 'added';
  end if;

  -- Reddit-style hot ranking: score / (hours + 2)^1.5
  v_hours := greatest(0.1, extract(epoch from (now() - v_post.created_at)) / 3600.0);

  update posts set
    upvotes    = v_post.upvotes,
    downvotes  = v_post.downvotes,
    hot_score  = (v_post.upvotes - v_post.downvotes) / power(v_hours + 2, 1.5),
    updated_at = now()
  where id = p_post_id;

  if v_score_delta <> 0 then
    update profiles set total_score = total_score + v_score_delta
      where id = v_post.user_id;
  end if;

  -- Notify the author on a fresh/changed upvote (not on self-votes).
  if p_value = 1 and v_action in ('added', 'changed') and v_post.user_id <> p_user_id then
    insert into notifications (user_id, type, sender_id, sender_username, post_id)
    values (v_post.user_id, 'vote', p_user_id, p_username, p_post_id);
  end if;

  insert into activities (topic_id, username, action, target)
  values (
    v_post.topic_id,
    p_username,
    case when v_action = 'removed' then 'removed vote from'
         when p_value = 1 then 'upvoted'
         else 'downvoted' end,
    coalesce(v_author_name, 'someone') || '''s post'
  );

  return jsonb_build_object(
    'action', v_action,
    'upvotes', v_post.upvotes,
    'downvotes', v_post.downvotes,
    'score_delta', v_score_delta,
    'author_id', v_post.user_id
  );
end;
$$;

revoke execute on function public.cast_vote(bigint, uuid, integer, text) from anon, authenticated;

-- ---------- Seed: topic pool ----------
-- Unique index + on conflict keeps reruns from duplicating topics.

create unique index if not exists idx_topic_pool_title on public.topic_pool (title);

insert into public.topic_pool (title, description) values
  ('Should Social Media Algorithms be Banned for Minors?',
   'A new global bill proposes forcing social media platforms to turn off recommender algorithms for users under 18 to combat addiction. Is this necessary protection or government overreach?'),
  ('Is Modern Luxury Fashion becoming a Social Experiment?',
   'With brands selling ''trash bag'' handbags for $1,700, experts debate if high fashion is still about aesthetics or if it''s just testing the limits of consumer absurdity.'),
  ('Should Geopolitics be barred from Global Sports?',
   'Following recent World Cup controversies, many are debating if international sports organizations should remain strictly neutral or take a stand on political conflicts.'),
  ('Should AI-Generated Art be Eligible for Major Awards?',
   'AI image models now win photography and illustration contests. Should juried competitions accept AI-assisted work, or does it undermine human creativity?'),
  ('Is the 4-Day Work Week Ready for Global Adoption?',
   'Trials report equal productivity and happier employees, while critics warn of service gaps and hidden overtime. Should governments push a shorter standard week?'),
  ('Should Space Tourism be Taxed as a Luxury?',
   'Suborbital joyrides emit as much CO2 per passenger as a lifetime of driving. Should ultra-wealthy space tourists pay a climate levy, or would that stifle a young industry?')
on conflict (title) do nothing;
