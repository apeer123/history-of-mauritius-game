# MAURITIUS GAME - RENDER DEPLOYMENT CHECKLIST

## Pre-Deployment ✓

### Project Files
- [x] Dockerfile created
- [x] package.json ready
- [x] .env.render template created
- [x] RENDER_DEPLOYMENT.md guide created
- [ ] All dependencies in package.json

### Environment Variables Ready
Collect these BEFORE deployment:

**Database (from Render PostgreSQL):**
- [ ] DATABASE_URL: `postgres://game_user:PASSWORD@host:5432/mauritius_game`

**Supabase (current):**
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY

**OAuth - Google:**
- [ ] GOOGLE_CLIENT_ID
- [ ] GOOGLE_CLIENT_SECRET

**OAuth - Facebook:**
- [ ] FACEBOOK_APP_ID
- [ ] FACEBOOK_APP_SECRET

---

## Deployment Steps

### 1. Create Render Account
- [ ] Go to https://render.com
- [ ] Sign up / Login
- [ ] Verify email

### 2. Create PostgreSQL Database
- [ ] Click "+ New" → "PostgreSQL"
- [ ] Name: mauritius-game-db
- [ ] Database: mauritius_game
- [ ] User: game_user
- [ ] Region: Singapore
- [ ] Plan: Standard
- [ ] Copy DATABASE_URL

### 3. Create Web Service
- [ ] Click "+ New" → "Web Service"
- [ ] Select "Deploy from source code"
- [ ] Name: mauritius-game-app
- [ ] Environment: Node
- [ ] Region: Singapore
- [ ] Build Command: `npm run build`
- [ ] Start Command: `npm run start`
- [ ] Instance: Standard ($7/month)

### 4. Add Environment Variables
In Web Service → Environment, add:
- [ ] NODE_ENV = production
- [ ] DATABASE_URL = (from PostgreSQL)
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] GOOGLE_CLIENT_ID
- [ ] GOOGLE_CLIENT_SECRET
- [ ] FACEBOOK_APP_ID
- [ ] FACEBOOK_APP_SECRET
- [ ] NEXT_PUBLIC_API_URL = https://mauritius-game-app.onrender.com

### 5. Deploy
- [ ] Click "Deploy"
- [ ] Watch build logs
- [ ] Wait for "Build successful"
- [ ] Note your service URL

### 6. Migrate Database Schema
- [ ] Export schema from Supabase (SQL)
- [ ] Use Render PostgreSQL Browser to create tables
- [ ] Or use psql command to import

### 7. Test Deployment
- [ ] Visit your Render URL in browser
- [ ] Test login functionality
- [ ] Test game features
- [ ] Check database queries work

---

## Post-Deployment

### Domain Setup (Optional)
- [ ] Buy domain (Namecheap, Cloudflare, etc.)
- [ ] Add to Render Custom Domain
- [ ] Update OAuth redirect URLs

### Monitoring
- [ ] Set up Render alerts
- [ ] Monitor build logs
- [ ] Check error logs weekly

### Updates
To update in future:
1. [ ] Update code locally
2. [ ] Create ZIP of project
3. [ ] Upload to Render
4. [ ] Render redeploys automatically

---

## ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────┐
│        MAURITIUS USERS              │
└────────────────┬────────────────────┘
                 │
        (Singapore Region)
                 │
        ┌────────▼────────┐
        │   RENDER.COM    │
        ├─────────────────┤
        │ Web Service     │
        │ (Next.js App)   │ $7/month
        ├─────────────────┤
        │ PostgreSQL      │
        │ (Database)      │ $15/month
        └─────────────────┘
           
        Total: $22/month
        No GitHub needed!
        Unified platform ✓
        Fast for Mauritius ✓
```

---

## EXPECTED TIMELINE

1. Create Render account: **5 minutes**
2. Set up PostgreSQL: **5 minutes**
3. Create Web Service: **5 minutes**
4. Add env variables: **5 minutes**
5. Deploy: **5-10 minutes** (Render builds & deploys)
6. Database migration: **10-15 minutes**
7. Testing: **10 minutes**

**Total Time: 45-60 minutes**

---

## SUPPORT

If you get stuck:
1. Check Render build logs (detailed error messages)
2. Verify all environment variables are set
3. Check database connection: DATABASE_URL format
4. Check Node.js version compatibility

Render has 24/7 support at support@render.com

---

## FINAL RESULT

After completion:
✓ App running on Render
✓ Database on Render PostgreSQL
✓ Both in Singapore region (fast for Mauritius)
✓ No GitHub needed
✓ Single unified platform
✓ $22/month total cost
✓ Ready for production!

🎉 Your app is LIVE! 🎉
