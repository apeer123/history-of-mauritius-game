# Deploy PostgreSQL Database to Render Only

Follow these exact steps to create the PostgreSQL database on Render.

---

## Step 1: Go to Render Dashboard

Navigate to: https://render.com/dashboard

---

## Step 2: Create PostgreSQL Database

1. Click **"+ New"** button (top left)
2. Select **"PostgreSQL"** from the menu

---

## Step 3: Configure Database

Fill in the form with EXACTLY these values:

```
Name:                 mauritius-game-db
Database:             mauritius_game
User:                 game_user
Region:               Singapore ⭐ (IMPORTANT!)
PostgreSQL Version:   18
Datadog API Key:      (leave blank)
Datadog Region:       (leave blank)
```

Click **"Create Database"**

---

## Step 4: Wait for Database Creation

⏳ Status will show "Creating..." (2-3 minutes)

Once ready, you'll see:
- ✅ Status: "Available"
- 🔑 Internal Database URL
- 🌐 External Database URL

---

## Step 5: Copy Connection Strings

Once the database is created, Render will show:

### Internal URL (for web service on Render)
```
postgresql://game_user:[PASSWORD]@[HOSTNAME]/mauritius_game
```

### External URL (for local testing)
```
postgresql://game_user:[PASSWORD]@[HOSTNAME].render.com:5432/mauritius_game
```

**Save both URLs!** You'll need them soon.

---

## Step 6: Initialize Database Schema

Once the database is created and you have the external URL:

1. Update your `.env.local` file with the external URL:
   ```
   DATABASE_URL_EXTERNAL=postgresql://game_user:[PASSWORD]@[HOSTNAME].render.com:5432/mauritius_game
   ```

2. Run the schema migration from your local machine:
   ```bash
   node scripts/create-questions-schema.mjs
   ```

   You should see:
   ```
   ✓ subjects table created
   ✓ levels table created
   ✓ question_types table created
   ✓ questions table created
   ✓ mcq_options table created
   ✓ matching_pairs table created
   ✓ fill_answers table created
   ✓ reorder_items table created
   ✓ truefalse_answers table created
   ✓ Index on questions(subject_id, level_id) created
   ✓ Index on questions(question_type_id) created
   ✨ Questions schema created successfully!
   ```

---

## Step 7: Verify Database

In Render dashboard, click on your database and:
1. Click **"Browser"** tab
2. Check tables exist:
   - `subjects`
   - `levels`
   - `question_types`
   - `questions`
   - `mcq_options`
   - `matching_pairs`
   - `fill_answers`
   - `reorder_items`
   - `truefalse_answers`

✅ Database is ready!

---

## Next: Deploy Web Service

Once the database is created, you can deploy the web service. The render.yaml will automatically:
- See the PostgreSQL service exists
- Link it to the web service
- Set DATABASE_URL environment variable

Then just add the OAuth secrets when deploying the web service.

---

## Troubleshooting

**Issue**: "Connection refused" when running schema migration
- **Fix**: Make sure you're using the EXTERNAL URL, not internal
- The external URL has `.render.com` in it

**Issue**: Database takes >5 minutes to create
- **Fix**: This is normal for Singapore region. Keep waiting.

**Issue**: Can't see the database in Render
- **Fix**: Refresh the page. Sometimes takes a moment to appear.

---

## Quick Reference

| Item | Value |
|------|-------|
| Region | Singapore |
| Version | PostgreSQL 18 |
| User | game_user |
| Database | mauritius_game |
| Plan | Standard ($15/month) |
