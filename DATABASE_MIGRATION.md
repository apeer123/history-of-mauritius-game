# DATABASE MIGRATION: SUPABASE → RENDER POSTGRESQL

After deploying your Web Service to Render, use this guide to migrate your database.

---

## OPTION 1: RENDER BROWSER (EASIEST - RECOMMENDED)

### Step 1: Export Schema from Supabase

1. Go to Supabase Dashboard
2. Click **"SQL Editor"**
3. Run this command to see all tables:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

4. For each table, get the CREATE TABLE statement:

```sql
-- Example for user_profiles table
SELECT pg_get_createtablestmt('public.user_profiles'::regclass);
```

5. Copy all the output

### Step 2: Create Tables in Render PostgreSQL

1. Go to Render Dashboard → Your PostgreSQL Database
2. Click **"Browser"** tab
3. Paste all CREATE TABLE statements
4. Run each one

### Step 3: Copy Data (If you have existing data)

```sql
-- Run this in Supabase SQL Editor to see data
SELECT * FROM user_profiles LIMIT 5;

-- Then copy data migration script
-- Contact Render support for help
```

---

## OPTION 2: COMMAND LINE (FAST - IF YOU HAVE PSQL)

### Prerequisites
- psql installed (PostgreSQL client)
- Supabase connection details
- Render connection details

### Step 1: Export from Supabase

```powershell
# Set Supabase password
$env:PGPASSWORD = "your-supabase-password"

# Export entire database
pg_dump -h zjziegyiscwdpnimjtgm.supabase.co `
        -U postgres `
        -d postgres `
        -v `
        --no-password `
        > supabase_backup.sql

# Unset password
$env:PGPASSWORD = ""
```

### Step 2: Import to Render

```powershell
# Get your Render Database URL from dashboard
# It looks like: postgresql://game_user:PASSWORD@dpg-xxx.onrender.com:5432/mauritius_game

# Set Render password (from the URL)
$env:PGPASSWORD = "your-render-password"

# Import the dump
psql -h dpg-xxxxx.onrender.com `
     -U game_user `
     -d mauritius_game `
     -f supabase_backup.sql `
     --no-password

# Unset password
$env:PGPASSWORD = ""
```

### Step 3: Verify Migration

```powershell
$env:PGPASSWORD = "your-render-password"

psql -h dpg-xxxxx.onrender.com `
     -U game_user `
     -d mauritius_game `
     -c "SELECT COUNT(*) FROM user_profiles;"

$env:PGPASSWORD = ""
```

---

## OPTION 3: SQL SCRIPT (MANUAL - SAFEST)

### Step 1: Get Current Schema

Run in Supabase SQL Editor:

```sql
-- Export all table definitions
SELECT tablename, schemaname 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

### Step 2: Create Tables in Render

Run in Render Browser or psql:

```sql
-- User Profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  username TEXT,
  email TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions
CREATE TABLE questions (
  id UUID PRIMARY KEY,
  subject TEXT,
  question_text TEXT,
  question_type TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game Progress
CREATE TABLE game_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  level INTEGER,
  score INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leaderboard
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  score INTEGER,
  rank INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  achievement_type TEXT,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Step 3: Copy Data

If you have existing data, ask for help:
- Contact Render support: support@render.com
- Provide: Supabase and Render connection strings
- They'll help with data migration

---

## AFTER MIGRATION: VERIFICATION CHECKLIST

```sql
-- Run these in Render to verify migration:

-- Check user count
SELECT COUNT(*) as user_count FROM user_profiles;

-- Check questions count
SELECT COUNT(*) as question_count FROM questions;

-- Check game progress
SELECT COUNT(*) as progress_count FROM game_progress;

-- Check leaderboard
SELECT COUNT(*) as leaderboard_count FROM leaderboard;

-- Check achievements
SELECT COUNT(*) as achievement_count FROM achievements;

-- List all tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check indexes
SELECT indexname FROM pg_indexes WHERE schemaname = 'public';
```

---

## TROUBLESHOOTING

### "Connection refused" error
- Check DATABASE_URL is correct in Render
- Verify SSL settings: `?sslmode=require`
- Wait 2-3 minutes after database creation

### "Password authentication failed"
- Copy password from DATABASE_URL exactly
- Include special characters as-is
- Don't escape the password manually

### "No such table" error
- Verify CREATE TABLE statements ran successfully
- Check table names are lowercase
- Ensure you're connected to `mauritius_game` database

### Data not imported
- First, export just schema (no data)
- Then import data separately
- Or ask Render support for assisted migration

---

## NEXT: UPDATE YOUR APPLICATION

After database migration, update your app:

1. Update `DATABASE_URL` in Render environment variables
2. Update connection string in your app code if needed
3. Redeploy Web Service
4. Test database connectivity
5. Verify all queries work

---

## FINAL CHECK

Your app should now:
✓ Connect to Render PostgreSQL
✓ Read user data
✓ Write new records
✓ Update leaderboard
✓ Store progress
✓ Track achievements

All from a unified platform in Singapore!

**Questions?** Contact Render support or check their docs: https://render.com/docs/databases
