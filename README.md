## Workout Progress Tracker

A mobile-first workout logging app built with **React + Vite** with **cloud sync** via Supabase and **offline support** via localStorage.

### Features

- **Fast data entry**: Auto-fill last weight, quick increment buttons (+2.5kg/+5kg), copy from recent workouts
- **Multi-user support**: Separate profiles for Rodger and Wifey with isolated data
- **Cloud sync**: Automatic backup to Supabase with offline-first design
- **Progress charts**: Visual weight progression over time using Recharts
- **Personal records**: Automatic PR detection with badges
- **Smart filters**: Filter workouts by date range (7d/30d/3m/all) and exercise
- **Exercise library**: Managed through JSON editor and simple add button
- **Mobile optimized**: Large touch targets, numeric keyboards, responsive design

### Running locally

1. Install dependencies: `npm install`
2. (Optional) Set up Supabase cloud storage - see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
3. Start dev server: `npm run dev`
4. Build for production: `npm run build`

**Note:** The app works fully offline with localStorage. Supabase is optional but recommended for cloud backup and multi-device sync.

### Deploying to Netlify

The app is a standard Vite SPA. Deploy by pointing Netlify at this repo:

- **Build command**: `npm run build`
- **Publish directory**: `dist`

For cloud sync in production, add these environment variables in Netlify:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon public key

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions.

### Tech Stack

- **React 18** with TypeScript
- **Vite** for fast builds
- **React Router** for routing
- **Recharts** for data visualization
- **Supabase** for cloud database (optional)
- **localStorage** for offline storage



