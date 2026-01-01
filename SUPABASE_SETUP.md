# Supabase Cloud Storage Setup Guide

This guide will help you set up cloud storage for your Workout Tracker app using Supabase.

## Why Supabase?

Your workout data is automatically backed up to the cloud, preventing data loss and enabling sync across devices. The app works seamlessly with localStorage as a backup, so you always have offline access.

## Setup Instructions

### 1. Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub or email

### 2. Create a New Project

1. Click "New Project"
2. Choose a name (e.g., "workout-tracker")
3. Set a secure database password (save this somewhere safe!)
4. Select a region close to you
5. Click "Create new project"
6. Wait 2-3 minutes for your project to be ready

### 3. Run the Database Schema

1. In your Supabase project, go to the **SQL Editor** (left sidebar)
2. Click "New query"
3. Copy the entire contents of `supabase-schema.sql` from this repository
4. Paste it into the SQL editor
5. Click "Run" (or press Ctrl+Enter)
6. You should see "Success. No rows returned" - this is good!

This creates all the necessary tables:
- `users` - Your user profiles (Rodger and Wifey)
- `workouts` - All your workout data
- `personal_records` - Personal records tracking
- `sync_queue` - Queue for offline sync (future feature)

### 4. Get Your API Credentials

1. Go to **Project Settings** (gear icon in left sidebar)
2. Click on **API** in the settings menu
3. You'll see two important values:
   - **Project URL** (looks like `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (a long string starting with `eyJ...`)

### 5. Configure Your Local App

1. In your workout-tracker project folder, create a file named `.env.local`
2. Copy the template from `.env.local.example`:
   ```
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. Replace `https://xxxxxxxxxxxxx.supabase.co` with your **Project URL**
4. Replace `your-anon-key-here` with your **anon public key**
5. Save the file

**Important:** Never commit `.env.local` to git - it's already in `.gitignore`

### 6. Deploy to Netlify (Production)

If you're deploying to Netlify:

1. Go to your Netlify site dashboard
2. Click on **Site settings** → **Environment variables**
3. Add two new variables:
   - `VITE_SUPABASE_URL` = your Project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon public key
4. Click **Save**
5. Trigger a new deploy

## How It Works

### Automatic Sync
- **Add/Edit Workout:** Saved to localStorage instantly, then synced to Supabase in the background
- **Delete Workout:** Removed from localStorage instantly, then deleted from Supabase
- **Load Workouts:** Fetches from Supabase first, falls back to localStorage if offline

### Offline Support
- The app works fully offline using localStorage
- Changes are queued and synced when you're back online
- You never lose data even without internet

### Migration
- When you first set up Supabase, the app will detect existing localStorage data
- A prompt will appear: "Upload to Cloud?"
- Click "Upload Now" to migrate your existing workouts to Supabase
- This only happens once per user

### Sync Status
- Check the **header** for sync status (cloud icon with timestamp)
- Go to **Exercises** page (Settings) to see last sync time
- Click **"Sync Now"** to manually force a sync

## Troubleshooting

### "Not syncing" or "Offline" status

1. Check that `.env.local` exists and has the correct credentials
2. Restart your dev server: `npm run dev`
3. Check browser console for errors (F12)
4. Verify your Supabase project is active (check supabase.com)

### Migration not working

1. Make sure you ran the `supabase-schema.sql` script
2. Check that the `users` table has both user entries (user1/Rodger and user2/Wifey)
3. Try the manual "Sync Now" button in Settings

### Data not showing up

1. Check which user you're logged in as (top of page)
2. Switch users to verify data separation
3. Check localStorage: DevTools → Application → Local Storage
4. Check Supabase: SQL Editor → Run: `SELECT * FROM workouts;`

## Security Notes

- Row Level Security (RLS) is enabled on all tables
- Currently using permissive policies for simplicity (app-level user management)
- For production with real auth, you'd want to update the RLS policies
- The anon key is safe to expose in client-side code (it's meant to be public)

## Data Structure

Each workout in Supabase includes:
- `id` - Unique workout identifier
- `user_id` - Which user owns this workout (user1 or user2)
- `date` - Workout date
- `exercises` - JSON array of exercise sets
- `notes` - Optional workout notes
- `created_at` / `updated_at` - Automatic timestamps

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- Check your browser console for error messages
- Verify API credentials in Supabase dashboard

---

**That's it!** Your workout tracker now has cloud backup and sync. Your data is safe even if you clear your browser or switch devices.
