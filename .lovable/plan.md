

## Problem

Tables exist and RLS policies are in place, but PostgreSQL-level GRANT permissions are missing. The `anon` role cannot access the tables at all.

## Fix

Run one SQL migration to grant table permissions:

```sql
GRANT SELECT, INSERT, UPDATE ON public.projects TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.offer_line_items TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.settings TO anon, authenticated;
```

## Steps

1. Run the GRANT SQL migration via the database migration tool
2. No code changes needed — the existing `useProjects` hook and Supabase client are already correct

