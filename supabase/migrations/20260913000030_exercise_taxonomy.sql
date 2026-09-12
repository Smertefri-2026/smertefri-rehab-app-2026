-- ============================================================================
-- 0030: Utvid exercises med bevegelsesmønster, kapasitetsnivå, utstyr og
-- arkivering — de tre manglende aksene fra øvelsesarkitektur-kartleggingen.
--
-- Bevisst holdt enkelt, gjenbruker eksisterende mønstre:
--   - body_areas/purposes/relevant_stages er fra før frie text[]/enum[] uten
--     DB-håndhevelse; movement_pattern og capacity_level følger samme idé,
--     bare med en egen enum siden de har et fast, lite verdisett.
--   - regresjon/progresjon er FORTSATT bare de to eksisterende
--     selvrefererende kolonnene (regression_of/progression_of) — en kjede på
--     N ledd bygges ved å lenke dem sammen som en vanlig lenket liste, ikke
--     en ny tabell.
--   - "type: styrke/kontroll/kondisjon/balanse/mobilitet" er den samme
--     dimensjonen som `purposes` allerede dekker (som har styrke, kontroll,
--     kondisjon, mobilitet, pluss avspenning/robusthet) — vi utvider bare
--     kodens tillatte verdiliste med "balanse" i stedet for å lage en
--     konkurrerende kolonne.
--   - media_url → video_url: samme kolonne, bedre navn som matcher at det nå
--     er et bevisst felt for video/embed-lenke (kartlegging pkt. 8).
--   - is_active: arkivering, ikke sletting — historiske program_day_exercises
--     refererer fortsatt til raden og fortsetter å fungere uendret.
-- ============================================================================

create type movement_pattern as enum (
  'squat', 'hinge', 'lunge', 'press', 'pull', 'carry', 'gait', 'balance', 'rotation', 'conditioning'
);

create type capacity_level as enum (
  'svaert_lav', 'nybegynner', 'moderat', 'godt_trent', 'idrettsaktiv'
);

alter table exercises
  add column movement_pattern movement_pattern,
  add column capacity_level capacity_level,
  add column equipment text[] not null default '{}',
  add column is_active boolean not null default true;

alter table exercises rename column media_url to video_url;

comment on column exercises.capacity_level is
  'Generelt fysisk kapasitetsnivå øvelsen passer for — uavhengig av relevant_stages (Trapp). '
  'En godt trent klient kan stå i Trapp-trinnet "ro" etter en oppblussing og trenger da fortsatt '
  'lav-kapasitet-øvelser; en utrent klient i "styrke" trenger fortsatt lavere kapasitetsnivå enn '
  'en idrettsaktiv i samme trinn.';
