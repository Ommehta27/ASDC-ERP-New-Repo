# 🚀 Vercel Deployment - Quick Fix Guide

## ⚠️ Critical Environment Variables for Vercel

Add these environment variables in your Vercel project settings:

### Required Variables:

1. **AUTH_SECRET** (or NEXTAUTH_SECRET)
   ```
   Generate using: openssl rand -base64 32
   ```
   - Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `AUTH_SECRET` = `[generated-secret]`
   - OR: `NEXTAUTH_SECRET` = `[generated-secret]` (both work)

2. **NEXTAUTH_URL** (Optional but recommended)
   ```
   https://your-project.vercel.app
   ```
   - Set this to your Vercel deployment URL
   - Vercel auto-detects this, but setting it explicitly helps

3. **DATABASE_URL**
   ```
   postgresql://user:password@host:5432/database?schema=public
   ```
   - Your production database connection string
   - Make sure it's accessible from Vercel's servers

## 🔧 Quick Fix Steps:

1. **Go to Vercel Dashboard:**
   - Navigate to your project
   - Click "Settings" → "Environment Variables"

2. **Add/Verify these variables:**
   ```
   AUTH_SECRET=your-generated-secret-here
   DATABASE_URL=your-database-url-here
   ```

3. **Redeploy:**
   - Go to "Deployments" tab
   - Click "..." on the latest deployment
   - Click "Redeploy"

## ✅ What Was Fixed:

1. ✅ Added `trustHost: true` to auth options (required for Vercel)
2. ✅ Updated middleware to support both `AUTH_SECRET` and `NEXTAUTH_SECRET`
3. ✅ Improved error handling in login form

## 🐛 Common Issues:

### Issue: "Login fails silently"
**Solution:** Check browser console for errors. Verify:
- `AUTH_SECRET` is set in Vercel
- `DATABASE_URL` is correct and accessible
- Database has the user accounts seeded

### Issue: "Redirect loop"
**Solution:** 
- Clear browser cookies
- Verify `NEXTAUTH_URL` matches your Vercel domain
- Check middleware matcher paths

### Issue: "Database connection error"
**Solution:**
- Verify `DATABASE_URL` is correct
- Check if database allows connections from Vercel IPs
- For Neon/Supabase: Check connection pooling settings

## 📝 Testing After Deployment:

1. Visit: `https://your-project.vercel.app/auth/login`
2. Try logging in with:
   - Email: `admin@skillerp.com`
   - Password: `admin123`
3. Check browser console (F12) for any errors
4. Check Vercel function logs for API errors

## 🔍 Debugging:

If login still fails:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try logging in
4. Check the `/api/auth/callback/credentials` request
5. Look for error messages in the response

## 📞 Need Help?

Check Vercel logs:
- Go to: Vercel Dashboard → Your Project → Functions
- Look for errors in `/api/auth/[...nextauth]` function
