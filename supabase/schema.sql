-- Create a table for bookmarks
create table bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  url text not null,
  title text,
  created_at timestamptz default now()
);

-- Set up Row Level Security (RLS)
alter table bookmarks enable row level security;

-- Create policies
create policy "Individuals can create bookmarks." on bookmarks for
    insert with check (auth.uid() = user_id);

create policy "Individuals can view their own bookmarks. " on bookmarks for
    select using (auth.uid() = user_id);

create policy "Individuals can update their own bookmarks." on bookmarks for
    update using (auth.uid() = user_id);

create policy "Individuals can delete their own bookmarks." on bookmarks for
    delete using (auth.uid() = user_id);

-- Enable Realtime
alter publication supabase_realtime add table bookmarks;
