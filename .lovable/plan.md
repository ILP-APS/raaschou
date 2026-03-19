

# Plan: Tilføj datafiltre til sync-eregnskab

## Problem
Alle åbne aftaler synkroniseres uden filtrering. Ifølge Mettes krav skal:
- Aftaler med tilbudssum = 0 kr **ekskluderes**
- Aftaler med tilbudssum > 25.000 kr **inkluderes**
- Under-aftaler (format XXXXX-X) **inkluderes** altid

## Ændringer

### 1. Edge Function: `supabase/functions/sync-eregnskab/index.ts`

Tilføj filtreringslogik **efter** offer_amount er beregnet fra item lines, men **før** upsert:

```text
For hver appointment:
  1. Beregn offer_amount fra item lines (allerede gjort)
  2. Tjek om appointmentNumber matcher XXXXX-X (under-aftale) → altid inkluder
  3. Ellers: ekskluder hvis offer_amount = 0
  4. Ellers: ekskluder hvis offer_amount < 25.000
```

Filteret sker i `projectRows`-opbygningen (linje 124) ved at skifte `.map()` til `.filter().map()` eller filtrere bagefter.

### 2. Oprydning af eksisterende data

Projekter der allerede er synkroniseret med offer_amount = 0 og ikke er under-aftaler bør slettes fra databasen. Dette kræver:
- En SQL migration der tilføjer DELETE-policy på projects-tabellen (eller brug service_role i edge function)
- Edge function sletter projekter der ikke længere matcher filteret efter sync

Alternativt: Lad de gamle rækker blive, men marker dem (enklere tilgang). Eller slet via service_role i edge function (allerede har adgang).

### 3. Ingen frontend-ændringer nødvendige

Formateringen (komma-separeret, ingen decimaler, DKK) er allerede implementeret korrekt.

## Tekniske detaljer

- Fil: `supabase/functions/sync-eregnskab/index.ts`
- Filtrering sker server-side i edge function
- Under-aftaler identificeres med regex: `/^\d+-\d+$/`
- Service role client bruges til at slette udgåede projekter

