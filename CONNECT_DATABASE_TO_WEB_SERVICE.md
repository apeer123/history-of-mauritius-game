# Connect PostgreSQL to Web Service - Render Latest UI (2026)

## Current Situation
- ✅ Web Service deployed (website loading)
- ✅ PostgreSQL database created
- ❌ Web Service not connected to database

## Fix: Connect Database to Web Service

### Step 1: Go to Your Web Service

1. Open https://render.com/dashboard
2. Click on your **Web Service** (mauritius-game-app)
3. You should see it's running (green status)

### Step 2: Open Environment Variables

1. In the web service page, look for **"Settings"** (or **"Environment"**)
2. Scroll down to **"Environment Variables"** section
3. You should see some variables already there

### Step 3: Add DATABASE_URL

Look for a variable called **DATABASE_URL**

**If it exists:**
- Check if it's empty or has wrong value
- Update it to the INTERNAL database URL you provided

**If it doesn't exist:**
- Click **"Add Environment Variable"** button
- Fill in:
  ```
  Variable Name:  DATABASE_URL
  Value:          postgresql://game_user:BBItQd31Y4NwX2QbUaZ2FMgv1RlzfJrV@dpg-d60tkpur433s73boe6q0-a/mauritius_game
  ```

### Step 4: Save & Deploy

1. Click **"Save Changes"** (or similar button)
2. Web service will auto-restart
3. Wait 30-60 seconds for restart

### Step 5: Check Connection

1. Go to **"Logs"** tab in your web service
2. Look for these messages:
   - ✅ `Listening on port 3000` - App started
   - ✅ `Database connected` - Database OK
   - ❌ `Error: connect ECONNREFUSED` - Wrong URL
   - ❌ `Error: password authentication failed` - Wrong credentials

---

## Key Points

### Internal vs External URLs

| URL Type | When to Use | Format |
|----------|------------|--------|
| **Internal** | Web service connecting to DB on Render | `dpg-d60tkpur433s73boe6q0-a` (no .render.com) |
| **External** | Local computer connecting to DB | `dpg-d60tkpur433s73boe6q0-a.singapore-postgres.render.com` |

**For your case:** Use **INTERNAL** URL in web service

### The Internal URL (for DATABASE_URL)
```
postgresql://game_user:BBItQd31Y4NwX2QbUaZ2FMgv1RlzfJrV@dpg-d60tkpur433s73boe6q0-a/mauritius_game
```

### Other Environment Variables (Should Already Be Set)

```
NODE_ENV                = production
NEXTAUTH_URL            = https://your-app-name.onrender.com
NEXTAUTH_SECRET         = (should be set)
GOOGLE_CLIENT_ID        = (optional)
GOOGLE_CLIENT_SECRET    = (optional)
FACEBOOK_APP_ID         = (optional)
FACEBOOK_APP_SECRET     = (optional)
```

---

## Alternative: Using Render's Service Linking

**If you want Render to auto-manage the connection:**

1. In web service **Settings**
2. Look for **"Databases"** section (not Environment Variables)
3. Click **"Link Database"** or **"Connect Database"**
4. Select your PostgreSQL database
5. Render will auto-fill DATABASE_URL

---

## Verify It Works

After updating DATABASE_URL:

1. Go to **Logs** and watch the restart
2. Look for success messages
3. Visit your app: `https://your-app-name.onrender.com/api/questions`
4. Should return JSON with question data (or empty array if no questions)

---

## If Still Not Working

### Check 1: Is DATABASE_URL Correct?
```
postgresql://game_user:BBItQd31Y4NwX2QbUaZ2FMgv1RlzfJrV@dpg-d60tkpur433s73boe6q0-a/mauritius_game
```
- Should NOT have `.onrender.com` (that's external)
- Should have your password
- Database name should be: `mauritius_game`

### Check 2: Is PostgreSQL Service Running?
1. Go to your PostgreSQL database in Render
2. Check status is **"Available"** (green)
3. NOT "Suspended" or "Error"

### Check 3: Check Web Service Logs
1. Open **Logs** in web service
2. Search for "database" or "Error"
3. Look for:
   - `ECONNREFUSED` = Wrong hostname
   - `password authentication failed` = Wrong password
   - `database mauritius_game does not exist` = Wrong DB name

### Check 4: Test from Render Dashboard

1. Go to your PostgreSQL service
2. Click **"Browser"** tab
3. Should show your tables (subjects, levels, etc.)
4. If you see tables = database is working

---

## Quick Checklist

- [ ] Web service has DATABASE_URL variable
- [ ] DATABASE_URL has correct hostname (dpg-d60...)
- [ ] DATABASE_URL has correct password (BBItQd31Y...)
- [ ] DATABASE_URL uses INTERNAL hostname (no .render.com)
- [ ] PostgreSQL service is "Available" status
- [ ] Web service restarted after adding DATABASE_URL
- [ ] No errors in web service logs
- [ ] Can see tables in PostgreSQL Browser tab

---

## Example of Correct DATABASE_URL

```
postgresql://game_user:BBItQd31Y4NwX2QbUaZ2FMgv1RlzfJrV@dpg-d60tkpur433s73boe6q0-a/mauritius_game
         ↑                ↑                                  ↑                                   ↑
       user            password                          hostname (internal)                database
```

No spaces, no quotes, exact format!
