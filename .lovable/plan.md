

## Plan: Tilføj Produktionsark som feature #2

### Overblik
Produktionsark er en tabel der viser åbne aftaler (appointments) fra e-regnskab API'et, kategoriseret og farvekodet. Den inkluderer Excel-download funktionalitet.

### Struktur (følger feature-arkitekturen)

```text
src/features/produktionsark/
├── components/
│   └── AppointmentsTable.tsx    ← Hovedtabel med Excel-download
├── hooks/
│   └── useAppointments.ts       ← React Query hook
├── types/
│   └── appointment.ts           ← Appointment interface
├── utils/
│   └── dateUtils.ts             ← formatWeekDay, getCategoryType, getCategoryRowColor
└── pages/
    └── ProduktionsarkPage.tsx   ← Side med sidebar-layout
```

### Nye edge functions

```text
supabase/functions/
├── fetch-appointments/index.ts  ← Henter åbne aftaler fra 5 kategorier
└── fetch-categories/index.ts    ← Henter kategori-liste (hjælpe-funktion)
```

Begge bruger den eksisterende `EREGNSKAB_API_KEY` secret (det andet projekt bruger `API_KEY` — vi tilpasser til vores navngivning).

### Ændringer i eksisterende filer

1. **`package.json`** — tilføj `exceljs` dependency (date-fns er allerede installeret)
2. **`src/App.tsx`** — tilføj route `/produktionsark`
3. **`src/components/AppSidebar.tsx`** — tilføj "Produktionsark" menupunkt

### Tilpasninger fra det andet projekt

- Import-stier ændres til `@/features/produktionsark/...`
- Edge functions bruger `EREGNSKAB_API_KEY` i stedet for `API_KEY`
- ProduktionsarkPage wrapper med AppSidebar + SidebarProvider (som FokusarkPage)
- Supabase client import fra `@/integrations/supabase/client`

### Implementeringstrin

1. Opret edge functions (`fetch-appointments`, `fetch-categories`) med tilpasset secret-navn
2. Installer `exceljs` dependency
3. Opret alle filer under `src/features/produktionsark/`
4. Opdater App.tsx routing og AppSidebar navigation
5. Deploy edge functions

