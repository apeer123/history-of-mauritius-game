# RENDER POSTGRESQL - QUICK REFERENCE CARD

## COPY-PASTE VALUES FOR POSTGRES CREATION

When you see Render form, fill in:

```
┌─────────────────────────────────────────┐
│ FIELD               │ VALUE               │
├─────────────────────────────────────────┤
│ Name                │ mauritius-game-db   │
│ Database            │ mauritius_game      │
│ User                │ game_user           │
│ Region              │ Singapore ⭐        │
│ PostgreSQL Version  │ 18                  │
│ Datadog API Key     │ [Leave blank]       │
│ Datadog Region      │ [Leave blank]       │
└─────────────────────────────────────────┘
```

---

## REGION SELECTION - CRITICAL!

**CLICK:** Singapore ⭐ (Only choice for Mauritius)

**NOT these:**
- Virginia (US) ❌
- Oregon (US) ❌
- Frankfurt (Europe) ❌
- London (Europe) ❌

**Why:** Singapore is 3,500 km from Mauritius
All others are 5,000+ km away

---

## AFTER CREATION - SAVE THESE

You'll see this info (example):

```
Host: dpg-abc123xyz.onrender.com
Port: 5432
Database: mauritius_game
User: game_user
Password: MySecurePassword123

DATABASE_URL:
postgres://game_user:MySecurePassword123@dpg-abc123xyz.onrender.com:5432/mauritius_game
```

**SAVE THE DATABASE_URL** - you'll paste this into Web Service!

---

## 4-STEP PROCESS

1. Click "+ New" → "PostgreSQL"
2. Fill in form (values above)
3. Select Region: Singapore
4. Click "Create Database"
5. Wait 2-3 minutes
6. Save DATABASE_URL
7. Done!

---

## COST

PostgreSQL Standard: **$15/month**
- 1 GB storage
- Automatic backups
- SSL certificates
- 99.9% uptime

---

## NEXT: WEB SERVICE

After database is created:

1. ✓ Database ready
2. → Create Web Service (your app)
3. → Add DATABASE_URL to environment
4. → Deploy

---

**[Click here for detailed guide: RENDER_POSTGRES_CREATION_GUIDE.md]**
