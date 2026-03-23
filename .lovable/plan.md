

## Plan: Email-allowlist for login

### Overblik
Opret en `allowed_emails` tabel i Supabase, så kun godkendte email-adresser kan anmode om magic link. Login-siden tjekker tabellen før `signInWithOtp` kaldes.

### Database

1. **Ny tabel `allowed_emails`** via migration:
   - `id` (uuid, PK)
   - `email` (text, unique, not null)
   - `created_at` (timestamptz, default now())
   - RLS: kun authenticated brugere kan læse (for fremtidig admin-side)
   - En service-level function `is_email_allowed(p_email text)` med `SECURITY DEFINER` der returnerer boolean — kan kaldes af anon-brugere uden at eksponere tabellen

2. **Seed initiale emails** — du fortæller mig hvilke emails der skal tilføjes

### Frontend-ændring

3. **`src/pages/LoginPage.tsx`** — før `signInWithOtp` kaldes, kald `supabase.rpc('is_email_allowed', { p_email: email })`. Hvis false, vis fejlbesked "Denne email har ikke adgang. Kontakt administrator."

### Implementeringstrin
1. Opret migration med tabel + RPC function
2. Opdater LoginPage med email-tjek
3. Seed emails (du giver mig listen)

