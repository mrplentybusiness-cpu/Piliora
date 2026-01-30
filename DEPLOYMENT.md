# PILIORA Deployment Guide

## Tech Stack (Important)

This project uses:
- **Frontend**: React 18 + Vite (NOT Next.js)
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL with Drizzle ORM (NOT Prisma)
- **Image Storage**: Cloudinary
- **Authentication**: Simple admin auth (NOT NextAuth)

## Railway Deployment

### Prerequisites
1. A Railway account (https://railway.app)
2. A PostgreSQL database (Railway provides one-click provisioning)
3. A Cloudinary account for image uploads (https://cloudinary.com)

### Environment Variables (Copy These to Railway)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret | Yes |
| `NODE_ENV` | Set to `production` | Yes |
| `PORT` | Server port (Railway sets this automatically) | No |

### Deployment Steps

1. **Create a new Railway project**
   - Connect your GitHub repository
   - Railway will auto-detect the Node.js project

2. **Add PostgreSQL**
   - Click "New" > "Database" > "PostgreSQL"
   - The `DATABASE_URL` will be automatically linked

3. **Configure Build Settings**
   - Go to your service's "Settings" tab
   - Set Build Command: `npm run db:push && npm run build`
   - Set Start Command: `npm run start`

4. **Configure Environment Variables**
   - Go to your service's "Variables" tab
   - Add Cloudinary credentials (see table above)
   - Set `NODE_ENV=production`

5. **Deploy**
   - Railway will automatically build and deploy on push
   - Database tables are created during build (`db:push`)
   - Default content is seeded on first startup

### Database Schema

Two tables are created automatically:
- `users` - Stores admin credentials
- `settings` - Stores all site content as JSON

Default admin credentials (change immediately after first login):
- Username: `PilioraAdmin`
- Password: `Piliora123`

### Build Commands Reference

```bash
# Install dependencies
npm install

# Create database tables
npm run db:push

# Build for production  
npm run build

# Start production server
npm run start
```

### Cloudinary Setup

1. Sign up at https://cloudinary.com
2. Go to Dashboard > Settings > API Keys
3. Copy these values to Railway environment variables:
   - Cloud Name → `CLOUDINARY_CLOUD_NAME`
   - API Key → `CLOUDINARY_API_KEY`
   - API Secret → `CLOUDINARY_API_SECRET`

### Troubleshooting

**Site shows empty content**
- The site auto-seeds default content on first startup
- Check that `DATABASE_URL` is correctly set
- Run `npm run db:push` to ensure tables exist

**Images not uploading**
- Verify all three Cloudinary environment variables are set
- Check Cloudinary dashboard for upload errors

**Build fails**
- Ensure Node.js version 18+ is used
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Image Storage**: Cloudinary
- **Authentication**: Simple admin auth (not session-based)
