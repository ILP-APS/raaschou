
# Refactor: Cron-funktioner bruger sync-registrations som single source of truth

## Status: ✅ Implementeret

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

## Ændringer

1. **sync-registrations** — accepterer nu både JWT og `x-cron-secret` auth + valgfri `hn_user_ids` filter
2. **check-today** — kalder sync-registrations → læser DB → opretter cases. Beholder holiday-check.
3. **friday-summary** — kalder sync-registrations → læser DB for hele ugen → resolver/sender SMS. Beholder holiday-check.
4. **remind-yesterday** — kalder sync-registrations → læser DB → resolver/sender SMS. Ingen API-logik/holiday-check.

## SMS status: Disabled (alle 4 funktioner)
