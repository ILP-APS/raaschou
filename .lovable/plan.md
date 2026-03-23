

# Plan: Tilføj 24-måneders datofilter til sync-eregnskab

## Ændring

Opdater `/Appointment/Standard` API-kaldet i edge funktionen til at inkludere en `from`-parameter sat til 24 måneder tilbage fra i dag.

### Fil: `supabase/functions/sync-eregnskab/index.ts`

- Beregn dato 24 måneder tilbage: `new Date(now.getFullYear() - 2, now.getMonth(), now.getDate()).toISOString().split('T')[0]`
- Ændr API-kald fra:
  `/Appointment/Standard?open=true`
  til:
  `/Appointment/Standard?open=true&from=YYYY-MM-DD`

Ingen andre ændringer nødvendige.

