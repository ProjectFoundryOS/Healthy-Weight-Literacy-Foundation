begin;

create table public.newsletter_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique
    check (email = lower(btrim(email)) and length(email) between 3 and 254),
  consent boolean not null check (consent = true),
  consent_version text not null,
  consent_text text not null,
  created_at timestamptz not null default now(),
  status text not null default 'pending'
    check (status in ('pending', 'subscribed', 'unsubscribed')),
  unsubscribed_at timestamptz
);

comment on table public.newsletter_signups is
  'Private newsletter requests with consent. No automatic email delivery. Pending does not mean email ownership has been verified.';

alter table public.newsletter_signups enable row level security;
revoke all on public.newsletter_signups from public, anon, authenticated, service_role;
grant select, insert on public.newsletter_signups to service_role;
-- No public policies: only the existing server credential can insert/read.
-- Unsubscribe updates are performed by an authorized administrator in the dashboard.

commit;
