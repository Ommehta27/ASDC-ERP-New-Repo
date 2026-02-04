# 🚀 Deployment Guide - ASDC ERP System

## 📍 Source Code Location

**Your complete source code is in:**
```
/Users/ommehta/Documents/ASDC ERP Cursor/skill-erp/
```

---

## 📦 What You Need to Deploy

### ✅ **Include These Files/Folders:**

```
skill-erp/
├── app/                    ← All application routes and pages
├── components/             ← Reusable React components
├── lib/                    ← Utility functions
├── prisma/                 ← Database schema & migrations
├── public/                 ← Static assets
├── types/                  ← TypeScript type definitions
├── auth.ts                 ← Authentication configuration
├── middleware.ts           ← Request middleware
├── next.config.ts          ← Next.js configuration
├── package.json            ← Dependencies list
├── package-lock.json       ← Locked dependency versions
├── tsconfig.json           ← TypeScript configuration
├── prisma.config.ts        ← Prisma configuration
├── eslint.config.mjs       ← ESLint rules
└── components.json         ← UI components config
```

### ❌ **DO NOT Include:**
- `node_modules/` - Will be installed on server
- `.next/` - Will be built on server
- `.env` - Use environment variables on server
- `.git/` - Optional (needed only for version control)

---

## 🎯 Deployment Options

### Option 1: Vercel (Recommended ⭐)
**Easiest deployment for Next.js apps**

1. **Push to GitHub:**
   ```bash
   cd /Users/ommehta/Documents/ASDC\ ERP\ Cursor/skill-erp
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Connect your GitHub account
   - Select your repository
   - Add environment variables (see below)
   - Click "Deploy"

**Advantages:**
- ✓ Automatic HTTPS
- ✓ Global CDN
- ✓ Automatic deployments on git push
- ✓ Free tier available
- ✓ Built-in database support

---

### Option 2: Docker
**For containerized deployment on any cloud**

1. **Create Dockerfile:**
   Already provided in your project

2. **Build & Run:**
   ```bash
   docker build -t skill-erp .
   docker run -p 3000:3000 skill-erp
   ```

---

### Option 3: VPS/Cloud Server
**For AWS, DigitalOcean, Linode, etc.**

1. **Upload code to server:**
   ```bash
   scp -r skill-erp/ user@your-server:/var/www/
   ```

2. **On server, install dependencies:**
   ```bash
   cd /var/www/skill-erp
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   nano .env
   # Add your production env vars
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Start the server:**
   ```bash
   npm run start
   # Or use PM2 for production:
   npm install -g pm2
   pm2 start npm --name "skill-erp" -- start
   ```

---

## 🔐 Environment Variables Required

Create these environment variables on your deployment platform:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# Authentication
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-random-secret-key-generate-using-openssl"

# Optional: If using S3 for file uploads
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_BUCKET_NAME="your-bucket-name"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

---

## 🗄️ Database Setup

1. **Create Production Database:**
   - Use PostgreSQL (recommended)
   - Providers: Neon, Supabase, AWS RDS, etc.

2. **Run Migrations:**
   ```bash
   npx prisma migrate deploy
   ```

3. **Seed Initial Data (optional):**
   ```bash
   npx prisma db seed
   ```

---

## ⚡ Build Commands

For most platforms, use these build commands:

- **Install Command:** `npm install`
- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Dev Command:** `npm run dev`

---

## 📊 Budget Management Features Included

Your deployment includes:
- ✅ Budget Planning & Allocation
- ✅ Budget vs Actual Tracking
- ✅ Variance Analysis
- ✅ Multi-level Approval Workflow
- ✅ Cost Center Management
- ✅ Budget Reports & Analytics
- ✅ Real-time Alerts

**Pages deployed:**
- `/finance/budgets`
- `/finance/budgets/periods`
- `/finance/budget-reports`
- `/finance/cost-centers`
- And 50+ other pages

---

## ✅ Pre-Deployment Checklist

- [ ] Database URL configured
- [ ] NEXTAUTH_SECRET generated
- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Production build tested locally
- [ ] .env file NOT committed to git
- [ ] SSL certificate configured (or using Vercel)

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Issues
- Check DATABASE_URL format
- Ensure database is accessible from deployment server
- Verify SSL mode if required

### 404 Errors
- Run `npx prisma generate` after schema changes
- Clear `.next` folder and rebuild

---

## 📞 Support

For deployment issues:
1. Check build logs on your platform
2. Verify environment variables are set correctly
3. Ensure database is accessible
4. Check Next.js version compatibility

---

## 🎉 Post-Deployment

After successful deployment:
1. Test all critical pages
2. Set up monitoring (Vercel Analytics, Sentry, etc.)
3. Configure custom domain (if applicable)
4. Set up automated backups for database
5. Enable error tracking

---

**Your app is production-ready! 🚀**
