

## Plan: "Opdater fra e-regnskab" sync-knap med telefonnummer-fallback

### Hvad ændres

Erstatter "Tilføj medarbejder"-dialogen med en "Opdater fra e-regnskab"-knap. Alle medarbejdere (ikke kun timelønnede) hentes. Nye medarbejdere importeres med `is_active: false`. Eksisterende medarbejdere beholder deres nuværende `is_active`-status.

### Ændringer

**1. `supabase/functions/fetch-hourly-employees/index.ts`** — Hent ALLE medarbejdere
- Fjern `Timelønnet`-filteret så alle aktive medarbejdere returneres
- Telefonnummer-fallback: `userInfo?.cellphone || userInfo?.phone || ""`

**2. `src/features/tidsregistrering/hooks/useEmployees.ts`** — Tilføj `useSyncEmployees` mutation
- Kalder `fetch-hourly-employees` edge function
- For **nye** medarbejdere: INSERT med `is_active: false`
- For **eksisterende** medarbejdere: kun opdater `employee_name` og `phone_number` (is_active røres IKKE)
- Implementeres med Supabase upsert hvor `is_active` udelades fra upsert-data (DB default er `true`, men vi sætter explicit `false` for nye via en to-trins logik: først hent eksisterende IDs, derefter upsert med korrekt `is_active`)

**3. `src/features/tidsregistrering/components/EmployeeList.tsx`** — Ny UI
- Erstatter `AddEmployeeDialog` med "Opdater fra e-regnskab"-knap med loading-spinner
- Fjerner trash-ikon
- Toggle disabled + advarsel "Mangler telefonnummer" for medarbejdere uden `phone_number`

**4. `src/features/tidsregistrering/components/AddEmployeeDialog.tsx`** — Fjernes

### Upsert-strategi (bevarer is_active)

```text
1. Hent alle eksisterende hn_user_ids fra sms_automation_employees
2. For hver medarbejder fra API:
   - Hvis hn_user_id IKKE findes i DB → insert med is_active: false
   - Hvis hn_user_id FINDES → update kun employee_name + phone_number
```

### Ingen database-ændringer
Eksisterende tabelstruktur er tilstrækkelig.

