# OAuth Setup Instructions

To enable Google and Facebook login, you need to configure OAuth providers in your Supabase project.

## Quick Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/zjziegyiscwdpnimjtgm/auth/providers
- **Google Cloud Console**: https://console.cloud.google.com/
- **Facebook Developers**: https://developers.facebook.com/

## Supabase Callback URL (Use this in both Google and Facebook)

```
https://zjziegyiscwdpnimjtgm.supabase.co/auth/v1/callback
```

---

## Google OAuth Setup

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure the OAuth consent screen first:
   - User Type: **External**
   - App name: `Mauritius Learning Hub`
   - User support email: Your email
   - Developer contact: Your email
   - Scopes: Add `email` and `profile`
6. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: `Mauritius Learning Hub`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `https://your-production-domain.com` (add later)
   - **Authorized redirect URIs**:
     - `https://zjziegyiscwdpnimjtgm.supabase.co/auth/v1/callback`
7. Copy the **Client ID** and **Client Secret**

### Step 2: Configure in Supabase

1. Go to [Supabase Auth Providers](https://supabase.com/dashboard/project/zjziegyiscwdpnimjtgm/auth/providers)
2. Find **Google** and click to expand
3. Toggle **Enable Sign in with Google** to ON
4. Paste your **Client ID** and **Client Secret**
5. Click **Save**

---

## Facebook OAuth Setup

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Select **Consumer** or **None** as app type
4. Enter app name: `Mauritius Learning Hub`
5. Once created, go to **Settings** → **Basic**
6. Copy your **App ID** and **App Secret**

### Step 2: Configure Facebook Login

1. In your Facebook App dashboard, click **Add Product**
2. Find **Facebook Login** and click **Set Up**
3. Choose **Web**
4. Go to **Facebook Login** → **Settings**
5. Add to **Valid OAuth Redirect URIs**:
   ```
   https://zjziegyiscwdpnimjtgm.supabase.co/auth/v1/callback
   ```
6. Enable:
   - Client OAuth Login: **Yes**
   - Web OAuth Login: **Yes**
   - Enforce HTTPS: **Yes**

### Step 3: Configure Permissions

1. Go to **App Review** → **Permissions and Features**
2. Ensure these are approved or in test mode:
   - `email` - To get user's email
   - `public_profile` - To get user's name and avatar

### Step 4: Configure in Supabase

1. Go to [Supabase Auth Providers](https://supabase.com/dashboard/project/zjziegyiscwdpnimjtgm/auth/providers)
2. Find **Facebook** and click to expand
3. Toggle **Enable Sign in with Facebook** to ON
4. Paste your **App ID** (as Client ID) and **App Secret** (as Client Secret)
5. Click **Save**

---

## Email/Password Setup (Already Configured)

Email authentication is enabled by default in Supabase. To customize:

1. Go to [Supabase Auth Settings](https://supabase.com/dashboard/project/zjziegyiscwdpnimjtgm/auth/templates)
2. Customize email templates for:
   - Confirmation email
   - Password reset email
   - Magic link email

### Email Confirmation Settings

1. Go to **Auth** → **Settings** → **Email Auth**
2. Configure:
   - **Enable email confirmations**: ON (recommended for production)
   - **Enable email confirmations**: OFF (for easier testing)

---

## Testing

After configuration:
1. Visit your app's login or sign-up page
2. Click "Continue with Google" or "Continue with Facebook"
3. Complete the OAuth flow
4. You should be redirected back to your app and logged in

## Notes

- Phone numbers are optional for OAuth users
- Full name will be extracted from OAuth provider data
- User profiles are automatically created for OAuth users
