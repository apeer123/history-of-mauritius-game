# ⚡ WEB SERVICE SETUP - QUICK REFERENCE (YOUR CREDENTIALS)

## Your DATABASE_URL (COPY THIS!)

```
postgresql://game_user:BBItQd31Y4NwX2QbUaZ2FMgv1RlzfJrV@dpg-d60tkpur433s73boe6q0-a.singapore-postgres.render.com/mauritius_game
```

---

## 8 Environment Variables to Add

Copy-paste each into Render Web Service:

### 1. DATABASE_URL (CRITICAL!)
```
DATABASE_URL
│
postgresql://game_user:BBItQd31Y4NwX2QbUaZ2FMgv1RlzfJrV@dpg-d60tkpur433s73boe6q0-a.singapore-postgres.render.com/mauritius_game
```

### 2. NODE_ENV
```
NODE_ENV
│
production
```

### 3. NEXT_PUBLIC_SUPABASE_URL
```
NEXT_PUBLIC_SUPABASE_URL
│
https://your-project.supabase.co
```
(Get from Supabase project settings)

### 4. NEXT_PUBLIC_SUPABASE_ANON_KEY
```
NEXT_PUBLIC_SUPABASE_ANON_KEY
│
your-anon-key
```
(Get from Supabase API settings)

### 5. GOOGLE_CLIENT_ID
```
GOOGLE_CLIENT_ID
│
your-google-id
```
(Get from Google Cloud Console)

### 6. GOOGLE_CLIENT_SECRET
```
GOOGLE_CLIENT_SECRET
│
your-google-secret
```
(Get from Google Cloud Console)

### 7. FACEBOOK_APP_ID
```
FACEBOOK_APP_ID
│
your-facebook-id
```
(Get from Facebook Developers)

### 8. FACEBOOK_APP_SECRET
```
FACEBOOK_APP_SECRET
│
your-facebook-secret
```
(Get from Facebook Developers)

---

## Web Service Configuration

```
Name:                mauritius-game-app
Environment:         Node
Region:              Singapore ⭐
Build Command:       npm run build
Start Command:       npm start
Instance Type:       Standard ($7/month)
```

---

## 3-Step Deployment

### Step 1: Upload ZIP
- Go: Render Dashboard
- Click: "+ New" → "Web Service"
- Upload: `deploy/mauritius-game.zip`

### Step 2: Configure
- Name: mauritius-game-app
- Environment: Node
- Region: Singapore
- Build: npm run build
- Start: npm start
- Click: "Create Web Service"

### Step 3: Add Variables
- Settings → Environment
- Add 8 variables (above)
- Click: "Save Changes"
- Wait for build (5-10 min)

---

## Your App URL

After deployment:
```
https://mauritius-game-app.onrender.com
```

---

## Database Connection Details (Backup)

```
Hostname: dpg-d60tkpur433s73boe6q0-a
Port: 5432
Database: mauritius_game
Username: game_user
Password: BBItQd31Y4NwX2QbUaZ2FMgv1RlzfJrV
```

---

## Progress

```
✅ PostgreSQL created
→ Web Service (you are here)
→ Database migration
→ LIVE!
```

---

**Ready to create Web Service? You have all the info!** 🚀
