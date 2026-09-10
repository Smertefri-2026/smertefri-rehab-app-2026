# Dev- og testdata

## Prinsipp

Testdata og produksjonsdata blandes aldri:

| | Dev / staging | Produksjon |
|---|---|---|
| Supabase | `smertefri-dev-sep-26` (`lclsquqcongfnngtsgik`) | eget prosjekt (opprettes ved cutover) |
| Demo-brukere | ja (se under) | nei — opprettes aldri |
| Innhold (øvelser/programmer) | ja | ja — samme, via migrasjon `20260910000017` |

- **Demo-brukere ligger IKKE i noen migrasjon.** Migrasjoner kjøres likt i alle
  miljøer; brukere opprettes med et eget script (`scripts/seed-dev-users.py`)
  som nekter å kjøre mot noe annet enn dev-prosjektet.
- **Demo-e-post er `@demo.smertefri.no`.** Domenet har ingen MX-record, så
  Supabase avviser self-signup med det — de kan bare opprettes via admin-API
  med service-nøkkel.
- **Ingen passord, service-nøkler eller tokens i repoet.** `scripts/`-scriptene
  leser alt fra miljøet. `.env*` er git-ignorert.
- Øvelses-/programbiblioteket (`20260910000017_seed_exercise_library.sql`) er
  reelt produktinnhold og skal til produksjon — det er ikke testdata.

## Demo-brukere (kun dev)

| Rolle | E-post |
|---|---|
| Kunde | `kunde@demo.smertefri.no` |
| Rehabtrener | `trener@demo.smertefri.no` |
| Admin | `admin@demo.smertefri.no` |

Passordene deles utenfor repoet. Re-seed:

```
SF_SERVICE_KEY=…  SEED_PW_KUNDE=…  SEED_PW_TRENER=…  SEED_PW_ADMIN=… \
  python3 scripts/seed-dev-users.py
```

## Ved production-cutover

Nytt Supabase-prosjekt → kjør migrasjonene (inkl. innholds-seed) → **ikke** kjør
`seed-dev-users.py`. Produksjon starter uten demo-brukere.
