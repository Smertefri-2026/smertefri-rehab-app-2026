-- ============================================================================
-- 0031: Progresjonskjeder for de ti viktigste bevegelsesmønstrene.
--
-- Klassifiserer de 14 eksisterende øvelsene inn i mønster/kapasitet der de
-- naturlig passer, og legger til 38 nye — ett representativt sett på fem
-- kapasitetstrinn (svært lav → nybegynner → moderat → godt trent →
-- idrettsaktiv) per mønster: squat, hinge, lunge, press, pull, carry, gait,
-- balance, rotation, conditioning. Kjedene bygges med de eksisterende
-- regression_of/progression_of-kolonnene som en lenket liste — ingen ny
-- tabell.
--
-- ⚠️ Samme forbehold som 0017: konservativt utgangspunkt, BØR GJENNOMGÅS AV
-- FYSIOTERAPEUT før lansering, særlig de mest eksplosive/idrettsspesifikke
-- trinnene.
--
-- Idempotent: faste UUID-er, ON CONFLICT DO NOTHING på innsettinger.
-- ============================================================================

-- ── 1) Reklassifiser de 14 eksisterende øvelsene ───────────────────────────
update exercises set movement_pattern = null,   capacity_level = 'svaert_lav', equipment = '{ingen}' where id = 'e0000000-0000-0000-0000-000000000001'; -- Rolig pust
update exercises set movement_pattern = 'rotation', capacity_level = 'svaert_lav', equipment = '{matte}', relevant_stages = '{ro,kontroll}' where id = 'e0000000-0000-0000-0000-000000000002'; -- Bekkentilt liggende
update exercises set movement_pattern = null,   capacity_level = 'svaert_lav', equipment = '{matte}' where id = 'e0000000-0000-0000-0000-000000000003'; -- Katt-kamel
update exercises set movement_pattern = 'gait',     capacity_level = 'nybegynner', equipment = '{ingen}', relevant_stages = '{ro,kontroll,styrke}' where id = 'e0000000-0000-0000-0000-000000000004'; -- Gåtur i rolig tempo
update exercises set movement_pattern = 'pull',     capacity_level = 'svaert_lav', equipment = '{ingen}', relevant_stages = '{ro,kontroll}' where id = 'e0000000-0000-0000-0000-000000000005'; -- Skulderbladsklem mot vegg
update exercises set movement_pattern = 'hinge',    capacity_level = 'svaert_lav', equipment = '{matte}', relevant_stages = '{ro,kontroll}' where id = 'e0000000-0000-0000-0000-000000000006'; -- Glute bridge
update exercises set movement_pattern = 'rotation', capacity_level = 'nybegynner', equipment = '{matte}', relevant_stages = '{ro,kontroll,styrke}' where id = 'e0000000-0000-0000-0000-000000000007'; -- Bird dog
update exercises set movement_pattern = 'squat',    capacity_level = 'svaert_lav', equipment = '{stol}', relevant_stages = '{ro,kontroll}' where id = 'e0000000-0000-0000-0000-000000000008'; -- Knebøy til stol
update exercises set movement_pattern = 'hinge',    capacity_level = 'nybegynner', equipment = '{stav}', relevant_stages = '{ro,kontroll,styrke}' where id = 'e0000000-0000-0000-0000-000000000009'; -- Hoftehengsel med stav
update exercises set movement_pattern = 'hinge',    capacity_level = 'moderat', equipment = '{kettlebell}', relevant_stages = '{kontroll,styrke,robusthet}' where id = 'e0000000-0000-0000-0000-000000000010'; -- Markløft med kettlebell/manual
update exercises set movement_pattern = 'lunge',    capacity_level = 'moderat', equipment = '{ingen}', relevant_stages = '{kontroll,styrke,robusthet}' where id = 'e0000000-0000-0000-0000-000000000011'; -- Split squat
update exercises set movement_pattern = 'press',    capacity_level = 'nybegynner', equipment = '{ingen}', relevant_stages = '{ro,kontroll,styrke}' where id = 'e0000000-0000-0000-0000-000000000012'; -- Push-up (tilpasset)
update exercises set movement_pattern = 'conditioning', capacity_level = 'godt_trent', equipment = '{ingen}', relevant_stages = '{styrke,robusthet,frihet}' where id = 'e0000000-0000-0000-0000-000000000013'; -- Intervall på sykkel/mølle
update exercises set movement_pattern = 'carry',    capacity_level = 'moderat', equipment = '{kettlebell}', relevant_stages = '{kontroll,styrke,robusthet}' where id = 'e0000000-0000-0000-0000-000000000014'; -- Farmer's carry

-- Fjern gamle kjede-koblinger fra 0017 (8↔11 var et enkelt par på tvers av
-- det som nå er to ulike mønstre — squat og lunge). De reetableres korrekt
-- lenger ned i riktig kjede.
update exercises set regression_of = null, progression_of = null where id in (
  'e0000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-000000000011'
);

-- ── 2) 38 nye øvelser, ett representativt trinn per mønster/kapasitet ──────
insert into exercises
  (id, name, instruction, default_sets, default_reps, default_duration_sec,
   body_areas, purposes, relevant_stages, movement_pattern, capacity_level, equipment)
values
  -- SQUAT (svært lav = e...008 finnes fra før)
  ('e1000000-0000-0000-0000-000000000001', 'Kroppsvektknebøy',
   'Stå med føttene hoftebredde fra hverandre. Bøy i hofte og kne som om du skal sette deg på en usynlig stol, hold overkroppen oppreist. Reis deg kontrollert.',
   3, 10, null, '{hofte,kne}', '{styrke,kontroll}', '{ro,kontroll,styrke}', 'squat', 'nybegynner', '{ingen}'),
  ('e1000000-0000-0000-0000-000000000002', 'Goblet squat',
   'Hold en kettlebell eller manual inntil brystet. Knebøy med albuene innenfor knærne, hold brystet høyt. Press gjennom hælene opp.',
   3, 8, null, '{hofte,kne}', '{styrke}', '{kontroll,styrke,robusthet}', 'squat', 'moderat', '{kettlebell}'),
  ('e1000000-0000-0000-0000-000000000003', 'Knebøy med vektstang',
   'Front- eller bakknebøy med vektstang. Hold nøytral rygg og kontrollert tempo ned, driv opp gjennom hælene. Bygg opp gradvis, krever god teknikk.',
   4, 6, null, '{hofte,kne,rygg}', '{styrke}', '{styrke,robusthet,frihet}', 'squat', 'godt_trent', '{vektstang}'),
  ('e1000000-0000-0000-0000-000000000004', 'Knebøyhopp',
   'Knebøy ned til komfortabel dybde, eksploder opp til et lite hopp, land mykt og kontrollert. Kun for godt trente med solid knebøyteknikk.',
   3, 6, null, '{hofte,kne}', '{styrke,robusthet}', '{robusthet,frihet}', 'squat', 'idrettsaktiv', '{ingen}'),

  -- HINGE (svært lav/nybegynner/moderat = e...006/009/010 finnes fra før)
  ('e1000000-0000-0000-0000-000000000005', 'Markløft med vektstang',
   'Fra hoftehengsel-mønsteret: løft vektstangen tett inntil kroppen ved å strekke hofte og kne samtidig. Nøytral rygg gjennom hele løftet.',
   4, 5, null, '{rygg,hofte}', '{styrke}', '{styrke,robusthet,frihet}', 'hinge', 'godt_trent', '{vektstang}'),
  ('e1000000-0000-0000-0000-000000000006', 'Ettbeint RDL / eksplosiv kettlebell swing',
   'Ettbeint rumensk markløft for balanse og styrke i ett bein, eller eksplosiv kettlebell swing fra hoften. Krever god hoftekontroll fra før.',
   3, 8, null, '{rygg,hofte}', '{styrke,robusthet}', '{robusthet,frihet}', 'hinge', 'idrettsaktiv', '{kettlebell}'),

  -- LUNGE / SPLITTSTÅENDE (moderat = Split squat, e...011, finnes fra før)
  ('e1000000-0000-0000-0000-000000000007', 'Støttet vektoverføring stående',
   'Stå og hold i en stolrygg. Flytt vekten rolig fra ett bein til det andre, som et forsiktig steg uten å faktisk ta steget.',
   2, 10, null, '{hofte,kne}', '{kontroll}', '{ro,kontroll}', 'lunge', 'svaert_lav', '{stol}'),
  ('e1000000-0000-0000-0000-000000000008', 'Statisk utfall med støtte',
   'Stå i utfallsposisjon med en hånd i støtte. Senk bakre kne mot gulvet og opp igjen, kontrollert tempo.',
   3, 8, null, '{hofte,kne}', '{styrke,kontroll}', '{ro,kontroll,styrke}', 'lunge', 'nybegynner', '{stol}'),
  ('e1000000-0000-0000-0000-000000000009', 'Bulgarian split squat',
   'Bakre fot hevet på en benk, fremre bein bærer mesteparten av vekten. Senk kontrollert, press opp. Krevende balanse og styrke.',
   3, 8, null, '{hofte,kne}', '{styrke}', '{styrke,robusthet,frihet}', 'lunge', 'godt_trent', '{boks/steg}'),
  ('e1000000-0000-0000-0000-000000000010', 'Gående utfall med vekt',
   'Gående utfall med manualer i hver hånd, eller økt tempo for en mer eksplosiv variant. Rak overkropp, kontrollert landing.',
   3, 10, null, '{hofte,kne}', '{styrke,robusthet}', '{robusthet,frihet}', 'lunge', 'idrettsaktiv', '{manualer}'),

  -- PRESS (nybegynner = Push-up (tilpasset), e...012, finnes fra før)
  ('e1000000-0000-0000-0000-000000000011', 'Veggpress',
   'Stå vendt mot en vegg, hendene i skulderhøyde. Bøy albuene og senk brystet mot veggen, press tilbake.',
   2, 10, null, '{skulder}', '{styrke,kontroll}', '{ro,kontroll}', 'press', 'svaert_lav', '{ingen}'),
  ('e1000000-0000-0000-0000-000000000012', 'Push-up fra tær',
   'Planke-posisjon med støtte i tær og hender. Senk brystet kontrollert mot gulvet, press opp. Hold kroppen i rett linje.',
   3, 8, null, '{skulder,rygg}', '{styrke}', '{kontroll,styrke,robusthet}', 'press', 'moderat', '{ingen}'),
  ('e1000000-0000-0000-0000-000000000013', 'Skulderpress/benkpress med vekt',
   'Skulderpress stående eller benkpress liggende med manualer/vektstang. Kontrollert tempo, full bevegelsesbane.',
   4, 6, null, '{skulder}', '{styrke}', '{styrke,robusthet,frihet}', 'press', 'godt_trent', '{manualer}'),
  ('e1000000-0000-0000-0000-000000000014', 'Push press / plyometrisk push-up',
   'Eksplosiv pressbevegelse — push press med bein-drive, eller plyometrisk push-up med løft fra gulvet. Krever solid pressgrunnlag fra før.',
   3, 5, null, '{skulder}', '{styrke,robusthet}', '{robusthet,frihet}', 'press', 'idrettsaktiv', '{vektstang}'),

  -- PULL (svært lav = Skulderbladsklem mot vegg, e...005, finnes fra før)
  ('e1000000-0000-0000-0000-000000000015', 'Sittende roing med strikk',
   'Sitt med beina strake, strikk rundt føttene. Trekk albuene bakover mot kroppen, klem skulderbladene sammen.',
   3, 12, null, '{rygg,skulder}', '{styrke,kontroll}', '{ro,kontroll,styrke}', 'pull', 'nybegynner', '{strikk}'),
  ('e1000000-0000-0000-0000-000000000016', 'Ettarms roing med manual',
   'Støtt en hånd og kne på en benk, roing med manual i motsatt hånd. Trekk albuen bakover, kontrollert ned.',
   3, 10, null, '{rygg,skulder}', '{styrke}', '{kontroll,styrke,robusthet}', 'pull', 'moderat', '{manualer}'),
  ('e1000000-0000-0000-0000-000000000017', 'Pull-up med assistanse',
   'Pull-up med strikk-assistanse eller assistert maskin. Full bevegelsesbane, kontrollert både opp og ned.',
   3, 6, null, '{rygg,skulder}', '{styrke}', '{styrke,robusthet,frihet}', 'pull', 'godt_trent', '{strikk}'),
  ('e1000000-0000-0000-0000-000000000018', 'Fri pull-up / vektet trekk',
   'Pull-up uten assistanse, eventuelt med ekstra vekt. Full henge til hake over stang.',
   3, 5, null, '{rygg,skulder}', '{styrke,robusthet}', '{robusthet,frihet}', 'pull', 'idrettsaktiv', '{ingen}'),

  -- CARRY (moderat = Farmer's carry, e...014, finnes fra før)
  ('e1000000-0000-0000-0000-000000000019', 'Kort gange med lett gjenstand',
   'Bær en lett gjenstand, som en vannflaske, i en hånd og gå en kort, rolig runde. Rak holdning.',
   2, null, 30, '{generell}', '{styrke,kontroll}', '{ro,kontroll}', 'carry', 'svaert_lav', '{ingen}'),
  ('e1000000-0000-0000-0000-000000000020', 'Farmer''s carry, lett vekt',
   'Bær en lett vekt i hver hånd og gå rolig. Skuldrene ned og bak, stram kjerne.',
   3, null, 30, '{rygg,skulder}', '{styrke}', '{ro,kontroll,styrke}', 'carry', 'nybegynner', '{manualer}'),
  ('e1000000-0000-0000-0000-000000000021', 'Ettarms/asymmetrisk carry',
   'Bær en tyngre vekt i kun én hånd. Motstå at overkroppen lener til siden — hold kjernen stram og rak holdning.',
   3, null, 30, '{rygg,skulder,hofte}', '{styrke,robusthet}', '{styrke,robusthet,frihet}', 'carry', 'godt_trent', '{kettlebell}'),
  ('e1000000-0000-0000-0000-000000000022', 'Overhead carry kombinert med gange',
   'Hold en vekt strak over hodet med én eller begge armer mens du går. Krever god skulderstabilitet og kjernekontroll.',
   3, null, 20, '{skulder,rygg}', '{styrke,robusthet}', '{robusthet,frihet}', 'carry', 'idrettsaktiv', '{manualer}'),

  -- GANGE / LØP (nybegynner = Gåtur i rolig tempo, e...004, finnes fra før)
  ('e1000000-0000-0000-0000-000000000023', 'Gange med støtte, korte distanser',
   'Gå korte distanser med støtte av rullator, stav eller en person ved siden av. Fokuser på jevn, kontrollert gange.',
   1, null, 300, '{generell}', '{kondisjon,kontroll}', '{ro,kontroll}', 'gait', 'svaert_lav', '{ingen}'),
  ('e1000000-0000-0000-0000-000000000024', 'Gange med tempoveksling',
   'Gå i rolig tempo, med korte drag av raskere tempo innimellom. Kjenn forskjellen i pust og anstrengelse.',
   1, null, 900, '{generell}', '{kondisjon}', '{kontroll,styrke,robusthet}', 'gait', 'moderat', '{ingen}'),
  ('e1000000-0000-0000-0000-000000000025', 'Joggeintervaller',
   'Vekslende jogging og gange, for eksempel 2 minutter jogg / 1 minutt gange. Juster lengde etter form.',
   1, null, 1200, '{generell}', '{kondisjon}', '{styrke,robusthet,frihet}', 'gait', 'godt_trent', '{ingen}'),
  ('e1000000-0000-0000-0000-000000000026', 'Sprintintervaller',
   'Korte, høyintensive sprinter med god pause mellom hver. Ordentlig oppvarming først.',
   6, null, 20, '{generell}', '{kondisjon,robusthet}', '{robusthet,frihet}', 'gait', 'idrettsaktiv', '{ingen}'),

  -- BALANSE (helt ny kjede)
  ('e1000000-0000-0000-0000-000000000027', 'Sittende balanseøvelser',
   'Sitt på kanten av en stol uten ryggstøtte. Flytt vekten forsiktig fra side til side, hold kontroll.',
   2, null, 30, '{generell}', '{balanse,kontroll}', '{ro,kontroll}', 'balance', 'svaert_lav', '{stol}'),
  ('e1000000-0000-0000-0000-000000000028', 'Stå med støtte, vektoverføring',
   'Stå ved en benk eller stolrygg. Flytt vekten fra to bein til ett, hold noen sekunder, bytt side.',
   3, null, 20, '{generell}', '{balanse}', '{ro,kontroll,styrke}', 'balance', 'nybegynner', '{stol}'),
  ('e1000000-0000-0000-0000-000000000029', 'Ettbensstående uten støtte',
   'Stå på ett bein uten å holde i noe. Hold blikket rolig festet foran deg. Bytt side.',
   3, null, 20, '{generell}', '{balanse}', '{kontroll,styrke,robusthet}', 'balance', 'moderat', '{ingen}'),
  ('e1000000-0000-0000-0000-000000000030', 'Ettbensstående på ustabilt underlag',
   'Ettbensstående på en pute eller annet ustabilt underlag. Legg til hodebevegelser eller lukkede øyne for økt utfordring.',
   3, null, 20, '{generell}', '{balanse}', '{styrke,robusthet,frihet}', 'balance', 'godt_trent', '{balansepute}'),
  ('e1000000-0000-0000-0000-000000000031', 'Dynamisk balanse med hopp/landing',
   'Hopp fra ett bein til det andre, eller retningsskifter med rask oppbremsing. Krever god landings- og kontrollteknikk.',
   3, 8, null, '{generell}', '{balanse,robusthet}', '{robusthet,frihet}', 'balance', 'idrettsaktiv', '{ingen}'),

  -- ROTASJON / ANTI-ROTASJON (svært lav/nybegynner = e...002/007 finnes fra før)
  ('e1000000-0000-0000-0000-000000000032', 'Palloff press stående',
   'Stå på tvers av en fastspent strikk i brysthøyde. Press strikken rett fram uten å vri i overkroppen — motstå rotasjonen.',
   3, 10, null, '{rygg}', '{kontroll,styrke}', '{kontroll,styrke,robusthet}', 'rotation', 'moderat', '{strikk}'),
  ('e1000000-0000-0000-0000-000000000033', 'Lett medisinball-rotasjonskast',
   'Stå i splittstilling med en lett medisinball. Rotér fra hoften og kast ballen mot en vegg, ta imot og gjenta.',
   3, 8, null, '{rygg,hofte}', '{styrke}', '{styrke,robusthet,frihet}', 'rotation', 'godt_trent', '{medisinball}'),
  ('e1000000-0000-0000-0000-000000000034', 'Eksplosivt rotasjonskast',
   'Idrettsspesifikk rotasjonsbevegelse med fart og kraft, som et kraftig kast eller slagbevegelse. Krever solid kjernekontroll fra før.',
   3, 6, null, '{rygg,hofte}', '{styrke,robusthet}', '{robusthet,frihet}', 'rotation', 'idrettsaktiv', '{medisinball}'),

  -- KONDISJON (godt trent = Intervall på sykkel/mølle, e...013, finnes fra før)
  ('e1000000-0000-0000-0000-000000000035', 'Kort gangintervall, lav puls',
   'Gå i rolig tempo i korte perioder med pause mellom. Pusten skal holde seg lett gjennom hele økten.',
   1, null, 300, '{generell}', '{kondisjon}', '{ro,kontroll}', 'conditioning', 'svaert_lav', '{ingen}'),
  ('e1000000-0000-0000-0000-000000000036', 'Sammenhengende gange/sykling, moderat',
   'Gå eller sykle sammenhengende i et jevnt, moderat tempo. Du skal kunne snakke i korte setninger.',
   1, null, 900, '{generell}', '{kondisjon}', '{ro,kontroll,styrke}', 'conditioning', 'nybegynner', '{ingen}'),
  ('e1000000-0000-0000-0000-000000000037', 'Intervalltrening, moderat intensitet',
   'Veksle mellom perioder med økt anstrengelse og rolig restitusjon, for eksempel 1 minutt aktiv / 2 minutter rolig.',
   1, null, 1200, '{generell}', '{kondisjon}', '{kontroll,styrke,robusthet}', 'conditioning', 'moderat', '{ingen}'),
  ('e1000000-0000-0000-0000-000000000038', 'Høyintensiv intervalltrening (HIIT)',
   'Korte, svært intensive drag (20–40 sek) med tilsvarende eller lengre pause. Krever god base av kondisjon fra før.',
   1, null, 1200, '{generell}', '{kondisjon,robusthet}', '{robusthet,frihet}', 'conditioning', 'idrettsaktiv', '{ingen}')
on conflict (id) do nothing;

-- ── 3) Kjeder — lenk sammen som en dobbeltlenket liste (regression_of/progression_of) ──
-- Konvensjon (bekreftet fra 0017: 11.progression_of=8, 8.regression_of=11 —
-- der 8 er lettest og 11 er tyngst): den TYNGRE øvelsens progression_of
-- peker på nabo-en som er LETTERE; den LETTERE øvelsens regression_of peker
-- på nabo-en som er TYNGRE. For en kjede T1 (lettest) → … → T5 (tyngst):
--   T(n).regression_of  = T(n+1)   (peker mot tyngre nabo)
--   T(n).progression_of = T(n-1)   (peker mot lettere nabo)

-- Squat: 8 → e1..01 → e1..02 → e1..03 → e1..04
update exercises set regression_of  = 'e1000000-0000-0000-0000-000000000001' where id = 'e0000000-0000-0000-0000-000000000008';
update exercises set progression_of = 'e0000000-0000-0000-0000-000000000008', regression_of = 'e1000000-0000-0000-0000-000000000002' where id = 'e1000000-0000-0000-0000-000000000001';
update exercises set progression_of = 'e1000000-0000-0000-0000-000000000001', regression_of = 'e1000000-0000-0000-0000-000000000003' where id = 'e1000000-0000-0000-0000-000000000002';
update exercises set progression_of = 'e1000000-0000-0000-0000-000000000002', regression_of = 'e1000000-0000-0000-0000-000000000004' where id = 'e1000000-0000-0000-0000-000000000003';
update exercises set progression_of = 'e1000000-0000-0000-0000-000000000003' where id = 'e1000000-0000-0000-0000-000000000004';

-- Hinge: 6 → 9 → 10 → e1..05 → e1..06  (9.regression_of=10 og 10.progression_of=9 satt allerede i 0017)
update exercises set regression_of  = 'e0000000-0000-0000-0000-000000000009' where id = 'e0000000-0000-0000-0000-000000000006';
update exercises set progression_of = 'e0000000-0000-0000-0000-000000000006' where id = 'e0000000-0000-0000-0000-000000000009';
update exercises set regression_of  = 'e1000000-0000-0000-0000-000000000005' where id = 'e0000000-0000-0000-0000-000000000010';
update exercises set progression_of = 'e0000000-0000-0000-0000-000000000010', regression_of = 'e1000000-0000-0000-0000-000000000006' where id = 'e1000000-0000-0000-0000-000000000005';
update exercises set progression_of = 'e1000000-0000-0000-0000-000000000005' where id = 'e1000000-0000-0000-0000-000000000006';

-- Lunge: e1..07 → e1..08 → 11 → e1..09 → e1..10
update exercises set regression_of  = 'e1000000-0000-0000-0000-000000000008' where id = 'e1000000-0000-0000-0000-000000000007';
update exercises set progression_of = 'e1000000-0000-0000-0000-000000000007', regression_of = 'e0000000-0000-0000-0000-000000000011' where id = 'e1000000-0000-0000-0000-000000000008';
update exercises set progression_of = 'e1000000-0000-0000-0000-000000000008', regression_of = 'e1000000-0000-0000-0000-000000000009' where id = 'e0000000-0000-0000-0000-000000000011';
update exercises set progression_of = 'e0000000-0000-0000-0000-000000000011', regression_of = 'e1000000-0000-0000-0000-000000000010' where id = 'e1000000-0000-0000-0000-000000000009';
update exercises set progression_of = 'e1000000-0000-0000-0000-000000000009' where id = 'e1000000-0000-0000-0000-000000000010';

-- Press: e1..11 → 12 → e1..12 → e1..13 → e1..14
update exercises set regression_of  = 'e0000000-0000-0000-0000-000000000012' where id = 'e1000000-0000-0000-0000-000000000011';
update exercises set progression_of = 'e1000000-0000-0000-0000-000000000011', regression_of = 'e1000000-0000-0000-0000-000000000012' where id = 'e0000000-0000-0000-0000-000000000012';
update exercises set progression_of = 'e0000000-0000-0000-0000-000000000012', regression_of = 'e1000000-0000-0000-0000-000000000013' where id = 'e1000000-0000-0000-0000-000000000012';
update exercises set progression_of = 'e1000000-0000-0000-0000-000000000012', regression_of = 'e1000000-0000-0000-0000-000000000014' where id = 'e1000000-0000-0000-0000-000000000013';
update exercises set progression_of = 'e1000000-0000-0000-0000-000000000013' where id = 'e1000000-0000-0000-0000-000000000014';

-- Pull: 5 → e1..15 → e1..16 → e1..17 → e1..18
update exercises set regression_of  = 'e1000000-0000-0000-0000-000000000015' where id = 'e0000000-0000-0000-0000-000000000005';
update exercises set progression_of = 'e0000000-0000-0000-0000-000000000005', regression_of = 'e1000000-0000-0000-0000-000000000016' where id = 'e1000000-0000-0000-0000-000000000015';
update exercises set progression_of = 'e1000000-0000-0000-0000-000000000015', regression_of = 'e1000000-0000-0000-0000-000000000017' where id = 'e1000000-0000-0000-0000-000000000016';
update exercises set progression_of = 'e1000000-0000-0000-0000-000000000016', regression_of = 'e1000000-0000-0000-0000-000000000018' where id = 'e1000000-0000-0000-0000-000000000017';
update exercises set progression_of = 'e1000000-0000-0000-0000-000000000017' where id = 'e1000000-0000-0000-0000-000000000018';

-- Carry: e1..19 → e1..20 → 14 → e1..21 → e1..22
update exercises set regression_of  = 'e1000000-0000-0000-0000-000000000020' where id = 'e1000000-0000-0000-0000-000000000019';
update exercises set progression_of = 'e1000000-0000-0000-0000-000000000019', regression_of = 'e0000000-0000-0000-0000-000000000014' where id = 'e1000000-0000-0000-0000-000000000020';
update exercises set progression_of = 'e1000000-0000-0000-0000-000000000020', regression_of = 'e1000000-0000-0000-0000-000000000021' where id = 'e0000000-0000-0000-0000-000000000014';
update exercises set progression_of = 'e0000000-0000-0000-0000-000000000014', regression_of = 'e1000000-0000-0000-0000-000000000022' where id = 'e1000000-0000-0000-0000-000000000021';
update exercises set progression_of = 'e1000000-0000-0000-0000-000000000021' where id = 'e1000000-0000-0000-0000-000000000022';

-- Gange/løp: e1..23 → 4 → e1..24 → e1..25 → e1..26
update exercises set regression_of  = 'e0000000-0000-0000-0000-000000000004' where id = 'e1000000-0000-0000-0000-000000000023';
update exercises set progression_of = 'e1000000-0000-0000-0000-000000000023', regression_of = 'e1000000-0000-0000-0000-000000000024' where id = 'e0000000-0000-0000-0000-000000000004';
update exercises set progression_of = 'e0000000-0000-0000-0000-000000000004', regression_of = 'e1000000-0000-0000-0000-000000000025' where id = 'e1000000-0000-0000-0000-000000000024';
update exercises set progression_of = 'e1000000-0000-0000-0000-000000000024', regression_of = 'e1000000-0000-0000-0000-000000000026' where id = 'e1000000-0000-0000-0000-000000000025';
update exercises set progression_of = 'e1000000-0000-0000-0000-000000000025' where id = 'e1000000-0000-0000-0000-000000000026';

-- Balanse: e1..27 → e1..28 → e1..29 → e1..30 → e1..31
update exercises set regression_of  = 'e1000000-0000-0000-0000-000000000028' where id = 'e1000000-0000-0000-0000-000000000027';
update exercises set progression_of = 'e1000000-0000-0000-0000-000000000027', regression_of = 'e1000000-0000-0000-0000-000000000029' where id = 'e1000000-0000-0000-0000-000000000028';
update exercises set progression_of = 'e1000000-0000-0000-0000-000000000028', regression_of = 'e1000000-0000-0000-0000-000000000030' where id = 'e1000000-0000-0000-0000-000000000029';
update exercises set progression_of = 'e1000000-0000-0000-0000-000000000029', regression_of = 'e1000000-0000-0000-0000-000000000031' where id = 'e1000000-0000-0000-0000-000000000030';
update exercises set progression_of = 'e1000000-0000-0000-0000-000000000030' where id = 'e1000000-0000-0000-0000-000000000031';

-- Rotasjon/anti-rotasjon: 2 → 7 → e1..32 → e1..33 → e1..34
update exercises set regression_of  = 'e0000000-0000-0000-0000-000000000007' where id = 'e0000000-0000-0000-0000-000000000002';
update exercises set progression_of = 'e0000000-0000-0000-0000-000000000002', regression_of = 'e1000000-0000-0000-0000-000000000032' where id = 'e0000000-0000-0000-0000-000000000007';
update exercises set progression_of = 'e0000000-0000-0000-0000-000000000007', regression_of = 'e1000000-0000-0000-0000-000000000033' where id = 'e1000000-0000-0000-0000-000000000032';
update exercises set progression_of = 'e1000000-0000-0000-0000-000000000032', regression_of = 'e1000000-0000-0000-0000-000000000034' where id = 'e1000000-0000-0000-0000-000000000033';
update exercises set progression_of = 'e1000000-0000-0000-0000-000000000033' where id = 'e1000000-0000-0000-0000-000000000034';

-- Kondisjon: e1..35 → e1..36 → e1..37 → 13 → e1..38
update exercises set regression_of  = 'e1000000-0000-0000-0000-000000000036' where id = 'e1000000-0000-0000-0000-000000000035';
update exercises set progression_of = 'e1000000-0000-0000-0000-000000000035', regression_of = 'e1000000-0000-0000-0000-000000000037' where id = 'e1000000-0000-0000-0000-000000000036';
update exercises set progression_of = 'e1000000-0000-0000-0000-000000000036', regression_of = 'e0000000-0000-0000-0000-000000000013' where id = 'e1000000-0000-0000-0000-000000000037';
update exercises set progression_of = 'e1000000-0000-0000-0000-000000000037', regression_of = 'e1000000-0000-0000-0000-000000000038' where id = 'e0000000-0000-0000-0000-000000000013';
update exercises set progression_of = 'e0000000-0000-0000-0000-000000000013' where id = 'e1000000-0000-0000-0000-000000000038';

-- ── 4) Én helkropps-mal på laveste trinn (Ro), for å dekke svært lav
--       kapasitet på tvers av mønstre — "Styrke – helkropp" (0017) dekker
--       allerede den øvre enden. ──────────────────────────────────────────
insert into programs (id, name, description, is_template, relevant_stage, body_area)
values (
  '40000000-0000-0000-0000-000000000004', 'Ro – helkropp',
  'Rolig, helkroppsrettet start på tvers av bevegelsesmønstre — for svært lav kapasitet.',
  true, 'ro', 'generell'
)
on conflict (id) do nothing;

insert into program_days (id, program_id, day_index, title) values
  ('41000000-0000-0000-0000-000000000031', '40000000-0000-0000-0000-000000000004', 1, 'Dag A – hele kroppen, rolig'),
  ('41000000-0000-0000-0000-000000000032', '40000000-0000-0000-0000-000000000004', 2, 'Dag B – hele kroppen, rolig')
on conflict (id) do nothing;

insert into program_day_exercises (program_day_id, exercise_id, sort_order, sets, reps, duration_sec) values
  -- Dag A: knebøy, press, gange, balanse
  ('41000000-0000-0000-0000-000000000031', 'e0000000-0000-0000-0000-000000000008', 0, 3, 10, null),
  ('41000000-0000-0000-0000-000000000031', 'e1000000-0000-0000-0000-000000000011', 1, 2, 10, null),
  ('41000000-0000-0000-0000-000000000031', 'e1000000-0000-0000-0000-000000000023', 2, 1, null, 300),
  ('41000000-0000-0000-0000-000000000031', 'e1000000-0000-0000-0000-000000000027', 3, 2, null, 30),
  -- Dag B: hinge, trekk, bæring, rotasjon
  ('41000000-0000-0000-0000-000000000032', 'e0000000-0000-0000-0000-000000000006', 0, 3, 10, null),
  ('41000000-0000-0000-0000-000000000032', 'e0000000-0000-0000-0000-000000000005', 1, 3, 12, null),
  ('41000000-0000-0000-0000-000000000032', 'e1000000-0000-0000-0000-000000000019', 2, 2, null, 30),
  ('41000000-0000-0000-0000-000000000032', 'e0000000-0000-0000-0000-000000000002', 3, 2, 10, null)
on conflict do nothing;
