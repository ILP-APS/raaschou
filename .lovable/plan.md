

## Plan: Tilføj debug-logging til fetch-hourly-employees

### Problem
API-nøgle 2 virker i Swagger (inkl. datahentning), men fejler med 401 i edge function. Da koden behandler begge nøgler identisk, peger det på et problem med selve secret-værdien (skjulte tegn, whitespace, quotes).

### Ændring

**`supabase/functions/fetch-hourly-employees/index.ts`**

1. Log nøgle-metadata (IKKE selve nøglen) for debugging:
   - Længde af hver nøgle
   - Første 4 tegn (maskeret)
   - Om den indeholder whitespace, newlines eller quotes
2. Log den fulde response body ved fejl (ikke kun statuskode)
3. Trim nøglerne med `.trim()` før brug for at fjerne evt. whitespace/newlines

### Eksempel på debug-output
```text
Konto 2 key info: length=36, prefix="abc1...", hasWhitespace=true
e-regnskab /User failed [401]: "Invalid API key"
```

### Deploy
Edge function deployes automatisk. Herefter trykker du "Opdater fra e-regnskab" igen, og vi tjekker logs.

