# Render Deployment - Environment Variables Setup

## Quick Deployment Steps

### 1. Generate NEXTAUTH_SECRET

Run this command in PowerShell to generate a secure random secret:

```powershell
# Windows PowerShell
$secret = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Random -Count 32 | ForEach-Object {[char]$_}) -join ''))
Write-Host $secret
```

Or use this simpler approach:

```powershell
# Alternative: Using openssl (if installed)
openssl rand -base64 32
```

**Save this value - you'll need it for Render**

---

### 2. Push render.yaml to GitHub

```bash
git add render.yaml
git commit -m "Update render.yaml with NextAuth environment variables"
git push origin main
```

---

### 3. Deploy on Render Dashboard

1. Go to https://render.com/dashboard
2. Click **"+ New"** → **"Web Service"**
3. Select **"Deploy from a Git repository"**
4. Choose **"GitHub"** and select `apeer123/history-of-mauritius-game`
5. Configuration will auto-fill from `render.yaml`
6. Click **"Advanced"** and fill in the secrets:
   - **NEXTAUTH_SECRET**: (paste the value from step 1)
   - **GOOGLE_CLIENT_ID**: Your Google OAuth ID
   - **GOOGLE_CLIENT_SECRET**: Your Google OAuth Secret
   - **FACEBOOK_APP_ID**: Your Facebook App ID
   - **FACEBOOK_APP_SECRET**: Your Facebook App Secret

7. Click **"Create Web Service"**

---

### 4. What Render Will Do Automatically

✅ Read `render.yaml`
✅ Create PostgreSQL 18 database (Singapore)
✅ Auto-link DATABASE_URL to web service
✅ Auto-set NEXTAUTH_URL from deployed URL
✅ Build your app: `npm run build`
✅ Start your app: `npm start`
✅ Health check on `/`

---

## Environment Variables Reference

| Variable | Type | Where to Get |
|----------|------|--------------|
| `NEXTAUTH_SECRET` | Secret | Generated above |
| `NEXTAUTH_URL` | Auto | From deployed URL |
| `DATABASE_URL` | Auto | From PostgreSQL service |
| `GOOGLE_CLIENT_ID` | Secret | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Secret | Google Cloud Console |
| `FACEBOOK_APP_ID` | Secret | Facebook Developers |
| `FACEBOOK_APP_SECRET` | Secret | Facebook Developers |

---

## OAuth Setup

### Google OAuth
1. Go to https://console.cloud.google.com
2. Create new project: "History of Mauritius Game"
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web Application)
5. Add authorized redirect URI: `https://your-app.onrender.com/api/auth/callback/google`
6. Copy Client ID and Client Secret

### Facebook OAuth
1. Go to https://developers.facebook.com
2. Create new app
3. Add Facebook Login product
4. Set authorized redirect URI: `https://your-app.onrender.com/api/auth/callback/facebook`
5. Copy App ID and App Secret

---

## Deployment Status Monitoring

Once deployed, check:
1. **Logs**: Render dashboard → Logs tab
2. **Health**: Render dashboard → Health tab
3. **Live App**: Click the deployed URL

### Common Issues & Fixes

**Issue**: `NEXTAUTH_SECRET not set`
- **Fix**: Add to Render environment variables

**Issue**: Database connection error
- **Fix**: Wait 2-3 minutes for PostgreSQL to fully initialize

**Issue**: OAuth callback fails
- **Fix**: Update OAuth redirect URIs to match your actual Render URL

---

## Verify Deployment

Once live, test these endpoints:

```bash
# Check home page
curl https://your-app.onrender.com

# Check login page
curl https://your-app.onrender.com/auth/login

# Check questions API
curl https://your-app.onrender.com/api/questions

# Check auth health
curl https://your-app.onrender.com/api/auth/session
```

---

## Next Steps

1. Deploy on Render
2. Test authentication flows
3. Test game questions loading
4. Test admin panel
5. Monitor logs for errors
