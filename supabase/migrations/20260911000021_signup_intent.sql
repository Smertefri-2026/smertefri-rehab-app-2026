-- ============================================================================
-- 0021: signup_intent — skill mellom "vil bli kunde" og "vil bli rehabtrener"
-- ved registrering.
--
-- Alle nye brukere starter fortsatt som role='client' (uendret — rollen
-- endres kun av review_trainer_application()). Men uten dette feltet fanget
-- OnboardingGate opp trenersøkere som om de var kunder og sendte dem til
-- kundens kartlegging før de i det hele tatt nådde /trainer-application.
-- signup_intent er bare et routing-hint, ikke en tilgangsrettighet.
-- ============================================================================

alter table profiles
  add column signup_intent text not null default 'client'
    check (signup_intent in ('client', 'trainer'));

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, email, signup_intent)
  values (
    new.id,
    new.email,
    case
      when new.raw_user_meta_data ->> 'signup_intent' = 'trainer' then 'trainer'
      else 'client'
    end
  );
  return new;
end;
$$;
