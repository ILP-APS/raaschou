

## Refaktorering: Feature-baseret mappestruktur

### Hvad der flyttes til `src/features/fokusark/`

```text
src/features/fokusark/
├── components/
│   ├── buttons/RefreshRealizedHoursButton.tsx
│   ├── cells/ (7 filer)
│   ├── utils/rowStyleUtils.ts
│   ├── DataGridStyles.css
│   ├── EditableCurrencyCell.tsx
│   ├── EditablePercentageCell.tsx
│   ├── FokusarkContent.tsx
│   ├── FokusarkDataGrid.tsx
│   ├── FokusarkDataGridStyles.css
│   ├── FokusarkDescription.tsx
│   ├── FokusarkHeader.tsx
│   ├── ProjectsTable.tsx
│   ├── ProjectsTableHeaders.tsx
│   ├── ProjectsTableRow.tsx
│   └── ShadcnFokusarkTable.tsx
├── hooks/
│   ├── useProjects.ts
│   ├── useAppointments.ts
│   └── useUsers.ts
├── services/
│   └── appointmentDbService.ts
├── api/
│   └── fokusarkAppointmentsApi.ts
├── types/
│   ├── project.ts
│   ├── appointment.ts
│   └── user.ts
├── utils/
│   ├── apiUtils.ts
│   ├── appointmentUtils.ts
│   ├── formatUtils.ts
│   ├── projectHierarchy.ts
│   ├── tableData.ts
│   ├── userUtils.ts
│   └── workTypeMapping.ts
├── contexts/
│   └── FokusarkDataContext.tsx
└── pages/
    └── FokusarkPage.tsx
```

### Hvad der forbliver på plads
- `src/components/ui/` — delte UI-komponenter
- `src/components/AppSidebar.tsx` — delt navigation
- `src/integrations/supabase/` — delt Supabase client
- `src/lib/utils.ts` — delt utility
- `src/hooks/use-toast.ts`, `use-mobile.tsx`, `useHoldScroll.ts` — delte hooks
- `src/pages/Index.tsx`, `NotFound.tsx` — globale sider
- `src/App.tsx` — routing

### Import-opdateringer
Alle interne imports i de flyttede filer ændres fra `@/components/fokusark/`, `@/utils/`, `@/types/`, `@/hooks/useProjects` osv. til relative stier eller `@/features/fokusark/...`.

`App.tsx` opdateres til at importere FokusarkPage fra `@/features/fokusark/pages/FokusarkPage`.

### Implementeringstrin
1. Opret alle mapper under `src/features/fokusark/`
2. Genskab hver fil i den nye placering med opdaterede imports
3. Opdater `App.tsx` import
4. Slet de gamle filer (de tomme mapper)

Ca. 30 filer skal flyttes og have imports opdateret. Ingen funktionalitet ændres.

