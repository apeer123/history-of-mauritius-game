# Render Persistent Disk Setup for Image Storage

## Overview

Store image files on Render's persistent disk ($7/month add-on) while keeping database lightweight with just file path references.

## Architecture

```
User uploads image
    ↓
POST /api/upload-image-render
    ↓
Save file to: /var/data/question-images/[filename]
    ↓
Store file_path in database: question_images table
    ↓
Return URL: /api/images/[imageId]
    ↓
User requests image
    ↓
GET /api/images/[imageId]
    ↓
Read from persistent disk
    ↓
Return image to browser
```

## Step 1: Setup Local Development

Run the setup script:

```bash
node scripts/setup-render-disk-storage.mjs
```

This creates:
- `/var/data/question-images` directory
- `question_images` table in PostgreSQL

## Step 2: Configure Render Persistent Disk (Latest Render UI)

1. Go to **Render Dashboard** → Select your Web Service
2. In the left sidebar, click **Disks**
3. Click **+ Add Disk** button
4. Fill in the form:
   - **Name**: `question-images` (or any name)
   - **Mount Path**: `/var/data`
   - **Size**: `10 GB` (start here, can resize later)
5. Click **Create Disk**
6. Service will automatically redeploy with disk attached

**Cost**: $7/month per GB ($70/month for 10 GB)

**After creation:**
- Disk appears in "Disks" section
- Status should show "Attached"
- Wait for service to finish redeploying
- Files in `/var/data` will persist across redeployments

## Step 3: Add Environment Variable

In Render dashboard:
1. Go to your Web Service
2. Click **Environment**
3. Add new variable:
   - **Key**: `RENDER_DISK_PATH`
   - **Value**: `/var/data/question-images`
4. Click **Save Changes**

## Step 4: Deploy

The service will redeploy automatically after disk is created and environment variable is set.

```bash
git add .
git commit -m "feat: add Render persistent disk image storage"
git push origin main
```

## Step 5: Test Upload

1. Go to admin panel
2. Edit a question
3. Upload an image
4. Image should:
   - Save to `/var/data/question-images/` on Render
   - Store file path in database
   - Display correctly when question is viewed

## File Structure

```
/var/data/question-images/
├── question-1-1704067200000.jpg
├── question-2-1704067201000.png
├── question-3-1704067202000.webp
└── ...
```

## Database Schema

```sql
CREATE TABLE question_images (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  file_path VARCHAR(255) NOT NULL,        -- Full path on disk
  file_name VARCHAR(255) NOT NULL,        -- Original filename
  file_type VARCHAR(50) NOT NULL,         -- MIME type
  file_size INTEGER NOT NULL,             -- Bytes
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(question_id)
);
```

## API Endpoints

### Upload Image
```
POST /api/upload-image-render
Content-Type: multipart/form-data

file: [binary]
questionId: 5
```

**Response:**
```json
{
  "success": true,
  "url": "/api/images/42",
  "imageId": 42
}
```

### Get Image
```
GET /api/images/42
```

Returns image with proper Content-Type header.

### Delete Image
```
DELETE /api/upload-image-render?id=42
```

## Cost Breakdown

| Item | Cost |
|------|------|
| Web Service | Free (hobby tier) or $12+ (standard) |
| PostgreSQL | Included with service |
| Persistent Disk (10 GB) | $7/month |
| **Total** | **$7-19/month** |

## Advantages

✅ **Simple** - Just file paths in database
✅ **Fast** - Local disk I/O
✅ **Persistent** - Survives redeploys
✅ **No external dependencies** - Everything on Render
✅ **Cheap** - $7/month for unlimited images
✅ **Scalable** - Can expand disk up to 100GB

## Limitations

⚠️ **No CDN** - Images served from your app server
⚠️ **Single instance** - If using multiple dynos, disk is only on one
⚠️ **Backups needed** - Implement backup strategy for important images

## Backup Strategy

Consider scheduling periodic backups to Render Disk or Cloud Storage:

```bash
# Daily backup to tar.gz
tar -czf /backups/images-$(date +%Y%m%d).tar.gz /var/data/question-images/
```

## Troubleshooting

**"Permission denied" when saving files**
- Check directory exists and is writable
- Restart the Render service

**"Image not found" when retrieving**
- Verify file path in database matches actual file location
- Check disk has enough space

**Images disappear after redeploy**
- Persistent disk wasn't properly attached
- Verify mount path is `/var/data` not something else

## Future Improvements

When ready, can migrate to:
- **Cloudinary CDN** - Free tier with CDN
- **AWS S3** - If needing very large image library
- **Render Static Files** - For smaller images
