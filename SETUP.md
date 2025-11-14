# Quick Setup Guide

## You're seeing a configuration error because Supabase credentials are not set up yet.

### Follow these steps:

1. **Create a Supabase Project**
   - Go to https://app.supabase.com
   - Click "New Project"
   - Fill in the project details and wait for it to initialize

2. **Set Up the Database**
   - In your Supabase dashboard, go to "SQL Editor"
   - Open the file `supabase-schema.sql` from this project
   - Copy all the SQL content and paste it into the SQL Editor
   - Click "Run" to create the tables and policies

3. **Enable Anonymous Authentication**
   - Go to "Authentication" → "Providers" in your Supabase dashboard
   - Find "Anonymous" and toggle it ON
   - Save the changes

4. **Get Your Credentials**
   - Go to "Project Settings" (gear icon in the sidebar)
   - Click on "API"
   - You'll see:
     - **Project URL** (looks like: https://xxxxx.supabase.co)
     - **anon public key** (a long JWT token starting with eyJ...)

5. **Update Your .env File**
   - Open the `.env` file in this project
   - Replace the placeholder values:
     ```
     VITE_SUPABASE_URL=https://your-project-id.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```

6. **Restart the Dev Server**
   - Stop the current dev server (Ctrl+C in the terminal)
   - Run: `npm run dev`
   - Open http://localhost:5173

## Troubleshooting

**"Invalid supabaseUrl" error**
- Make sure the URL starts with `https://` and ends with `.supabase.co`
- Check that you copied the entire URL

**"Invalid API key" error**
- The anon key should be a long string (JWT token)
- Make sure you copied the complete key without any spaces

**"Anonymous sign-in is disabled" error**
- Go back to Authentication → Providers in Supabase
- Make sure "Anonymous" is enabled

**Changes not reflecting**
- Environment variables require a server restart
- Press Ctrl+C to stop the server
- Run `npm run dev` again

Need more help? Check the detailed README.md file.
