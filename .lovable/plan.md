

## Plan: Opdater cron-jobs til sommertid (CEST/UTC+2)

### Baggrund
Danmark skiftede til sommertid den 29. marts. Migrationen indeholder allerede kommentarer med de korrekte sommertid-værdier.

### Ændring

**Ny migration** — Opdaterer alle 4 cron-jobs:

```sql
-- Sommertid-rettelse (CEST/UTC+2) fra 29. marts 2026

SELECT cron.unschedule('check-today-mon-thu');
SELECT cron.unschedule('remind-yesterday-morning');
SELECT cron.unschedule('remind-yesterday-midday');
SELECT cron.unschedule('friday-summary');

-- check-today: 15:10 dansk tid = 13:10 UTC (sommertid)
SELECT cron.schedule('check-today-mon-thu', '10 13 * * 1-4', ...);

-- remind-yesterday morgen: 07:00 dansk tid = 05:00 UTC
SELECT cron.schedule('remind-yesterday-morning', '0 5 * * 2-5', ...);

-- remind-yesterday middag: 11:50 dansk tid = 09:50 UTC
SELECT cron.schedule('remind-yesterday-midday', '50 9 * * 2-5', ...);

-- friday-summary: 14:40 dansk tid = 12:40 UTC
SELECT cron.schedule('friday-summary', '40 12 * * 5', ...);
```

Selve `net.http_post`-kaldene forbliver identiske — kun schedule-strengen ændres.

| Job | Vintertid (UTC) | Sommertid (UTC) | Dansk tid |
|-----|----------------|-----------------|-----------|
| check-today | 14:10 | **13:10** | 15:10 |
| remind-yesterday morgen | 06:00 | **05:00** | 07:00 |
| remind-yesterday middag | 10:50 | **09:50** | 11:50 |
| friday-summary | 13:40 | **12:40** | 14:40 |

### Ingen andre ændringer
Ingen kode- eller frontend-ændringer.

