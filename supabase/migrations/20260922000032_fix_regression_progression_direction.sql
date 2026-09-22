-- ============================================================================
-- 0032: Rett retningen på regression_of/progression_of.
--
-- Verifisert mot capacity_level (uavhengig sannhetskilde) på alle 80
-- lenke-retninger i biblioteket før denne migrasjonen skrives: 100 % av
-- dagens data følger det AVVIKENDE mønsteret arvet fra det aller første
-- 0017-paret (knebøy til stol ↔ split squat) — progression_of peker på den
-- LETTERE naboen, regression_of peker på den TYNGRE naboen. 0031 videreførte
-- dette mønsteret konsekvent for alle ti kjeder for å matche eksisterende
-- data, men selve mønsteret er bakvendt av det navnene tilsier og det
-- ExerciseSwap-knappene i programbyggeren viser til admin/trener.
--
-- Retter dette ved å bytte de to kolonnene for enhver rad som har minst én
-- av dem satt — ren SQL-swap, evaluert mot rad-tilstanden FØR update (ingen
-- rekkefølgeproblem). Etter dette:
--   regression_of = lettere variant
--   progression_of = tyngre/mer krevende variant
-- som matcher UI-etikettene i ExerciseSwap uendret — ingen kodeendring der.
-- ============================================================================

update exercises
set regression_of = progression_of,
    progression_of = regression_of
where regression_of is not null or progression_of is not null;
