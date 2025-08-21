# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/log in
2. Click "New Project"
3. Choose your organization and enter:
   - Project name: "Workout Tracker"
   - Database password: (create a strong password)
   - Region: Choose closest to your location
4. Click "Create new project"

## 2. Get Your Project Credentials

1. Once your project is created, go to "Settings" → "API"
2. Copy the following values:
   - **Project URL** (something like `https://xxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

## 3. Configure Environment Variables

1. Open the `.env.local` file in your project root
2. Replace the placeholder values:
   ```
   REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## 4. Set Up the Database Schema

1. In your Supabase dashboard, go to "SQL Editor"
2. Copy the entire contents of the `database-schema.sql` file
3. Paste it into the SQL Editor and click "Run"
4. This will create all necessary tables, policies, and triggers

## 5. Enable Email Authentication (Optional)

1. Go to "Authentication" → "Settings"
2. Under "Auth Providers", make sure "Email" is enabled
3. You can also enable other providers like Google, GitHub, etc.

## 6. Test the Application

1. Restart your development server: `npm start`
2. You should see a login/signup form
3. Create an account and start using the app!

## Database Schema Overview

The app uses three main tables:

- **workouts**: Stores workout information (name, user_id)
- **exercises**: Stores exercises within workouts (name, sets, reps, etc.)
- **workout_routines**: Stores user's routine configuration

All tables include Row Level Security (RLS) to ensure users can only access their own data.

## Troubleshooting

### "Invalid API key" error
- Make sure your environment variables are correctly set
- Restart your development server after changing .env.local

### "relation does not exist" error
- Make sure you ran the database schema SQL in Supabase
- Check the SQL Editor for any error messages

### Authentication not working
- Ensure email authentication is enabled in Supabase
- Check the browser console for detailed error messages

## Features Implemented

✅ User authentication (sign up/sign in/sign out)
✅ Personal workout storage in database
✅ Exercise tracking with sets/reps/weights
✅ Routine builder with database persistence
✅ Secure data access (users only see their own data)
✅ Real-time data synchronization