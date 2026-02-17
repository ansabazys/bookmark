# Realtime Bookmark App

A simple, real-time bookmark manager built with **Next.js**, **Supabase**, and **Tailwind CSS**.

## Features

-   **Realtime Updates**: Bookmarks added or deleted appear instantly across all connected devices and tabs.
-   **User Authentication**: Secure login via Supabase Auth.
-   **Row Level Security (RLS)**: Users can only manage their own bookmarks.
-   **Responsive Design**: Clean and simple UI using Tailwind CSS.

## Getting Started

### Prerequisites

-   Node.js (v18+)
-   A Supabase project

### Setup

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Variables**:
    Create a `.env.local` file in the root directory and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your-project-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
    ```
4.  **Database Setup**:
    Run the following SQL in your Supabase SQL Editor:
    ```sql
    -- Create bookmarks table
    create table bookmarks (
      id uuid default gen_random_uuid() primary key,
      user_id uuid references auth.users not null,
      url text not null,
      title text,
      created_at timestamptz default now()
    );

    -- Enable RLS
    alter table bookmarks enable row level security;

    -- Create Policies
    create policy "Individuals can create bookmarks." on bookmarks for insert with check (auth.uid() = user_id);
    create policy "Individuals can view their own bookmarks. " on bookmarks for select using (auth.uid() = user_id);
    create policy "Individuals can update their own bookmarks." on bookmarks for update using (auth.uid() = user_id);
    create policy "Individuals can delete their own bookmarks." on bookmarks for delete using (auth.uid() = user_id);

    -- Enable Realtime
    alter publication supabase_realtime add table bookmarks;

    -- IMPORTANT: Enable full replica identity for DELETE events to work with RLS filters
    alter table bookmarks replica identity full;
    ```
5.  **Run the development server**:
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Realtime Communication Issues & Solutions

During the development of the realtime bookmark feature, we encountered several challenges with Supabase Realtime synchronization. Here is a summary of the problems and their solutions:

### 1. Constant Re-subscription Loops
**Problem:** The `BookmarkList` component was re-subscribing to Realtime channels on every render.
**Cause:** The `createClient()` function was called directly in the component body, creating a new Supabase client instance on every render. The `useEffect` dependency array included this unstable client, triggering re-execution.
**Solution:** Stabilized the Supabase client instance using `useState`.
```typescript
const [supabase] = useState(() => createClient())
```

### 2. Cross-Tab/Window Synchronization Failure
**Problem:** Adding a bookmark in one tab updated the UI there, but other open tabs for the same user remained stagnant.
**Cause:** We were originally filtering by `schema: 'public', table: 'bookmarks'`. While this works for open data, combined with Row Level Security (RLS), it can be unreliable for initial event propagation across different client instances if the subscription isn't specific enough or if the RLS policy is restrictive in a way that Realtime doesn't automatically handle for "broadcast" style events.
**Solution:** We switched to a filtered subscription specifically targeting the `user_id` column.
```typescript
filter: `user_id=eq.${user.id}`
```
This ensures that each client listens specifically for changes relevant to *that* user, which Supabase Realtime handles more reliably through RLS.

### 3. DELETE Events Not Updating UI
**Problem:** Deleting a bookmark worked in the database, but the UI (in real-time) didn't reflect the removal unless refreshed.
**Cause:** Postgres `DELETE` operations by default only send the Primary Key (e.g., `id`) in the replication log. However, our Realtime subscription filter was looking for `user_id=eq.${user.id}`. Since the `DELETE` payload didn't include `user_id`, the event was filtered out and never sent to the client.
**Solution:** We changed the table's `REPLICA IDENTITY` to `FULL`.
```sql
alter table bookmarks replica identity full;
```
This forces Postgres to include valid values for all columns in the replication log for `UPDATE` and `DELETE` operations, allowing the `user_id` filter to match successfully.
