

# Refactor: Cron-funktioner bruger sync-registrations som single source of truth

## Arkitektur

```text
┌─────────────────┐     HTTP POST      ┌──────────────────────┐
│  check-today    │ ──────────────────> │  sync-registrations  │
│  friday-summary │                     │  (single source)     │
│  remind-yesterday│                    │  → e-regnskab API    │
└────────┬────────┘                     │  → daily_time_regs   │
         │                              └──────────────────────┘
         │ SELECT fra DB
         v
┌─────────────────────────┐
│ daily_time_registrations │
└─────────────────────────┘
```

## Trin 1: Udvid sync-registrations

- Tilføj `x-cron-secret` som alternativ auth (ved siden af eksisterende JWT-auth)
- Tilføj valgfri `hn_user_ids` array i request body — synkroniserer kun de specifikke brugere i stedet for alle timelønnede
- Behold eksisterende JWT + "alle medarbejdere"-flow for UI-kald

## Trin 2: Omskriv check-today

Fjern: `eregnskabFetch`, `checkRegistrations`, `getHourlyEmployees`, al direkte e-regnskab registrerings-logik.

Behold: `isHoliday()` + `eregnskabFetch` kun til holiday-check (kræver `EREGNSKAB_API_KEY`).

Nyt flow:
1. Holiday-check via e-regnskab API (som i dag)
2. Hent aktive medarbejdere fra `sms_automation_employees`
3. Kald `sync-registrations` via intern HTTP med `x-cron-secret` + `{ week_start, hn_user_ids }`
4. Læs `daily_time_registrations` fra DB for dagens dato
5. Sammenlign med `employee_work_schedules` / defaults
6. Opret cases + log SMS

## Trin 3: Omskriv friday-summary

Fjern: `checkRegistrations`, `getHourlyEmployees`, direkte e-regnskab registrerings-logik.

Behold: `isHoliday()` + `eregnskabFetch` kun til holiday-check (kræver `EREGNSKAB_API_KEY`).

Nyt flow:
1. Holiday-check (som i dag)
2. Hent aktive medarbejdere
3. Kald `sync-registrations` for alle aktive medarbejdere
4. Læs DB for hele ugen
5. Re-check åbne cases, resolve dem der er ok
6. Send uge-opsummering for stadig åbne cases

## Trin 4: Omskriv remind-yesterday

Fjern: `eregnskabFetch`, `checkRegistrations` — AL direkte e-regnskab logik.

Fjern: `EREGNSKAB_API_KEY` requirement (behøves ikke — remind-yesterday følger kun op på eksisterende cases fra dagen før, som check-today allerede har valideret for helligdage).

Nyt flow:
1. Hent åbne cases fra i går
2. Kald `sync-registrations` for de berørte medarbejdere (opdaterer DB)
3. Læs opdateret data fra `daily_time_registrations`
4. Resolve cases hvor timer nu er tilstrækkelige
5. Send påmindelses-SMS for stadig åbne cases

## Hvad fjernes fra hver funktion

| Funktion | Fjerner API-logik | Beholder holiday-check | Beholder EREGNSKAB_API_KEY |
|---|---|---|---|
| sync-registrations | Nej (den ER kilden) | N/A | Ja |
| check-today | Ja | Ja | Ja (kun holiday) |
| friday-summary | Ja | Ja | Ja (kun holiday) |
| remind-yesterday | Ja | Nej (unødvendig) | Nej |

## Filer der ændres

1. `supabase/functions/sync-registrations/index.ts` — tilføj cron-secret auth + hn_user_ids filter
2. `supabase/functions/check-today/index.ts` — sync→DB flow, behold holiday
3. `supabase/functions/friday-summary/index.ts` — sync→DB flow, behold holiday
4. `supabase/functions/remind-yesterday/index.ts` — sync→DB flow, ingen holiday/API

