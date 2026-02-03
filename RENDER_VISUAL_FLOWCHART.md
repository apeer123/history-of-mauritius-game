# RENDER WEB SERVICE CREATION - VISUAL FLOWCHART

## Start: You're at Render Dashboard

```
https://render.com/dashboard
        │
        ↓
    Click "+ New"
        │
        ├─ Web Service ← SELECT THIS
        ├─ Static Site
        ├─ PostgreSQL
        ├─ Redis
        └─ Cron Job
```

---

## Step 1: Select Deployment Method

```
┌─────────────────────────────────────────┐
│ How do you want to deploy?              │
├─────────────────────────────────────────┤
│                                         │
│ ○ Connect a GitHub repository           │
│   (Skip this - no GitHub)               │
│                                         │
│ ○ Deploy from source code               │
│   └─ Upload from computer ← CLICK THIS  │
│                                         │
│ ○ Docker                                │
│   └─ Use our Dockerfile (advanced)      │
│                                         │
│ ○ Other providers                       │
│   (GitLab, Gitea, etc.)                 │
│                                         │
└─────────────────────────────────────────┘

YOUR CHOICE: "Upload from computer"
```

---

## Step 2: Upload ZIP File

```
┌─────────────────────────────────────────┐
│ Select file to upload                   │
├─────────────────────────────────────────┤
│                                         │
│ [Browse...] or drag-drop               │
│                                         │
│ Select:                                 │
│ deploy/mauritius-game.zip              │
│ (5.54 MB)                              │
│                                         │
│ [Upload] button                        │
│                                         │
│ ⏳ Uploading... (30 seconds)            │
│                                         │
└─────────────────────────────────────────┘
```

---

## Step 3: Configure Web Service

```
┌─────────────────────────────────────────┐
│ Web Service Configuration               │
├─────────────────────────────────────────┤
│                                         │
│ Name:                                   │
│ [mauritius-game-app____________]        │
│                                         │
│ Environment:                            │
│ [Node ▼]                               │
│                                         │
│ Region:                                 │
│ [Singapore ▼]                          │
│                                         │
│ Build Command:                          │
│ [npm run build__________________]       │
│                                         │
│ Start Command:                          │
│ [npm start___________________]          │
│                                         │
│ Instance Type:                          │
│ [Standard - $7/month ▼]                │
│                                         │
│ [Create Web Service] button             │
│                                         │
└─────────────────────────────────────────┘
```

---

## Step 4: Web Service Created!

```
✅ Web Service Created!

Service: mauritius-game-app
Region: Singapore
Status: Building...

Tabs:
[Build & Deploy] [Settings] [Logs] [Metrics]

Next: Add Environment Variables
```

---

## Step 5: Add Environment Variables

```
Click: [Settings] tab
        ↓
Click: [Environment] section
        ↓
Click: [Add Environment Variable] button
        ↓
Add 8 variables (one by one):

┌─────────────────────────────────────┐
│ Variable Name: DATABASE_URL         │
│ Value: postgresql://game_user:...   │
│ [Add]                               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Variable Name: NODE_ENV             │
│ Value: production                   │
│ [Add]                               │
└─────────────────────────────────────┘

(... repeat for 6 more variables)
        ↓
    [Save Changes]
```

---

## Step 6: Deploy!

```
Render automatically redeploys with variables
        ↓
⏳ Build in progress (5-10 minutes)
        ↓
Watch Build & Deploy logs:
├─ Installing dependencies ✓
├─ Building Next.js app ✓
├─ Creating production build ✓
├─ Optimizing bundle ✓
└─ Deployment successful ✓
        ↓
✅ APP IS LIVE!

Service URL: https://mauritius-game-app.onrender.com
```

---

## Quick Decision Tree

```
Are you seeing Git/GitHub options?
├─ YES → Scroll down or look for "Upload" button
└─ NO → Look for "Deploy from source code" → "Upload from computer"

Do you see "Upload from computer" option?
├─ YES → Click it! Upload your ZIP file
└─ NO → Click "Deploy from source code" first

Is there an "Existing Image" option?
├─ YES → That's Docker. Use ZIP upload instead (easier)
└─ NO → You're on the right page

Still confused?
└─ Take a screenshot and tell me what you see!
```

---

## Common Pitfalls to Avoid

❌ **Don't:**
- Select "Connect GitHub repository" (we don't have GitHub)
- Select "Existing Image" (that's Docker, not needed)
- Try to use Git Provider options
- Upload anything other than the ZIP file

✅ **Do:**
- Select "Upload from computer"
- Upload: deploy/mauritius-game.zip
- Configure the 6 settings
- Add 8 environment variables
- Click "Save Changes" and "Deploy"

---

## You've Got This! 🚀

Follow this flowchart step-by-step and you'll be done in 15 minutes!

**Next Step:** Take screenshot of what you see and confirm it matches Step 1 above.

**Or:** Just follow the visual flowchart exactly as shown and you can't go wrong!
