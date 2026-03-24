

# Tidsregistrering: Database + Edge Functions

## Overblik
Byg SMS-påmindelsessystem der tjekker om timelønnede har registreret timer i e-regnskab, og sender SMS via CloudTalk hvis de mangler.

## Del 1: Database (1 migration)

Opretter 4 tabeller + 2 extensions i én migration:

1. **`employee_work_schedules`** — Custom arbejdstider pr. medarbejder (default: 7.5 man-tor, 7.0 fre)
2. **`daily_time_registrations`** — Cache af daglige registreringer fra e-regnskab
3. **`sms_reminder_cases`** — Én case pr. medarbejder pr. dag med manglende registrering
4. **`sms_reminder_logs`** — Log over hver sendt SMS

Extensions: `pg_cron` + `pg_net` (til scheduled jobs)

RLS: Service role fuld adgang, authenticated read-only (til fremtidig admin UI).

## Del 2: Edge Functions (3 stk)

### 2.1 `check-today`
- Cron: man-tor kl 15:10 (`10 13 * * 1-4` UTC)
- Tjekker helligdag via fastlønnets Schedule (hnUserID 14302)
- Henter aktive timelønnede fra `/WorkTime/WorkHours`
- For hver: tjek 5 registreringstyper, sync til `daily_time_registrations`
- Hvis ingen registrering: opret case, hent mobilnr, send SMS via CloudTalk

### 2.2 `remind-yesterday`
- Cron: tir-fre kl 07:00 + 11:50 (`0 5 * * 2-5` og `50 9 * * 2-5` UTC)
- Henter åbne cases fra igår
- Tjekker om registreret → resolve case, ellers send ny SMS (morning/midday)

### 2.3 `friday-summary`
- Cron: fre kl 14:40 (`40 12 * * 5` UTC)
- Tjekker fredags registrering + samler alle ugens åbne cases
- Sender samlet SMS med overblik over manglende dage

### Fælles hjælpefunktioner i hver edge function:
- e-regnskab API-kald (auth via `EREGNSKAB_API_KEY`)
- CloudTalk SMS-afsendelse (Basic Auth med `CLOUDTALK_API_ID:CLOUDTALK_API_KEY`)
- Helligdags-detektion, telefonnummer-formattering (+45), fornavn-udtræk

## Del 3: Cron Jobs (via insert tool)

4 cron jobs oprettes via `cron.schedule()` + `net.http_post()` der kalder edge functions.

## Implementeringsrækkefølge

1. Migration: tabeller + extensions
2. Edge function: `check-today` (størst, indeholder al kernlogik)
3. Edge function: `remind-yesterday`
4. Edge function: `friday-summary`
5. Cron jobs (insert tool, ikke migration)
6. Test hver function med `supabase--test_edge_functions`

