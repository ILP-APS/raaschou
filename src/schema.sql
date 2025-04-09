
-- This is a SQL script to set up the Fokusark table in Supabase
-- You can run this in the Supabase SQL editor

-- Create table for storing editable cell values
create table fokusark_cells (
  id bigint generated by default as identity primary key,
  row_index integer not null,
  col_index integer not null,
  value text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Create a unique constraint to prevent duplicate entries for the same cell
  unique(row_index, col_index)
);

-- Enable Row Level Security
alter table fokusark_cells enable row level security;

-- Create a policy that allows all authenticated users to read the data
create policy "Allow public read access" on fokusark_cells
  for select using (true);
  
-- Create a policy that allows authenticated users to insert their own data
create policy "Allow authenticated insert" on fokusark_cells
  for insert with check (auth.role() = 'authenticated');
  
-- Create a policy that allows authenticated users to update data
create policy "Allow authenticated update" on fokusark_cells
  for update using (auth.role() = 'authenticated');

-- Add updated_at trigger
create or replace function update_modified_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_fokusark_cells_updated_at
before update on fokusark_cells
for each row execute procedure update_modified_column();
