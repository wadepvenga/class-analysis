-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create the analyses table
create table if not exists analyses (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id text not null,
  video_url text not null,
  pdf_url text not null,
  status text not null check (status in ('pending', 'processing', 'completed', 'error')),
  result jsonb
);

-- Create indexes
create index if not exists analyses_user_id_idx on analyses(user_id);
create index if not exists analyses_status_idx on analyses(status);

-- Set up Row Level Security (RLS)
alter table analyses enable row level security;

-- Create policies
create policy "Enable read access for all users" on analyses
  for select using (true);

create policy "Enable insert access for all users" on analyses
  for insert with check (true);

create policy "Enable update access for all users" on analyses
  for update using (true); 