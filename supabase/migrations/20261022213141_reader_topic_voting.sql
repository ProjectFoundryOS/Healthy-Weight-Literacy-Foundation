-- Apply only to the owner's WeightLiteracy project zrnwfwgrkubcmwyptisj.
-- Existing newsletter storage is deliberately not referenced.
begin;
create table public.wl_topic_votes (
 campaign text not null check(campaign='learning-2026-10'),
 voter_hash text not null check(voter_hash ~ '^[a-f0-9]{64}$'),
 topic_id text not null check(topic_id in ('health-headlines','care-questions','food-labels','research-words')),
 created_at timestamptz not null default now(),
 primary key(campaign,voter_hash)
);
create table public.wl_vote_limits (
 bucket_hash text primary key check(bucket_hash ~ '^[a-f0-9]{64}$'),
 attempts integer not null default 1,
 expires_at timestamptz not null default now()+interval '2 days'
);
alter table public.wl_topic_votes enable row level security;
alter table public.wl_vote_limits enable row level security;
revoke all on public.wl_topic_votes, public.wl_vote_limits from public, anon, authenticated;
grant select,insert on public.wl_topic_votes to service_role;
grant select,insert,update,delete on public.wl_vote_limits to service_role;
create function public.wl_topic_vote_counts(p_campaign text)
returns table(topic_id text,votes bigint) language sql stable security invoker set search_path='' as $$
 select topic_id,count(*) from public.wl_topic_votes where campaign=p_campaign group by topic_id;
$$;
create function public.wl_topic_voted(p_campaign text,p_voter text)
returns boolean language sql stable security invoker set search_path='' as $$
 select exists(select 1 from public.wl_topic_votes where campaign=p_campaign and voter_hash=p_voter);
$$;
create function public.wl_cast_topic_vote(p_campaign text,p_topic text,p_voter text,p_bucket text)
returns text language plpgsql security invoker set search_path='' as $$
declare attempts_now integer; inserted integer;
begin
 if exists(select 1 from public.wl_topic_votes where campaign=p_campaign and voter_hash=p_voter) then return 'duplicate'; end if;
 delete from public.wl_vote_limits where expires_at < now();
 insert into public.wl_vote_limits(bucket_hash) values(p_bucket)
 on conflict(bucket_hash) do update set attempts=public.wl_vote_limits.attempts+1
 returning attempts into attempts_now;
 if attempts_now>20 then return 'limited'; end if;
 insert into public.wl_topic_votes(campaign,voter_hash,topic_id) values(p_campaign,p_voter,p_topic)
 on conflict(campaign,voter_hash) do nothing;
 get diagnostics inserted = row_count;
 return case when inserted=1 then 'saved' else 'duplicate' end;
end;
$$;
revoke all on function public.wl_topic_vote_counts(text), public.wl_topic_voted(text,text), public.wl_cast_topic_vote(text,text,text,text) from public,anon,authenticated;
grant execute on function public.wl_topic_vote_counts(text), public.wl_topic_voted(text,text), public.wl_cast_topic_vote(text,text,text,text) to service_role;
commit;
