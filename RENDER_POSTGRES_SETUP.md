# RENDER POSTGRESQL SETUP - FILLED TEMPLATE

## Form Fields - COPY THESE VALUES

### ⭐ REQUIRED FIELDS

**Name** (Unique identifier)
```
mauritius-game-db
```

**Region** (MOST IMPORTANT FOR MAURITIUS)
```
Singapore
```
(Other options: Virginia, Oregon, Frankfurt, London - but Singapore is closest to Mauritius)

---

### 📝 OPTIONAL FIELDS

**Database Name** (Database to create)
```
mauritius_game
```
If left blank: randomly generated (will work fine)

**User** (Database user)
```
game_user
```
If left blank: randomly generated (will work fine)

**PostgreSQL Version**
```
18
```
(Latest stable version - good choice)

---

## COMPLETE FORM TO FILL OUT

When you go to Render dashboard:

### Step 1: Click "+ New" → "PostgreSQL"

### Step 2: Fill in these fields

```
┌─────────────────────────────────────┐
│ Name                                │
│ mauritius-game-db                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Database                            │
│ mauritius_game                      │
│ (Optional - or leave blank)         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ User                                │
│ game_user                           │
│ (Optional - or leave blank)         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Region                              │
│ [Singapore]  ← SELECT THIS          │
│ Other options:                      │
│ - Virginia (US East)                │
│ - Oregon (US West)                  │
│ - Frankfurt (Europe)                │
│ - London (Europe)                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ PostgreSQL Version                  │
│ [18]  ← This is good                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Datadog API Key                     │
│ (Leave blank - optional)            │
│ (Only if you use Datadog)           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Datadog Region                      │
│ (Leave blank - optional)            │
│ (Only if you use Datadog)           │
└─────────────────────────────────────┘
```

### Step 3: Click "Create Database"

---

## WHAT YOU'LL GET BACK

After clicking "Create Database", Render will show you:

```
✓ Database created successfully!

Connection Information:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HOST: dpg-xxxxxxxxxxxxx.onrender.com
PORT: 5432
DATABASE: mauritius_game
USER: game_user
PASSWORD: xxxxxxxxxxxxxxxxxx

INTERNAL DATABASE URL (use inside Render):
postgres://game_user:PASSWORD@dpg-xxxxx.onrender.com:5432/mauritius_game

EXTERNAL DATABASE URL (use from outside):
postgres://game_user:PASSWORD@dpg-xxxxx.onrender.com:5432/mauritius_game

⭐ COPY THE DATABASE URL - YOU'LL NEED IT FOR YOUR WEB SERVICE
```

---

## IMPORTANT: COPY & SAVE THESE

After database is created:

1. **DATABASE_URL** (for your Web Service)
   ```
   postgres://game_user:PASSWORD@dpg-xxxxx.onrender.com:5432/mauritius_game
   ```
   ➡️ Save this in a text file
   ➡️ You'll paste this into Web Service environment variables

2. **Password** (shown once)
   ➡️ Save securely
   ➡️ Can't be recovered if lost

3. **Host** for reference
   ```
   dpg-xxxxx.onrender.com
   ```

---

## AFTER DATABASE CREATION

### What happens automatically:
✓ Database created in Singapore
✓ Automatic daily backups enabled
✓ SSL certificates configured
✓ Accessible from your Web Service
✓ Port 5432 ready

### Typical setup time: 2-3 minutes

### Status check:
- Go to database dashboard
- Should show "Available" status
- Connection successful ✓

---

## NEXT STEP

After database is created:

1. ✓ Database created (you're here)
2. → Create Web Service (upload your ZIP)
3. → Add environment variables (paste DATABASE_URL)
4. → Deploy
5. → Migrate data from Supabase

---

## IF YOU WANT DATADOG MONITORING (Advanced - Optional)

Datadog is optional. Only use if:
- You have Datadog account
- You want advanced monitoring
- You have Datadog API key

For your initial setup: **Leave Datadog fields blank**

You can add monitoring later if needed.

---

## QUICK CHECKLIST

Before clicking "Create Database":
- [ ] Name: mauritius-game-db ✓
- [ ] Region: Singapore ✓ (IMPORTANT!)
- [ ] Database: mauritius_game (optional but recommended)
- [ ] User: game_user (optional but recommended)
- [ ] PostgreSQL Version: 18 ✓
- [ ] Datadog: Leave blank ✓

---

## ESTIMATED COST

PostgreSQL Standard Plan: **$15/month**
- 1GB storage included
- Automatic backups
- SSL encryption
- 99.9% uptime SLA

This is the pricing for your setup with the fields above.

---

## READY TO CREATE?

1. Go to https://render.com/dashboard
2. Click "+ New" → "PostgreSQL"
3. Fill in form above
4. Click "Create Database"
5. **WAIT 2-3 MINUTES for creation**
6. Save DATABASE_URL
7. Create Web Service (next step)

---

**Questions about any field?**

- **Name:** Just an identifier for you (can be anything)
- **Region:** MUST be Singapore (closest to Mauritius)
- **Database/User:** Auto-generated is fine, but names above are good
- **PostgreSQL Version:** 18 is latest & stable
- **Datadog:** Leave blank (advanced monitoring, not needed)

---

**Let's create the database! 🚀**
