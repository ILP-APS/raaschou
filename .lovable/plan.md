

## Plan: Aktiver SMS-afsendelse i alle tre Edge Functions

### Hvad sker der
De tre edge functions (`check-today`, `remind-yesterday`, `friday-summary`) har alle en `sendSms`-funktion hvor de to første linjer er en early-return der forhindrer faktisk SMS-afsendelse. Disse skal fjernes.

### Sikkerhed mod uønsket afsendelse
Ingen SMS sendes ved denne ændring alene. Edge functions kører kun når de bliver kaldt af cron-jobbet eller manuelt. Deployment af koden udløser ikke et funktionskald.

### Ændringer (3 filer, identisk ændring)

I hver af disse filer fjernes de 3 "disabled"-linjer fra `sendSms`:

1. **`supabase/functions/check-today/index.ts`** (linje 77-80)
2. **`supabase/functions/remind-yesterday/index.ts`** (linje 58-61)  
3. **`supabase/functions/friday-summary/index.ts`** (linje 78-81)

Fjernes:
```typescript
  // SMS DISABLED - re-enable when logic is verified
  console.log(`[SMS DISABLED] Would send to ${phone}: ${message.substring(0, 80)}...`);
  return "disabled";
```

Funktionen vil herefter gå direkte videre til det eksisterende CloudTalk API-kald.

