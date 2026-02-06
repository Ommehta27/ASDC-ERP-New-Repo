# 🔐 Vercel Environment Variables Setup - URGENT

## ⚠️ CRITICAL: "Configuration" Error Fix

If you're seeing **"Login error: Configuration"**, it means `AUTH_SECRET` or `NEXTAUTH_SECRET` is **NOT SET** in your Vercel environment variables.

## 🚀 Quick Fix (5 minutes)

### Step 1: Generate Secret
Run this command locally:
```bash
openssl rand -base64 32
```

Copy the output (it will look like: `aBc123XyZ456...`)

### Step 2: Add to Vercel
1. Go to **Vercel Dashboard**
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add:
   - **Key:** `AUTH_SECRET`
   - **Value:** (paste the generated secret)
   - **Environment:** Select all (Production, Preview, Development)
6. Click **Save**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **Redeploy**

## ✅ Required Environment Variables

Make sure ALL of these are set in Vercel:

```env
# CRITICAL - Required for login to work
AUTH_SECRET=your-generated-secret-here
# OR (both work, but AUTH_SECRET is preferred for NextAuth v5)
NEXTAUTH_SECRET=your-generated-secret-here

# CRITICAL - Required for database
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public

# Optional but recommended
NEXTAUTH_URL=https://your-project.vercel.app
```

## 🔍 How to Verify

1. **Check Vercel Environment Variables:**
   - Settings → Environment Variables
   - Make sure `AUTH_SECRET` or `NEXTAUTH_SECRET` is listed

2. **Check Build Logs:**
   - Deployments → Latest deployment → Build Logs
   - Look for any warnings about missing secrets

3. **Test Login:**
   - After redeploying, try logging in
   - If you still see "Configuration" error, the secret wasn't set correctly

## 🐛 Troubleshooting

### Still seeing "Configuration" error?
1. ✅ Verify secret is set in Vercel (check all environments)
2. ✅ Make sure you redeployed after adding the variable
3. ✅ Check that the secret is at least 32 characters long
4. ✅ Try using `AUTH_SECRET` instead of `NEXTAUTH_SECRET` (or vice versa)

### Secret not working?
- Make sure there are no extra spaces or quotes
- Copy the entire output from `openssl rand -base64 32`
- Don't add `AUTH_SECRET=` prefix in Vercel (just the value)

## 📝 Example

**Correct:**
```
Key: AUTH_SECRET
Value: aBc123XyZ456DeF789GhI012JkL345MnO678PqR901StU234VwX567YzA890
```

**Incorrect:**
```
Key: AUTH_SECRET
Value: AUTH_SECRET=aBc123XyZ456... (don't include the key name)
```

## ⚡ Quick Command Reference

```bash
# Generate secret
openssl rand -base64 32

# Test locally (add to .env.local)
AUTH_SECRET=$(openssl rand -base64 32)
echo "AUTH_SECRET=$AUTH_SECRET"
```

---

**After setting the environment variable and redeploying, the login should work!** 🎉
