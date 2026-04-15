

## Tilføj ume@raaschou.as til allowed_emails

### Ændring

Opret en database-migration der indsætter `ume@raaschou.as` i `allowed_emails`-tabellen:

```sql
INSERT INTO public.allowed_emails (email) VALUES ('ume@raaschou.as');
```

Det er alt. Én migration, én linje. Herefter kan `ume@raaschou.as` modtage magic links og logge ind.

