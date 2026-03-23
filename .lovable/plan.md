

## Plan: Magic Link Authentication

### Overblik
Tilføj Supabase magic link login, så alle sider kræver login. Ingen profil-tabel — kun `auth.users`.

### Nye filer

1. **`src/pages/LoginPage.tsx`** — Login-side med email-input og "Send magic link"-knap. Bruger `supabase.auth.signInWithOtp({ email })`. Viser besked om at tjekke email efter afsendelse. Simpelt design med Raaschou-branding.

2. **`src/components/ProtectedRoute.tsx`** — Wrapper-komponent der tjekker auth-session via `onAuthStateChange` + `getSession`. Redirecter til `/login` hvis ikke logget ind. Viser loading-spinner under session-tjek.

### Ændringer i eksisterende filer

3. **`src/App.tsx`** — Wrap alle routes (undtagen `/login`) med `ProtectedRoute`. Tilføj `/login` route.

4. **`src/components/AppSidebar.tsx`** — Tilføj logout-knap i bunden af sidebar. Kalder `supabase.auth.signOut()` og redirecter til `/login`.

### Supabase konfiguration

5. **Auth provider** — Supabase email auth er aktiveret som standard. Magic link virker out-of-the-box med `signInWithOtp`. Ingen ekstra edge functions eller database-ændringer nødvendige.

### Redirect URL
- `emailRedirectTo: window.location.origin` sikrer at brugeren lander tilbage i appen efter klik på magic link.

### Implementeringstrin
1. Opret `ProtectedRoute` komponent med session-håndtering
2. Opret `LoginPage` med magic link flow
3. Opdater `App.tsx` med login-route og beskyttede routes
4. Tilføj logout i AppSidebar

