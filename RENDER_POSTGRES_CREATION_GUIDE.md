# RENDER POSTGRESQL CREATION - STEP BY STEP WITH SCREENSHOTS

## BEFORE YOU START

✓ Render account created
✓ Email verified
✓ Dashboard open: https://render.com/dashboard

---

## STEP-BY-STEP PROCESS

### STEP 1: Click "+ New" Button
```
Dashboard shows:
┌────────────────────────────────────┐
│ + New                              │
│ ▼ (Click this dropdown)            │
└────────────────────────────────────┘

Options appear:
- Web Service
- Static Site
- PostgreSQL ← CLICK THIS
- Redis
- Cron Job
```

### STEP 2: PostgreSQL Creation Form Opens
```
Screen shows PostgreSQL configuration form
(This is what you saw in the form you showed me)
```

### STEP 3: Fill in "Name" Field
```
┌────────────────────────────────────┐
│ Name                               │
│ [mauritius-game-db____________]    │ ← ENTER THIS
│                                    │
│ Example: example-postgresql-name   │
└────────────────────────────────────┘
```

**What to enter:** `mauritius-game-db`

**Why:** This is your instance name. Must be unique on your account.

**Can change later:** No (but you can create a new one)

---

### STEP 4: Fill in "Database" Field (Optional)
```
┌────────────────────────────────────┐
│ Database                           │
│ (Optional)                         │
│ [mauritius_game________________]    │ ← ENTER THIS
│                                    │
│ Randomly generated unless          │
│ specified                          │
└────────────────────────────────────┘
```

**What to enter:** `mauritius_game`

**Why:** This is the database name within PostgreSQL. Good for organization.

**If blank:** Render generates random name (works fine)

**Tip:** Use underscores, not hyphens

---

### STEP 5: Fill in "User" Field (Optional)
```
┌────────────────────────────────────┐
│ User                               │
│ (Optional)                         │
│ [game_user__________________]       │ ← ENTER THIS
│                                    │
│ Randomly generated unless          │
│ specified                          │
└────────────────────────────────────┘
```

**What to enter:** `game_user`

**Why:** This is the database user. Good for security (specific user for your app).

**If blank:** Render generates random user (works fine)

**Tip:** Use descriptive names

---

### STEP 6: Select "Region" (⭐ MOST IMPORTANT)
```
┌────────────────────────────────────┐
│ Region                             │
│ Your services in the same region   │
│ can communicate over a private net │
│                                    │
│ [Region Selector ▼]                │
│                                    │
│ Options:                           │
│ ├─ Virginia (US East)              │
│ ├─ Oregon (US West)                │
│ ├─ Frankfurt (Europe)              │
│ ├─ London (Europe)                 │
│ └─ Singapore ← SELECT THIS! ⭐     │
│                                    │
└────────────────────────────────────┘
```

**What to select:** `Singapore`

**Why:** 
- Closest to Mauritius (3,500 km)
- Lowest latency (<50ms)
- Same region as your Web Service

**DO NOT SELECT:**
- Virginia (US) - 8,000+ km away
- Oregon (US) - 10,000+ km away
- Frankfurt (Europe) - 5,000+ km away

---

### STEP 7: Select PostgreSQL Version
```
┌────────────────────────────────────┐
│ PostgreSQL Version                 │
│ [Version Selector ▼]               │
│                                    │
│ Options:                           │
│ ├─ 16                              │
│ ├─ 17                              │
│ └─ 18 ← SELECT THIS (Latest) ⭐    │
│                                    │
└────────────────────────────────────┘
```

**What to select:** `18`

**Why:** Latest stable version with all features

**If unsure:** Always pick highest number (latest)

---

### STEP 8: Datadog (Leave Blank - Optional)
```
┌────────────────────────────────────┐
│ Datadog API Key                    │
│ (Optional)                         │
│ [________________________________]  │ ← LEAVE BLANK
│                                    │
│ The API key to use for sending     │
│ metrics to Datadog. Setting this   │
│ will enable Datadog monitoring.    │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ Datadog Region                     │
│ (Optional)                         │
│ [Region Selector ▼]                │ ← LEAVE BLANK
│                                    │
│ The region key to use for sending  │
│ metrics to Datadog.                │
└────────────────────────────────────┘
```

**What to do:** **LEAVE BOTH BLANK**

**Why:** Datadog is advanced monitoring (optional). You don't need it now.

**Later:** You can add monitoring anytime if needed

---

### STEP 9: Click "Create Database" Button
```
Bottom of form:

┌────────────────────────────────────┐
│  [Create Database]                 │ ← CLICK THIS
│  (Blue button)                     │
└────────────────────────────────────┘
```

---

## WHAT HAPPENS NEXT

### Screen shows "Creating Database..."
```
⏳ Creating PostgreSQL instance...
   Please wait, this may take 2-3 minutes
   
   Progress indicator spinning
```

### Your database is being created:
1. Server provisioned
2. PostgreSQL installed
3. Database created
4. User created
5. SSL certificates configured
6. Backups enabled
7. Monitoring setup

### Typical time: **2-3 minutes**

---

## DATABASE CREATED SUCCESSFULLY!

### Screen now shows:
```
✅ PostgreSQL Instance Created!

┌──────────────────────────────────────┐
│ mauritius-game-db                    │
│                                      │
│ Status: ✓ Available                  │
│ Region: Singapore                    │
│ Version: PostgreSQL 18               │
│ Created: 2026-02-03                  │
└──────────────────────────────────────┘

Connection Information:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Host: dpg-xxxxxxxxxxxx.onrender.com
Port: 5432
Database: mauritius_game
User: game_user
Password: aBcDeFgHiJkLmNoPqRsT1234

Internal Database URL:
postgres://game_user:aBcDeFgHiJkLmNoPqRsT1234@dpg-xxxxxxxxxxxx.onrender.com:5432/mauritius_game

External Database URL:
postgres://game_user:aBcDeFgHiJkLmNoPqRsT1234@dpg-xxxxxxxxxxxx.onrender.com:5432/mauritius_game
```

---

## CRITICAL: COPY & SAVE THESE

### 1️⃣ DATABASE_URL (Most Important!)
```
postgres://game_user:aBcDeFgHiJkLmNoPqRsT1234@dpg-xxxxxxxxxxxx.onrender.com:5432/mauritius_game
```

✅ Copy this URL
✅ Save in text file
✅ You'll paste this into Web Service environment variables

### 2️⃣ Password (Shown Only Once!)
```
aBcDeFgHiJkLmNoPqRsT1234
```

✅ Save securely
✅ Can't recover if lost
✅ Included in DATABASE_URL

### 3️⃣ Host (For reference)
```
dpg-xxxxxxxxxxxx.onrender.com
```

✅ Keep for records

---

## NEXT STEPS

Now that database is created:

1. ✓ PostgreSQL database created in Singapore
2. ✓ DATABASE_URL copied and saved
3. → Upload your Web Service (ZIP file)
4. → Add DATABASE_URL to Web Service environment variables
5. → Deploy Web Service
6. → Migrate data from Supabase

---

## DASHBOARD VIEW

Your PostgreSQL instance appears in dashboard:

```
Render Dashboard
┌──────────────────────────────────────┐
│ Your Instance: mauritius-game-db     │
├──────────────────────────────────────┤
│ Type: PostgreSQL                     │
│ Region: Singapore                    │
│ Status: Available ✓                  │
│ Version: 18                          │
│ Created: 2026-02-03                  │
│                                      │
│ [View Logs] [Settings] [Backups]     │
└──────────────────────────────────────┘
```

---

## VERIFY CONNECTION (Optional)

To test database is working:

1. Click on your PostgreSQL instance
2. Click "Browser" tab
3. Try simple query:
   ```sql
   SELECT NOW();
   ```
4. Should return current timestamp ✓

---

## TROUBLESHOOTING

### "Region not available"
- Some regions may have capacity limits
- Try different region or different time
- Singapore is best for you though

### "Name already exists"
- Must be unique name on your account
- Try: `mauritius-game-db-2` or `mauritius-game-prod`

### "Creation failed"
- Check all fields are filled correctly
- Try again
- Contact Render support if persists

### "Can't see DATABASE_URL"
- Page might not have loaded fully
- Refresh the page
- URL is always visible on instance page

---

## SUMMARY

✅ Database created: `mauritius-game-db`
✅ Region: Singapore (fast for Mauritius)
✅ Database: mauritius_game
✅ User: game_user
✅ PostgreSQL: Version 18
✅ DATABASE_URL: Copied & saved

**Next:** Create Web Service and deploy your ZIP file

---

**You're doing great! 🚀**
