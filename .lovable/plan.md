

## Plan: Hent medarbejdere fra to e-regnskab konti

### Hvad ændres

Edge function `fetch-hourly-employees` udvides til at hente medarbejdere fra **begge** e-regnskab konti parallelt og returnere én samlet liste. Ingen ændringer i frontend eller database.

### Trin

**1. Tilføj secret `EREGNSKAB_API_KEY_2`**
- Gem den nye API-nøgle som Supabase secret

**2. Opdater `supabase/functions/fetch-hourly-employees/index.ts`**
- Læs `EREGNSKAB_API_KEY_2` fra env (fejl IKKE hvis den mangler — gør den optional så det ikke bryder noget hvis den ikke er sat)
- Hent `/User` fra begge konti parallelt med `Promise.all`
- For hver konto: filtrer aktive brugere, hent telefonnumre via `/User/Info/{id}`
- Merge begge lister til én, sorter samlet efter navn
- Da der ikke er overlap, er der ingen deduplikerings-logik nødvendig

**3. Deploy edge function**

### Ingen andre ændringer
- Frontend (`EmployeeList`, `useEmployees`) kalder allerede `fetch-hourly-employees` og upsert'er resultatet — dette virker uændret
- Database `sms_automation_employees` kræver ingen ændringer
- `useSyncEmployees` håndterer allerede nye vs eksisterende medarbejdere korrekt

