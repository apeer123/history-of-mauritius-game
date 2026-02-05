# RENDER DEPLOYMENT - FINAL STEPS

## What's Ready ✅

- ✅ Code on GitHub (commit 1861995)
- ✅ PostgreSQL database created on Render
- ✅ Database schema initialized
- ✅ render.yaml configured with all settings
- ✅ Environment variables defined

## Deploy Web Service in 3 Steps

### Step 1: Create Web Service on Render

Go to: https://render.com/dashboard

1. Click **"+ New"** → **"Web Service"**
2. Click **"Connect repository"**
3. Select **"apeer123/history-of-mauritius-game"**
4. Click **"Connect"**

### Step 2: Auto-Configuration

Render will automatically:
- Read `render.yaml`
- Link to your PostgreSQL database
- Set build & start commands
- Set most environment variables

You'll see a form auto-filled with:
```
Name:              mauritius-game-app
Environment:       Node
Region:            Singapore
Build Command:     npm run build
Start Command:     npm start
Instance Type:     Standard ($7/month)
```

### Step 3: Add Secrets Only

Under **"Advanced"**, scroll to **"Environment Variables"**

**Only these 5 need MANUAL entry** (DATABASE_URL is auto-linked):

```
NEXTAUTH_SECRET        = (generate: openssl rand -base64 32)
GOOGLE_CLIENT_ID       = (from Google OAuth)
GOOGLE_CLIENT_SECRET   = (from Google OAuth)
FACEBOOK_APP_ID        = (from Facebook OAuth)
FACEBOOK_APP_SECRET    = (from Facebook OAuth)
```

**If you don't have OAuth credentials yet, you can:**
- Skip them now
- Add later in Settings
- Use Email-only auth initially

### Step 4: Deploy

Click **"Create Web Service"**

⏳ Render will:
1. Clone your GitHub repo
2. Install dependencies (npm install)
3. Build app (npm run build)
4. Start service (npm start)
5. Create live URL

Expected build time: 2-3 minutes

---

## Verify Deployment

Once deployed, check:

1. **Home page** - https://your-app-name.onrender.com
2. **Auth page** - https://your-app-name.onrender.com/auth/login
3. **Questions API** - https://your-app-name.onrender.com/api/questions
4. **Logs** - Render dashboard → Logs tab

### Expected Working:
- ✓ Home page loads
- ✓ Login/signup pages load
- ✓ Database connects (check logs)
- ✓ Questions API returns data

### May not work yet:
- ✗ OAuth login (needs credentials)
- ✗ Admin panel (add later)

---

## If Build Fails

Check Render logs for:
- `npm install` errors → Package mismatch
- `npm run build` errors → TypeScript issues
- Database connection errors → Check DATABASE_URL

---

## After Deployment

1. **Test email login** (credentials provider)
2. **Set up Google OAuth** (optional)
3. **Set up Facebook OAuth** (optional)
4. **Update NEXTAUTH_URL** (from Render URL)
5. **Monitor logs** for errors

---

## Quick Reference

| What | Value |
|------|-------|
| Deployed URL | https://mauritius-game-app.onrender.com |
| Database | Connected automatically |
| Build time | ~2-3 minutes |
| Downtime | First deploy takes time, future deploys are faster |
| Auto-redeploy | Yes, on git push to main |
