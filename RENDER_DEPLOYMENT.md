# RENDER DIRECT DEPLOYMENT GUIDE

## Step 1: Prepare Project Files ✓
- ✓ `Dockerfile` created
- ✓ `package.json` ready
- ✓ `.env.render` template created

## Step 2: Create Web Service on Render

### In Render Dashboard:

1. Click **"+ New"** → **"Web Service"**
2. Select **"Deploy from Dockerfile"** (since no GitHub)
3. Configure:
   ```
   Name: mauritius-game-app
   Runtime: Docker
   Region: Singapore (for Mauritius users)
   Branch: main (not needed, but shows in UI)
   Build Command: (Leave empty - Dockerfile handles this)
   Start Command: (Leave empty - Dockerfile handles this)
   ```

### Option A: Deploy using ZIP (Easiest)

1. Zip your entire project folder
2. In Render, select **"Upload a Docker build"**
3. Upload the ZIP file
4. Render will build and deploy

### Option B: Deploy using Native Buildpacks (Recommended)

1. In Render, click **"+ New"** → **"Web Service"**
2. Select **"Deploy from source code"**
3. Select **"Enter URL"** (paste this):
   ```
   https://github.com/render-examples/next-js
   ```
4. Change these settings:
   ```
   Name: mauritius-game-app
   Environment: Node
   Region: Singapore
   Build Command: npm run build
   Start Command: npm run start
   Instance Type: Standard ($7/month)
   ```

## Step 3: Add Environment Variables

In your Web Service settings → **Environment**:

Add these variables:

```
NODE_ENV = production

DATABASE_URL = (Paste from PostgreSQL dashboard)
Example: postgres://game_user:xxxxx@dpg-xxx.onrender.com:5432/mauritius_game

NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-key

GOOGLE_CLIENT_ID = your-id
GOOGLE_CLIENT_SECRET = your-secret
FACEBOOK_APP_ID = your-id
FACEBOOK_APP_SECRET = your-secret

NEXT_PUBLIC_API_URL = https://mauritius-game-app.onrender.com
```

## Step 4: Deploy Database Schema

After deployment, migrate your Supabase schema to Render PostgreSQL.

### Option A: Using psql command (if you have PostgreSQL installed)

```powershell
# Export from Supabase
$env:PGPASSWORD = "your-supabase-password"
pg_dump -h zjziegyiscwdpnimjtgm.supabase.co -U postgres -d postgres > backup.sql

# Import to Render
$env:PGPASSWORD = "your-render-password"
psql -h dpg-xxxxx.onrender.com -U game_user -d mauritius_game < backup.sql
```

### Option B: Using Render PostgreSQL Browser (Easiest)

1. Go to your Render PostgreSQL database
2. Click **"Browser"** tab
3. Manually create tables using your SQL schema
4. Or paste entire schema from Supabase

## Step 5: Verify Deployment

1. Render will show build logs in real-time
2. Watch for "Build successful" message
3. Service URL appears at top: `https://mauritius-game-app.onrender.com`
4. Test the URL in your browser
5. Your app is now LIVE! 🎉

## Step 6: Add Your Domain (Optional)

1. In Web Service settings → **Custom Domain**
2. Add your domain name
3. Follow DNS setup instructions

## Troubleshooting

### If deployment fails:
1. Check build logs in Render dashboard
2. Verify all environment variables are set
3. Check Dockerfile syntax
4. Ensure package.json has all dependencies

### If database connection fails:
1. Verify DATABASE_URL is correct
2. Check database is running (PostgreSQL dashboard)
3. Verify SSL connections: Render requires SSL for databases

### If app runs but shows errors:
1. Check application logs in Render
2. Verify environment variables are correct
3. Check that schema was migrated to Render PostgreSQL

## Next Steps

After successful deployment:

1. ✓ App running on Render
2. ✓ Database on Render PostgreSQL
3. ✓ All on Singapore region (fast for Mauritius)
4. ✓ No GitHub needed!

## Cost Summary

- Web Service: $7/month (Standard instance)
- PostgreSQL: $15/month (Standard plan)
- **Total: $22/month** (all-inclusive, unified platform)

This is much cheaper and simpler than AWS!
