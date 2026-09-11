-- ============================================================================
-- 0024: Betalingsarkitektur — forberedelse for Stripe, ingen priser låst.
--
-- Prisretningen (Start/Fremgang/Vedlikehold, ~4000/990/490 kr) er ikke
-- besluttet ennå (se prismodellanalysen). Dette skjemaet er derfor bevisst
-- pris-agnostisk: `plan_key` er fri tekst, ikke en låst enum, og selve
-- kronebeløpet finnes ALDRI her — det eies av Stripe (Products/Prices).
-- Vi lagrer kun referansen (stripe_price_id) og status, akkurat som
-- `orders` allerede gjør for engangskjøp (0009_payments.sql).
--
-- `subscriptions` dekker det `orders` ikke kan: løpende abonnement-tilstand
-- (aktiv/kansellert/forfalt, fornyelsesdato, "avslutt ved periodeslutt").
-- Ekstra 25/50-minutters konsultasjoner er fortsatt engangskjøp og bruker
-- den eksisterende `orders`-tabellen (product_type 'trainer_session',
-- related_booking_id) — ingen endring trengs der.
-- ============================================================================

alter table profiles
  add column stripe_customer_id text unique;

create type subscription_status as enum (
  'active', 'trialing', 'past_due', 'canceled',
  'incomplete', 'incomplete_expired', 'unpaid', 'paused'
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text not null,
  stripe_price_id text not null,
  plan_key text not null,  -- f.eks. "start" | "fremgang" | "vedlikehold" — arbeidsnavn, ikke låst
  status subscription_status not null,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger subscriptions_set_updated_at
  before update on subscriptions
  for each row execute function set_updated_at();

create unique index subscriptions_stripe_subscription_idx on subscriptions(stripe_subscription_id);
create index subscriptions_client_idx on subscriptions(client_id, created_at desc);

alter table subscriptions enable row level security;

create policy subscriptions_select_own on subscriptions for select using (client_id = auth.uid());
create policy subscriptions_select_assigned_trainer on subscriptions for select
  using (is_assigned_trainer_of(client_id));
create policy subscriptions_select_admin on subscriptions for select using (is_admin());

-- Ingen klient- eller trener-skriving. Samme mønster som record_order_from_webhook
-- i 0009_payments.sql: kun webhook-ruten (verifiserer Stripes signatur, skriver
-- med SUPABASE_SERVICE_ROLE_KEY) kan sette abonnement-tilstand.
create or replace function upsert_subscription_from_webhook(
  p_client_id uuid,
  p_stripe_customer_id text,
  p_stripe_subscription_id text,
  p_stripe_price_id text,
  p_plan_key text,
  p_status subscription_status,
  p_current_period_end timestamptz,
  p_cancel_at_period_end boolean
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into subscriptions (
    client_id, stripe_customer_id, stripe_subscription_id, stripe_price_id,
    plan_key, status, current_period_end, cancel_at_period_end
  )
  values (
    p_client_id, p_stripe_customer_id, p_stripe_subscription_id, p_stripe_price_id,
    p_plan_key, p_status, p_current_period_end, p_cancel_at_period_end
  )
  on conflict (stripe_subscription_id) do update
    set stripe_price_id = excluded.stripe_price_id,
        plan_key = excluded.plan_key,
        status = excluded.status,
        current_period_end = excluded.current_period_end,
        cancel_at_period_end = excluded.cancel_at_period_end
  returning id into v_id;

  return v_id;
end;
$$;

revoke execute on function upsert_subscription_from_webhook(
  uuid, text, text, text, text, subscription_status, timestamptz, boolean
) from public, anon, authenticated;
