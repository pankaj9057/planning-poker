# Supabase Authentication Options

The Planning Poker app can work with **three different authentication setups**:

## Option 1: No Authentication (Simplest - Recommended for Testing)

**Pros:**
- Quickest to set up
- No authentication configuration needed
- Perfect for development and testing
- Users get a client-side generated ID

**Cons:**
- Less secure (anyone can read/write data)
- No user identity persistence across devices
- Not recommended for production

**Setup:**
1. Run `supabase-schema.sql` as-is (it has open policies)
2. Don't enable any authentication providers
3. The app will automatically use client-side IDs

---

## Option 2: Anonymous Authentication (Balanced)

**Pros:**
- Users get a real Supabase user ID
- Simple for users (no sign-up needed)
- Better than client-side IDs
- User session persists across browser tabs

**Cons:**
- Users can't access same session from different devices
- Slightly more setup required

**Setup:**
1. Run `supabase-schema.sql`
2. Go to Supabase Dashboard → Authentication → Providers
3. Enable "Anonymous" sign-ins
4. That's it! The app will automatically use it

---

## Option 3: Full Authentication (Most Secure)

**Pros:**
- Secure user identities
- Users can access their games from any device
- Support for email, OAuth (Google, GitHub, etc.)
- Best for production apps

**Cons:**
- Requires user sign-up/login
- More complex UX

**Setup:**
1. Run `supabase-schema-with-auth.sql` (see below)
2. Enable your preferred auth providers in Supabase
3. Add sign-in UI to the app (requires code changes)

---

## Current Setup: Option 1 (No Auth)

Your app is currently configured for **Option 1** - it will work without any authentication enabled. The app uses client-side generated UUIDs stored in localStorage.

If you want to upgrade to Option 2 or 3, you can do so anytime without losing data.

---

## Upgrading Authentication Later

### From Option 1 → Option 2 (Anonymous Auth):
1. Enable Anonymous sign-ins in Supabase
2. App will automatically start using it
3. Existing games will still work

### From Option 1 or 2 → Option 3 (Full Auth):
1. Update database policies to require authentication
2. Add sign-in UI components
3. Enable email or OAuth providers
4. Update Row Level Security policies:

```sql
-- Example: Restrict to authenticated users only
ALTER POLICY "Allow public insert access to games" ON games
USING (auth.uid() IS NOT NULL);

ALTER POLICY "Allow public update access to games" ON games  
USING (auth.uid() = created_by_id);
```

---

## Which Option Should I Use?

- **Just testing/developing?** → Use Option 1 (current setup)
- **Want simple production app?** → Use Option 2 (anonymous auth)
- **Building serious app with user accounts?** → Use Option 3 (full auth)

**Current recommendation:** Start with Option 1, upgrade to Option 2 when ready.
