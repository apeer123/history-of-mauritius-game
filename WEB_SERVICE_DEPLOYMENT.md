# WEB SERVICE DEPLOYMENT - STEP BY STEP

## You have: ✅ PostgreSQL Database Created

Now: Create Web Service and deploy your app!

---

## STEP 1: Click "+ New" → "Web Service"

On Render Dashboard:
```
[+ New] dropdown
└─ Web Service ← Click this
```

---

## STEP 2: Upload Your ZIP File

Screen shows options:
```
○ Connect a GitHub repository
○ Deploy from source code
├─ Connect Git repository
├─ Upload from computer ← CLICK THIS
```

Click: "Upload from computer"

Select file:
```
C:\Users\Abdallah Peerally\Desktop\his geo\history-of-mauritius-game v07012026\deploy\mauritius-game.zip
```

Wait for upload (~30 seconds)

---

## STEP 3: Configure Web Service

Form appears with fields:

### Fill in:

```
┌──────────────────────────────────┐
│ Name                             │
│ mauritius-game-app               │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ Environment                      │
│ [Node] ← Select this             │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ Region                           │
│ [Singapore] ← Select this ⭐     │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ Build Command                    │
│ npm run build                    │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ Start Command                    │
│ npm start                        │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ Instance Type                    │
│ [Standard] ← This is $7/month    │
└──────────────────────────────────┘
```

### Click: "Create Web Service"

---

## STEP 4: Web Service Created - Now Add Environment Variables

### New page opens showing your Web Service

Click: **Settings** (on top tabs)
```
[Build & Deploy] [Settings] [Logs]
```

On Settings page:
Click: **Environment**
```
Environment Variables section
```

---

## STEP 5: Add Environment Variables (8 Total)

Click: "Add Environment Variable" (blue button)

### Variable 1: DATABASE_URL ⭐ (MOST IMPORTANT)

```
Variable Name:  DATABASE_URL

Value: postgresql://game_user:BBItQd31Y4NwX2QbUaZ2FMgv1RlzfJrV@dpg-d60tkpur433s73boe6q0-a.singapore-postgres.render.com/mauritius_game

[Add]
```

### Variable 2: NODE_ENV

```
Variable Name:  NODE_ENV
Value:          production
[Add]
```

### Variable 3: NEXT_PUBLIC_SUPABASE_URL

```
Variable Name:  NEXT_PUBLIC_SUPABASE_URL
Value:          https://your-project.supabase.co
[Add]
```

Get this from: Your Supabase project settings

### Variable 4: NEXT_PUBLIC_SUPABASE_ANON_KEY

```
Variable Name:  NEXT_PUBLIC_SUPABASE_ANON_KEY
Value:          your-anon-key-here
[Add]
```

Get this from: Your Supabase project settings → API

### Variable 5: GOOGLE_CLIENT_ID

```
Variable Name:  GOOGLE_CLIENT_ID
Value:          your-google-client-id
[Add]
```

Get this from: Google Cloud Console → Credentials

### Variable 6: GOOGLE_CLIENT_SECRET

```
Variable Name:  GOOGLE_CLIENT_SECRET
Value:          your-google-client-secret
[Add]
```

Get this from: Google Cloud Console → Credentials

### Variable 7: FACEBOOK_APP_ID

```
Variable Name:  FACEBOOK_APP_ID
Value:          your-facebook-app-id
[Add]
```

Get this from: Facebook Developers → Your Apps

### Variable 8: FACEBOOK_APP_SECRET

```
Variable Name:  FACEBOOK_APP_SECRET
Value:          your-facebook-app-secret
[Add]
```

Get this from: Facebook Developers → Your Apps

---

## STEP 6: Save Changes

After adding all 8 variables:

Click: **"Save Changes"** (button at bottom)

Page refreshes. You see message:
```
"Environment variables updated"
```

---

## STEP 7: Trigger Deployment

### Two options:

**Option A: Automatic** (should happen automatically)
- Render automatically redeploys when you save variables

**Option B: Manual** (if needed)
- Click "Build & Deploy" tab
- Click "Manual Deploy" button

---

## STEP 8: Watch Build Logs

Click: "Build & Deploy" tab

You'll see live build logs:
```
⏳ Building...

Starting build of mauritius-game-app...
Installing dependencies...
Creating Next.js optimized production build...
Compiled successfully...

Build successful! ✓

Deploying...
Deployment complete! ✓

Your service is live!
```

**Wait for "Build successful" message** (5-10 minutes)

---

## STEP 9: Your App is Live! 🎉

Once build completes, you'll see:

```
Service URL:
https://mauritius-game-app.onrender.com
```

Click this URL to visit your app!

---

## TESTING YOUR APP

Visit: `https://mauritius-game-app.onrender.com`

Test these:
- [ ] Homepage loads
- [ ] Login works (Google/Facebook)
- [ ] Games are playable
- [ ] Leaderboard displays
- [ ] No console errors (F12)

---

## WHAT HAPPENS IF BUILD FAILS

Check build logs for error message.

Common errors:
```
"Cannot find module X"
→ Missing dependency in package.json

"DATABASE_URL not set"
→ Check environment variable added correctly

"Build timeout"
→ Try again, or contact Render support
```

Solutions:
1. Read error message carefully
2. Check all environment variables are correct
3. Verify DATABASE_URL is copied exactly
4. Ensure package.json is correct

---

## AFTER SUCCESSFUL DEPLOYMENT

Next steps:

1. ✅ Web Service deployed
2. → Migrate database from Supabase
3. → Update Supabase connection settings
4. → Test all features thoroughly
5. → Invite users to test

See: `DATABASE_MIGRATION.md` for data migration

---

## PROGRESS CHECKLIST

- [x] PostgreSQL created (Singapore)
- [x] DATABASE_URL obtained
- [ ] Web Service created
- [ ] ZIP file uploaded
- [ ] Environment variables added
- [ ] Build successful
- [ ] App accessible at Render URL
- [ ] Features tested
- [ ] Database migrated
- [ ] Ready for users

---

## COST SUMMARY

Your deployment:
- Web Service (Standard): $7/month
- PostgreSQL (Standard): $15/month
- **Total: $22/month**

No additional charges.

---

## YOU'RE ON THE FINAL STRETCH! 🚀

Steps remaining:
1. ← You are here: Create Web Service
2. Deploy Web Service (automatic with build)
3. Migrate database from Supabase
4. DONE - App is live!

---

**Ready to create Web Service? Go to Render dashboard now!**

**Reference:** DATABASE_CREDENTIALS.md (keep your DATABASE_URL safe)
