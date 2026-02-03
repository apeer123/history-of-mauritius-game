# QUICK START: RENDER DEPLOYMENT (5 MINUTES)

## What You Need

1. ✓ This project folder
2. ✓ Environment variables (see below)
3. ✓ Render.com account (free to create)

## Your Environment Variables

**Collect these before starting:**

```
DATABASE_URL=              (Render will provide)
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=  (Get from Supabase)
NEXT_PUBLIC_SUPABASE_ANON_KEY=  (Get from Supabase)
GOOGLE_CLIENT_ID=          (Get from Google Cloud)
GOOGLE_CLIENT_SECRET=      (Get from Google Cloud)
FACEBOOK_APP_ID=           (Get from Facebook Dev)
FACEBOOK_APP_SECRET=       (Get from Facebook Dev)
NEXT_PUBLIC_API_URL=https://mauritius-game-app.onrender.com
```

---

## 3-STEP DEPLOYMENT

### STEP 1: Create Render Account
- Go to https://render.com
- Click "Sign Up"
- Use email or GitHub
- Verify email
- **Time: 2 minutes**

### STEP 2: Create PostgreSQL Database
```
Render Dashboard → "+ New" → "PostgreSQL"

Name: mauritius-game-db
Database: mauritius_game
User: game_user
Region: Singapore ⭐
Plan: Standard ($15/month)

Click "Create Database"
Save the DATABASE_URL it shows you!
```
**Time: 3 minutes**

### STEP 3: Create Web Service & Deploy
```
Render Dashboard → "+ New" → "Web Service"

Upload this project folder as ZIP
Name: mauritius-game-app
Environment: Node
Region: Singapore ⭐
Build: npm run build
Start: npm run start
Plan: Standard ($7/month)

Add Environment Variables (from list above)
Click "Deploy"
Wait for "Build successful"
```
**Time: 15 minutes**

---

## DONE! 🎉

Your app is now live at:
```
https://mauritius-game-app.onrender.com
```

**Total cost: $22/month**
**All on same platform: ✓ Unified**
**Fast for Mauritius: ✓ Singapore region**

---

## If Something Goes Wrong

1. **Check build logs** - Click your service, view "Build" tab
2. **Check environment variables** - Must be exact
3. **Check database** - Make sure PostgreSQL is running
4. **Ask Render support** - support@render.com

---

## FUTURE UPDATES

When you update your code:
1. Modify code locally
2. Create new ZIP
3. Upload to Render
4. Click "Deploy"
5. Done! (Render rebuilds automatically)

---

## COMPARISON: WHY RENDER?

| Feature | Render | Vercel+Supabase | AWS |
|---------|--------|---|---|
| Cost | $22/month | $50+/month | $50-200/month |
| Setup time | 20 min | 30 min | 2+ hours |
| Single platform | ✓ YES | ❌ NO | ✓ YES |
| Speed for Mauritius | ✓ FAST | ❌ SLOW | ✓ FAST |
| Complexity | ✓ SIMPLE | 🟡 MEDIUM | ❌ COMPLEX |

**Render is the BEST choice for you!**
