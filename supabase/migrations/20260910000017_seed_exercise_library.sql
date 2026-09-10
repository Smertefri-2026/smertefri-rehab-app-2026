-- ============================================================================
-- 0017: Startbibliotek — øvelser + SmerteFri-standardprogrammer
--
-- Dette er referanseinnhold som følger produktet (ikke personopplysninger).
-- ⚠️ Utvalg, dosering og instruksjoner er et konservativt utgangspunkt og
-- BØR GJENNOMGÅS/UTVIDES AV FYSIOTERAPEUT før lansering. Bevisst holdt til
-- lav-risiko, veletablerte bevegelser.
--
-- Idempotent: bruker faste UUID-er og ON CONFLICT DO NOTHING, så en
-- re-kjøring ikke dupliserer.
-- ============================================================================

insert into exercises (id, name, instruction, default_sets, default_reps, default_duration_sec, body_areas, purposes, relevant_stages)
values
  ('e0000000-0000-0000-0000-000000000001', 'Rolig pust med lang utpust',
   'Sitt eller ligg godt. Pust rolig inn gjennom nesen, og dobbelt så lang utpust gjennom munnen. Slipp skuldre og kjeve.',
   1, null, 300, '{generell}', '{avspenning}', '{ro}'),
  ('e0000000-0000-0000-0000-000000000002', 'Bekkentilt liggende',
   'Ligg på rygg med bøyde knær. Vipp bekkenet forsiktig fram og tilbake slik at korsryggen skifter mellom lett svai og lett flat. Smertefritt område.',
   2, 10, null, '{rygg}', '{mobilitet,kontroll}', '{ro,kontroll}'),
  ('e0000000-0000-0000-0000-000000000003', 'Katt–kamel',
   'Stå på alle fire. Rull ryggen rolig opp mot taket, så ned til lett svai. Følg pusten. Beveg deg bare så langt det kjennes greit.',
   2, 8, null, '{rygg,nakke}', '{mobilitet}', '{ro,kontroll}'),
  ('e0000000-0000-0000-0000-000000000004', 'Gåtur i rolig tempo',
   'Gå i et tempo der du kan snakke uten å bli andpusten. Start med det du vet du tåler, og øk med noen minutter av gangen.',
   1, null, 600, '{generell}', '{kondisjon,avspenning}', '{ro,kontroll,styrke}'),
  ('e0000000-0000-0000-0000-000000000005', 'Skulderbladsklem mot vegg',
   'Stå med ryggen mot vegg. Trekk skulderbladene lett bakover og ned uten å svaie i ryggen. Hold kort, slipp rolig.',
   2, 12, null, '{nakke,skulder}', '{kontroll}', '{ro,kontroll}'),
  ('e0000000-0000-0000-0000-000000000006', 'Glute bridge',
   'Ligg på rygg med bøyde knær. Løft hoften rolig til kroppen er rett fra kne til skulder. Klem setet i toppen, senk kontrollert.',
   3, 10, null, '{rygg,hofte}', '{styrke,kontroll}', '{kontroll,styrke}'),
  ('e0000000-0000-0000-0000-000000000007', 'Bird dog',
   'Stå på alle fire. Strekk motsatt arm og bein rolig ut til de er i linje med kroppen, uten å vri i ryggen. Tilbake med kontroll.',
   3, 8, null, '{rygg,hofte}', '{kontroll}', '{kontroll,styrke}'),
  ('e0000000-0000-0000-0000-000000000008', 'Knebøy til stol',
   'Stå foran en stol. Sett deg rolig ned til du så vidt berører setet, reis deg igjen. Vekt i hele foten, knær i retning tærne.',
   3, 10, null, '{hofte,kne}', '{styrke}', '{kontroll,styrke}'),
  ('e0000000-0000-0000-0000-000000000009', 'Hoftehengsel med stav',
   'Stå med en kost langs ryggen (bakhode, mellom skulderblad, korsrygg). Bøy i hoften og send setet bak mens ryggen holder kontakten med staven.',
   3, 10, null, '{rygg,hofte}', '{kontroll,styrke}', '{kontroll,styrke}'),
  ('e0000000-0000-0000-0000-000000000010', 'Markløft med kettlebell/manual',
   'Fra hoftehengsel: hold vekten nær kroppen, reis deg ved å skyve hoften fram. Rygg i nøytral posisjon hele veien. Start lett.',
   3, 8, null, '{rygg,hofte}', '{styrke}', '{styrke,robusthet}'),
  ('e0000000-0000-0000-0000-000000000011', 'Split squat',
   'Stå i utfallsstilling. Senk bakre kne mot gulvet, opp igjen. Vekt hovedsakelig på fremre bein. Hold overkroppen oppreist.',
   3, 8, null, '{hofte,kne}', '{styrke}', '{styrke,robusthet}'),
  ('e0000000-0000-0000-0000-000000000012', 'Push-up (tilpasset)',
   'Fra planke eller mot benk/vegg. Senk brystet kontrollert, press opp. Kroppen i rett linje. Velg høyde som gjør at du klarer alle repetisjonene.',
   3, 8, null, '{skulder,rygg}', '{styrke}', '{styrke,robusthet}'),
  ('e0000000-0000-0000-0000-000000000013', 'Intervall på sykkel/mølle',
   'Etter oppvarming: 30 sekunder høyere intensitet, 90 sekunder rolig. Gjenta. Stopp hvis smerten øker tydelig.',
   1, null, 900, '{generell}', '{kondisjon}', '{robusthet,frihet}'),
  ('e0000000-0000-0000-0000-000000000014', 'Farmer''s carry',
   'Bær en tung vekt i hver hånd og gå rolig fram og tilbake. Rak holdning, rolige steg. Sett fra deg med kontroll.',
   3, null, 40, '{rygg,skulder,hofte}', '{styrke,robusthet}', '{robusthet,frihet}')
on conflict (id) do nothing;

-- regresjon/progresjon-lenker
update exercises set progression_of = 'e0000000-0000-0000-0000-000000000008' where id = 'e0000000-0000-0000-0000-000000000011';
update exercises set regression_of  = 'e0000000-0000-0000-0000-000000000011' where id = 'e0000000-0000-0000-0000-000000000008';
update exercises set progression_of = 'e0000000-0000-0000-0000-000000000009' where id = 'e0000000-0000-0000-0000-000000000010';
update exercises set regression_of  = 'e0000000-0000-0000-0000-000000000010' where id = 'e0000000-0000-0000-0000-000000000009';

-- ── Programmaler ────────────────────────────────────────────────────────────
insert into programs (id, name, description, is_template, relevant_stage, body_area)
values
  ('40000000-0000-0000-0000-000000000001', 'Ro – rygg', 'Rolig start: pust, mobilitet og trygg bevegelse for korsryggen.', true, 'ro', 'rygg'),
  ('40000000-0000-0000-0000-000000000002', 'Kontroll – rygg og hofte', 'Bygg gode bevegelsesmønstre og grunnleggende kontroll.', true, 'kontroll', 'rygg'),
  ('40000000-0000-0000-0000-000000000003', 'Styrke – helkropp', 'Progressiv styrke i baseøvelser, tilpasset tempo.', true, 'styrke', 'generell')
on conflict (id) do nothing;

insert into program_days (id, program_id, day_index, title) values
  ('41000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 1, 'Dag A – pust og mobilitet'),
  ('41000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', 2, 'Dag B – rolig bevegelse'),
  ('41000000-0000-0000-0000-000000000011', '40000000-0000-0000-0000-000000000002', 1, 'Dag A – kontroll'),
  ('41000000-0000-0000-0000-000000000012', '40000000-0000-0000-0000-000000000002', 2, 'Dag B – kontroll + gange'),
  ('41000000-0000-0000-0000-000000000021', '40000000-0000-0000-0000-000000000003', 1, 'Dag A – underkropp'),
  ('41000000-0000-0000-0000-000000000022', '40000000-0000-0000-0000-000000000003', 2, 'Dag B – overkropp og bæring')
on conflict (id) do nothing;

insert into program_day_exercises (program_day_id, exercise_id, sort_order, sets, reps, duration_sec) values
  -- Ro dag A
  ('41000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 0, 1, null, 300),
  ('41000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000003', 1, 2, 8, null),
  ('41000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 2, 2, 10, null),
  -- Ro dag B
  ('41000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000005', 0, 2, 12, null),
  ('41000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 1, 2, 10, null),
  ('41000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000004', 2, 1, null, 600),
  -- Kontroll dag A
  ('41000000-0000-0000-0000-000000000011', 'e0000000-0000-0000-0000-000000000007', 0, 3, 8, null),
  ('41000000-0000-0000-0000-000000000011', 'e0000000-0000-0000-0000-000000000006', 1, 3, 10, null),
  ('41000000-0000-0000-0000-000000000011', 'e0000000-0000-0000-0000-000000000009', 2, 3, 10, null),
  -- Kontroll dag B
  ('41000000-0000-0000-0000-000000000012', 'e0000000-0000-0000-0000-000000000008', 0, 3, 10, null),
  ('41000000-0000-0000-0000-000000000012', 'e0000000-0000-0000-0000-000000000005', 1, 2, 12, null),
  ('41000000-0000-0000-0000-000000000012', 'e0000000-0000-0000-0000-000000000004', 2, 1, null, 900),
  -- Styrke dag A
  ('41000000-0000-0000-0000-000000000021', 'e0000000-0000-0000-0000-000000000008', 0, 3, 10, null),
  ('41000000-0000-0000-0000-000000000021', 'e0000000-0000-0000-0000-000000000010', 1, 3, 8, null),
  ('41000000-0000-0000-0000-000000000021', 'e0000000-0000-0000-0000-000000000011', 2, 3, 8, null),
  -- Styrke dag B
  ('41000000-0000-0000-0000-000000000022', 'e0000000-0000-0000-0000-000000000012', 0, 3, 8, null),
  ('41000000-0000-0000-0000-000000000022', 'e0000000-0000-0000-0000-000000000014', 1, 3, null, 40),
  ('41000000-0000-0000-0000-000000000022', 'e0000000-0000-0000-0000-000000000006', 2, 3, 10, null)
on conflict do nothing;
