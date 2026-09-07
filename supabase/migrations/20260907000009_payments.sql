-- ============================================================================
-- 0009: Betaling — orders table only. Stripe itself is the source of truth
-- for products/prices (Master Build Plan pkt. 11); this table just records
-- what was purchased and unlocks access. No prices are decided here.
-- ============================================================================

create type order_status as enum ('pending', 'paid', 'failed', 'refunded');
create type order_product_type as enum ('program_access', 'membership', 'trainer_session');

create table orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id),
  product_type order_product_type not null,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  amount_ore integer,             -- store in øre (smallest NOK unit), like Stripe does
  currency text not null default 'nok',
  status order_status not null default 'pending',
  related_booking_id uuid references bookings(id),
  related_program_id uuid references programs(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger orders_set_updated_at
  before update on orders
  for each row execute function set_updated_at();

create index orders_client_idx on orders(client_id, created_at desc);
create unique index orders_stripe_session_idx on orders(stripe_checkout_session_id) where stripe_checkout_session_id is not null;

alter table orders enable row level security;

create policy orders_select_own on orders for select using (client_id = auth.uid());
create policy orders_select_admin on orders for select using (is_admin());

-- No client-facing insert/update policy: orders are only ever created and
-- confirmed by the Stripe webhook handler (src/app/api/payments/webhook/
-- route.ts, built in the betaling phase). That route has no user session
-- at all — Stripe calls it directly — so RLS/auth.uid() can't authorize
-- it the way every other write in this schema is authorized.
--
-- Deliberate, narrow exception to "no service-role key anywhere" (which
-- was fine for the old app because it never had a real server-to-server
-- write need): the webhook route verifies Stripe's signature first, then
-- writes using SUPABASE_SERVICE_ROLE_KEY — used in that one file only,
-- never shipped to the client, never used elsewhere in the app. Belt and
-- suspenders: this RPC is also explicitly locked to the service_role
-- Postgres role below, so even a leaked anon/authenticated JWT could
-- never call it directly and fabricate a "paid" order.
create or replace function record_order_from_webhook(
  p_client_id uuid,
  p_product_type order_product_type,
  p_stripe_checkout_session_id text,
  p_stripe_payment_intent_id text,
  p_amount_ore integer,
  p_status order_status
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into orders (client_id, product_type, stripe_checkout_session_id, stripe_payment_intent_id, amount_ore, status)
  values (p_client_id, p_product_type, p_stripe_checkout_session_id, p_stripe_payment_intent_id, p_amount_ore, p_status)
  on conflict (stripe_checkout_session_id) do update
    set status = excluded.status,
        stripe_payment_intent_id = excluded.stripe_payment_intent_id
  returning id into v_id;

  return v_id;
end;
$$;

revoke execute on function record_order_from_webhook(uuid, order_product_type, text, text, integer, order_status)
  from public, anon, authenticated;
