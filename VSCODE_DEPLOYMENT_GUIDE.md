# DEPLOY FROM VS CODE - COMPLETE GUIDE

## ✓ Your Deployment Package is Ready!

ZIP File Created: `deploy/mauritius-game.zip` (5.5 MB)

---

## HOW TO DEPLOY IN 5 STEPS

### Step 1: Create Render Account
- Go to https://render.com
- Sign up (or login)
- Verify email

### Step 2: Create PostgreSQL Database
- Dashboard → "+ New" → "PostgreSQL"
- Name: `mauritius-game-db`
- Database: `mauritius_game`
- User: `game_user`
- **Region: Singapore** ⭐
- Plan: Standard
- Click "Create Database"
- **Copy the DATABASE_URL** (you'll need this)

### Step 3: Upload ZIP to Render
- Render Dashboard → "+ New" → "Web Service"
- Click "Deploy from source code"
- Click "Upload from computer"
- Navigate to: `deploy/mauritius-game.zip`
- Click "Upload"

### Step 4: Configure Web Service
```
Name: mauritius-game-app
Environment: Node
Region: Singapore
Build Command: npm run build
Start Command: npm start
Instance Type: Standard ($7/month)
```
- Click "Create Web Service"

### Step 5: Add Environment Variables
Go to your Web Service settings → Environment
Add these variables:

```
NODE_ENV=production
DATABASE_URL=<paste from PostgreSQL database>
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
GOOGLE_CLIENT_ID=your-id
GOOGLE_CLIENT_SECRET=your-secret
FACEBOOK_APP_ID=your-id
FACEBOOK_APP_SECRET=your-secret
NEXT_PUBLIC_API_URL=https://mauritius-game-app.onrender.com
```

- Click "Save Changes"
- Click "Deploy"

---

## WHAT HAPPENS NEXT

1. **Build Starts** - Watch the build logs in real-time (5-10 minutes)
2. **Deployment** - Render deploys your app
3. **Live** - Your app is accessible at unique Render URL
4. **Next**: Migrate database from Supabase to Render PostgreSQL

---

## AFTER DEPLOYMENT: DATABASE MIGRATION

See `DATABASE_MIGRATION.md` for detailed instructions on migrating your database from Supabase to Render PostgreSQL.

Quick steps:
1. Export your Supabase database schema
2. Create tables in Render PostgreSQL
3. Copy data from Supabase to Render
4. Update connection strings
5. Done!

---

## MONITORING YOUR DEPLOYMENT

After clicking "Deploy":

1. Go to your Web Service dashboard
2. Click "Build & Deploy" tab
3. Watch the build logs in real-time
4. Look for:
   - ✓ "Build successful"
   - ✓ "Deployment successful"
5. Service URL appears at the top of the page

**Typical build time: 5-10 minutes**

---

## TESTING YOUR APP

Once deployed:

1. Visit your Render URL
2. Test the homepage
3. Try logging in (with Google or Facebook)
4. Play a game
5. Check leaderboard

If everything works → Congratulations! 🎉

---

## TROUBLESHOOTING

### "Build failed" errors
1. Check build logs for specific error
2. Verify all dependencies are in package.json
3. Ensure DATABASE_URL is correct
4. Check environment variables are set

### "Cannot connect to database"
1. Wait 2-3 minutes after database creation
2. Verify DATABASE_URL format
3. Check SSL setting: `?sslmode=require`
4. Test connection from Render dashboard

### App runs but pages are blank
1. Check browser console (F12)
2. Check Render app logs
3. Verify all environment variables are set
4. Check next.config.mjs is correct

### Still having issues?
- Check Render documentation: https://render.com/docs
- Contact Render support: support@render.com

---

## COST BREAKDOWN

```
Web Service (Node): $7/month
PostgreSQL (Standard): $15/month
─────────────────────────────
Total: $22/month (All-inclusive)
```

Everything is on Render in Singapore region (fast for Mauritius!)

---

## UPDATING YOUR APP

To update your app with new code:

1. Make changes locally in VS Code
2. In VS Code terminal, run:
   ```powershell
   Compress-Archive -Path app, components, hooks, lib -DestinationPath 'deploy\mauritius-game-update.zip' -Force
   ```
3. Go to Render dashboard
4. Upload new ZIP
5. Render redeploys automatically

Takes ~5 minutes each time.

---

## NEXT STEPS

1. ✓ ZIP file created
2. → Create Render account (2 min)
3. → Create PostgreSQL database (3 min)
4. → Upload ZIP (2 min)
5. → Configure & deploy (5 min)
6. → Migrate database (10 min)
7. → Test app (5 min)

**Total: ~30 minutes from now**

---

## FILE LOCATIONS

ZIP File: `c:\Users\Abdallah Peerally\Desktop\his geo\history-of-mauritius-game v07012026\deploy\mauritius-game.zip`

Size: 5.5 MB

Ready to upload to Render!

---

## QUICK COMMANDS FOR VS CODE

To recreate ZIP anytime (in VS Code Terminal):
```powershell
Compress-Archive -Path app, components, hooks, lib, public, scripts, styles, Dockerfile, package.json, pnpm-lock.yaml, render.yaml, tsconfig.json, next.config.mjs, middleware.ts, '.env.render', '.gitignore' -DestinationPath 'deploy\mauritius-game.zip' -Force
```

---

**Ready? Go to https://render.com/dashboard and start deploying! 🚀**
