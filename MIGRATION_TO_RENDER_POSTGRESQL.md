# Full Migration Plan: Supabase → Render PostgreSQL (2026)

## Current Architecture Analysis
- **Next.js Version**: 15.5.4
- **PostgreSQL Version**: 15 (Render)
- **Supabase Status**: 
  - Authentication (JWT-based)
  - User profiles storage
  - Leaderboard data
  - Image storage (Supabase Storage)
- **Package Versions**:
  - `@supabase/ssr`: latest
  - `@supabase/supabase-js`: latest
  - `pg`: ^8.16.3 (already installed!)

## Migration Strategy Overview

### **3-Phase Approach (Recommended)**

#### **Phase 1: Database Migration** (2-3 hours)
- Export data from Supabase
- Create schemas in Render PostgreSQL
- Migrate all tables and data
- Test data integrity

#### **Phase 2: Authentication Migration** (3-4 hours)
- Replace Supabase Auth with NextAuth.js v5 (latest 2025)
- Implement PostgreSQL adapter for NextAuth
- Create auth session tables
- Test login/signup flows

#### **Phase 3: Image Storage Migration** (1-2 hours)
- Setup Render Disk Storage or AWS S3
- Migrate existing images
- Update API endpoints
- Test file uploads

---

## Detailed Implementation Steps

### PHASE 1: DATABASE MIGRATION

#### Step 1.1: Export Data from Supabase
```bash
# Connect to Supabase and export all tables as SQL
pg_dump -h "ji.supabase.co" \
  -U postgres \
  -d postgres \
  --schema public \
  > supabase_backup.sql
```

#### Step 1.2: Create Render PostgreSQL Database
- Already have `mauritius_game_db` in render.yaml
- Connection string will be provided by Render
- Internal URL format: `postgresql://game_user:PASSWORD@localhost:5432/mauritius_game`

#### Step 1.3: Migrate Schema and Data
```sql
-- Run existing scripts in Render PostgreSQL
-- scripts/01_create_schema.sql
-- scripts/02_insert_all_questions.sql
-- scripts/05_add_user_profiles_auth.sql
-- etc.
```

#### Step 1.4: Create NextAuth Tables
```sql
-- NextAuth.js v5 requires these tables:
CREATE TABLE accounts (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  providerAccountId VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type VARCHAR(255),
  scope VARCHAR(255),
  id_token TEXT,
  session_state VARCHAR(255),
  UNIQUE(provider, providerAccountId)
);

CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  sessionToken VARCHAR(255) UNIQUE NOT NULL,
  userId INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP NOT NULL
);

CREATE TABLE verification_tokens (
  identifier VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires TIMESTAMP NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Rename auth.users to users (if migrating from Supabase)
-- Or create new users table:
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  emailVerified TIMESTAMP,
  image TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### PHASE 2: AUTHENTICATION MIGRATION (NextAuth.js v5)

#### Step 2.1: Install NextAuth.js v5
```bash
npm install next-auth@latest @prisma/client @auth/pg-adapter
npm install -D @prisma/cli
```

#### Step 2.2: Create NextAuth Configuration
Create `lib/auth.ts`:
```typescript
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import { PgAdapter } from "@auth/pg-adapter"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PgAdapter(pool),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_APP_ID!,
      clientSecret: process.env.FACEBOOK_APP_SECRET!,
    }),
    Credentials({
      async authorize(credentials) {
        // Implement PostgreSQL user lookup
        const result = await pool.query(
          'SELECT * FROM users WHERE email = $1',
          [credentials.email]
        )
        
        if (!result.rows.length) return null
        
        // Verify password hash
        const user = result.rows[0]
        // Use bcrypt to compare credentials.password with user.password_hash
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  database: process.env.DATABASE_URL,
  session: {
    strategy: "database",
  },
})

export const metadata = {
  title: "NextAuth.js Example",
  description: "Simple example showcasing how to use NextAuth.js",
}
```

#### Step 2.3: Create Route Handler
Create `app/api/auth/[...nextauth]/route.ts`:
```typescript
import { handlers } from "@/lib/auth"
export const { GET, POST } = handlers
```

#### Step 2.4: Update Middleware
Replace `middleware.ts`:
```typescript
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const session = await auth()
  
  const publicRoutes = [
    "/auth/login",
    "/auth/sign-up",
    "/auth/callback",
    "/auth/sign-up-success"
  ]
  
  if (!session && !publicRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
```

#### Step 2.5: Update Session Provider
Create `components/providers.tsx`:
```typescript
"use client"

import { SessionProvider } from "next-auth/react"

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

Update `app/layout.tsx`:
```typescript
import { Providers } from "@/components/providers"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

#### Step 2.6: Update Login/Signup Pages
Replace Supabase calls with NextAuth:

Before:
```typescript
const supabase = createClient()
await supabase.auth.signInWithPassword({ email, password })
```

After:
```typescript
import { signIn } from "@/lib/auth"

await signIn("credentials", {
  email,
  password,
  redirectTo: "/",
})
```

---

### PHASE 3: IMAGE STORAGE MIGRATION

#### Option A: Render Disk Storage (Recommended for small apps)
```typescript
// lib/storage.ts
import fs from "fs/promises"
import path from "path"

const UPLOAD_DIR = "/var/data/uploads" // Render persistent disk

export async function uploadImage(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const filepath = path.join(UPLOAD_DIR, fileName)
  await fs.mkdir(UPLOAD_DIR, { recursive: true })
  await fs.writeFile(filepath, buffer)
  
  // Return public URL
  return `${process.env.NEXT_PUBLIC_API_URL}/uploads/${fileName}`
}

export async function deleteImage(fileName: string) {
  const filepath = path.join(UPLOAD_DIR, fileName)
  await fs.unlink(filepath)
}
```

#### Option B: AWS S3 (Better for scalability)
```typescript
// lib/s3-storage.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function uploadImage(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: `uploads/${fileName}`,
      Body: buffer,
      ContentType: "image/jpeg",
    })
  )
  
  return `https://${process.env.S3_BUCKET}.s3.amazonaws.com/uploads/${fileName}`
}
```

#### Step 3.2: Migrate Existing Images
```typescript
// scripts/migrate-images.ts
import { createClient } from "@supabase/supabase-js"
import { uploadImage } from "@/lib/storage"

async function migrateImages() {
  // Fetch all image URLs from questions
  const images = await db.query(
    "SELECT id, image_url FROM questions WHERE image_url IS NOT NULL"
  )
  
  for (const q of images.rows) {
    if (!q.image_url) continue
    
    // Download from Supabase
    const response = await fetch(q.image_url)
    const buffer = await response.arrayBuffer()
    
    // Upload to new storage
    const newUrl = await uploadImage(
      Buffer.from(buffer),
      `question-${q.id}.jpg`
    )
    
    // Update database
    await db.query(
      "UPDATE questions SET image_url = $1 WHERE id = $2",
      [newUrl, q.id]
    )
  }
}
```

---

## Environment Variables Setup

### render.yaml Update
```yaml
services:
  - type: web
    name: mauritius-game-app
    env: node
    plan: standard
    buildCommand: npm run build
    startCommand: npm run start
    healthCheckPath: /
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: mauritius-game-db
          property: connectionString
      - key: NEXTAUTH_URL
        value: https://your-app.onrender.com
      - key: NEXTAUTH_SECRET
        sync: false  # Set manually in Render Dashboard
      - key: GOOGLE_CLIENT_ID
        sync: false
      - key: GOOGLE_CLIENT_SECRET
        sync: false
      - key: FACEBOOK_APP_ID
        sync: false
      - key: FACEBOOK_APP_SECRET
        sync: false
    databases:
      - name: mauritius-game-db

  - type: pserv
    name: mauritius-game-db
    plan: standard
    postgresVersion: 15
```

### Local .env.local
```env
DATABASE_URL=postgresql://localhost:5432/mauritius_game
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-here
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret
FACEBOOK_APP_ID=your-facebook-id
FACEBOOK_APP_SECRET=your-facebook-secret
```

---

## Testing Checklist

- [ ] Database connection works
- [ ] All tables migrated successfully
- [ ] Data integrity verified (row counts match)
- [ ] User login with credentials
- [ ] Google OAuth login
- [ ] Facebook OAuth login
- [ ] Session persistence (close and reopen browser)
- [ ] Logout functionality
- [ ] Image upload works
- [ ] Old images are accessible
- [ ] Leaderboard displays correctly
- [ ] User profiles load
- [ ] Admin functions work

---

## Rollback Plan

If issues arise:
1. Keep Supabase running in parallel for 1 week
2. Database: Restore from Supabase backup
3. Auth: Revert to Supabase client code
4. Storage: Images remain accessible during migration

---

## Timeline Estimate
- **Total**: 6-9 hours
- **Can be done in phases over 3-4 days**
- **Minimal downtime with parallel running**

## Next Steps
1. Confirm you want to proceed with this plan
2. Create migration scripts
3. Set up NextAuth configuration
4. Test locally before deploying to Render
