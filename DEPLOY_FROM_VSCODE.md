# HOW TO DEPLOY FROM VS CODE TERMINAL

## Method 1: Run PowerShell Script (EASIEST)

### Step 1: Open Terminal in VS Code
```
Ctrl + ` (backtick)
```

### Step 2: Run the deployment script
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser
.\deploy-to-render.ps1
```

The script will:
1. Create a `deploy` folder
2. Create `mauritius-game-deploy.zip`
3. Display the file location
4. Show deployment instructions

### Step 3: Upload ZIP to Render
1. Go to https://render.com/dashboard
2. Click "+ New" → "Web Service"
3. Select "Upload from computer"
4. Choose the ZIP file from `deploy/mauritius-game-deploy.zip`
5. Configure and deploy

**Time:** 5 minutes

---

## Method 2: Manual ZIP Creation

If the script has issues, create ZIP manually:

### Option A: Windows Built-in
```powershell
# In VS Code Terminal:
cd "c:\Users\Abdallah Peerally\Desktop\his geo\history-of-mauritius-game v07012026"

# Create ZIP
Compress-Archive -Path app, components, hooks, lib, public, scripts, styles, Dockerfile, package.json, pnpm-lock.yaml, render.yaml, tsconfig.json, next.config.mjs, middleware.ts -DestinationPath "deploy/app.zip"
```

### Option B: Using 7-Zip (if installed)
```powershell
# In VS Code Terminal:
7z a -r "deploy/app.zip" app components hooks lib public scripts styles Dockerfile package.json pnpm-lock.yaml render.yaml
```

---

## Method 3: Docker Build & Deploy

If you want more control:

```powershell
# In VS Code Terminal:
cd "c:\Users\Abdallah Peerally\Desktop\his geo\history-of-mauritius-game v07012026"

# Build Docker image
docker build -t mauritius-game .

# Tag for Render
docker tag mauritius-game render-registry/mauritius-game:latest

# Push (requires Render authentication)
docker push render-registry/mauritius-game:latest
```

---

## Method 4: Render CLI (Advanced)

If you install Render CLI:

```powershell
# Install Render CLI
npm install -g @render-api/cli

# Authenticate
render login

# Deploy
render deploy --name mauritius-game-app --environment production
```

---

## RECOMMENDED FLOW (5 MINUTES)

### Step 1: Open VS Code Terminal
Press `Ctrl + ` in VS Code

### Step 2: Run this command
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser -Force; .\deploy-to-render.ps1
```

### Step 3: Wait for completion
The script creates ZIP file and shows deployment URL

### Step 4: Upload to Render
Copy the ZIP file path and upload to Render dashboard

### Step 5: Done!
Render deploys automatically

---

## TROUBLESHOOTING

### "Script execution disabled" error
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser
```

### "Compress-Archive not found" error
Use Windows File Explorer to create ZIP manually:
1. Select all files
2. Right-click → Send to → Compressed folder
3. Upload to Render

### ZIP file too large
The ZIP might include node_modules. Don't worry - Render reinstalls them.

---

## WHAT HAPPENS WHEN YOU UPLOAD

1. ✓ Render extracts ZIP
2. ✓ Installs dependencies (`npm install`)
3. ✓ Builds app (`npm run build`)
4. ✓ Starts server (`npm start`)
5. ✓ App is LIVE!

Typical build time: 5-10 minutes

---

## MONITORING BUILD PROGRESS

After uploading to Render:

1. Go to your Web Service dashboard
2. Click "Build & Deploy" tab
3. Watch real-time logs
4. See "Build successful" message
5. Service URL appears at top

---

## FUTURE DEPLOYMENTS

To update your app later:

1. Make code changes locally
2. Run: `.\deploy-to-render.ps1`
3. New ZIP created
4. Upload to Render
5. Automatic redeploy

Takes ~5 minutes each time

---

## NEXT STEPS

1. **Open VS Code Terminal** (Ctrl + `)
2. **Run:** `.\deploy-to-render.ps1`
3. **Wait** for ZIP creation
4. **Copy** the ZIP file path
5. **Go to** https://render.com/dashboard
6. **Upload** the ZIP file
7. **Deploy!**

**Total time: 15 minutes**
