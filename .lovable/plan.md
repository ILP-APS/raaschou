

# Deaktiver SMS-afsendelse i alle edge functions

Simpelt fix: ændre `sendSms`-funktionen i alle 3 edge functions til at returnere "disabled" uden at kalde CloudTalk. Alt andet logik (cases, logs, registreringstjek) kører stadig, så vi kan debugge uden at sende SMS.

## Ændringer

**3 filer** — samme ændring i hver:

1. `supabase/functions/check-today/index.ts`
2. `supabase/functions/remind-yesterday/index.ts`
3. `supabase/functions/friday-summary/index.ts`

I hver fil tilføjes én linje øverst i `sendSms`-funktionen:

```typescript
async function sendSms(...): Promise<string> {
  // SMS DISABLED - re-enable when logic is verified
  console.log(`[SMS DISABLED] Would send to ${phone}: ${message.substring(0, 80)}...`);
  return "disabled";
  // ... rest of function unchanged
}
```

SMS-logs gemmes stadig med status "disabled" så vi kan se hvad der *ville* være sendt.

