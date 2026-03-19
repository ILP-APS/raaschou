

# Plan: Populate financial amounts from e-regnskab API

## Problem
The `sync-eregnskab` Edge Function currently hardcodes all financial amounts to `0`. Only hours (projektering, produktion, montage) are being populated from work lines.

## Data sources in e-regnskab API

The following endpoints need to be fetched alongside the existing calls:

1. **`/Appointment/Standard/Line/Item`** (varelinjer) -- contains item lines per appointment with `totalPriceStandardCurrency`, used for:
   - `offer_amount` (sum of all item line totals per appointment)
   - `materials_amount` (sum of material item lines)
   - `assembly_amount` (sum of assembly/montage item lines)
   - `subcontractor_amount` (sum of subcontractor item lines)
   - Also upsert into `offer_line_items` table

2. **`/Appointment/Budget/Line`** (budget linjer) -- contains budget/estimated hours per category for:
   - `hours_estimated_projecting`
   - `hours_estimated_production`
   - `hours_estimated_assembly`

3. **`/Appointment/Budget/Income/Line`** (budget indtægter) -- may contain offer/income amounts

## Changes

### 1. Update `sync-eregnskab` Edge Function

- Add 3 new parallel API fetches: `/Appointment/Standard/Line/Item`, `/Appointment/Budget/Line`, `/Appointment/Budget/Income/Line`
- Group item lines by `hnAppointmentID` and sum `totalPriceStandardCurrency` to get `offer_amount` per project
- Categorize item lines to extract `assembly_amount`, `subcontractor_amount`, `materials_amount` (may need item group/type mapping -- will log response shapes first)
- Group budget lines by appointment to get estimated hours per category
- Calculate remaining hours: `estimated - used`
- Pass real values instead of `0` to `upsert_project`
- Upsert individual item lines into `offer_line_items` table using `upsert_offer_line_item` RPC

### 2. Approach for amount categorization

Since I cannot see the exact DTO fields (swagger truncated), the Edge Function will log a sample of item lines and budget lines on first run so we can verify the field names and categorization logic. The function will use the most likely field names based on the existing `offer_line_items` table schema (`totalPriceStandardCurrency`, `hnBudgetLineID`, `description`, etc).

## Technical details

- File modified: `supabase/functions/sync-eregnskab/index.ts`
- No database schema changes needed (all columns already exist)
- The budget income lines likely contain the total offer amount per appointment
- Item lines contain individual line items with prices that sum to the total

