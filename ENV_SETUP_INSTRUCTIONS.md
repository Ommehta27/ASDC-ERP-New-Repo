# 🔐 Quick Fix: Add AUTH_SECRET to Your Environment

## ⚠️ The Problem
The error "Login error: Configuration" means `AUTH_SECRET` or `NEXTAUTH_SECRET` is missing from your environment variables.

## ✅ Solution (Choose One)

### Option 1: Create `.env.local` (Recommended for Local Development)

1. **Create a new file** in your project root: `.env.local`

2. **Add this line:**
   ```
   AUTH_SECRET=MtTJMTsZOUGtxZC4ZAtjGB5ei7FvR9EnW6o9xZi7q/8=
   ```

3. **Save the file**

4. **Restart your dev server:**
   - Stop the current server (Ctrl+C in terminal)
   - Run `npm run dev` again

### Option 2: Add to Existing `.env` File

1. **Open** your `.env` file in the project root

2. **Add this line** (if it doesn't already exist):
   ```
   AUTH_SECRET=MtTJMTsZOUGtxZC4ZAtjGB5ei7FvR9EnW6o9xZi7q/8=
   ```

3. **Save the file**

4. **Restart your dev server:**
   - Stop the current server (Ctrl+C in terminal)
   - Run `npm run dev` again

## 🔍 Verify It's Working

After restarting, check your terminal. You should **NOT** see this warning:
```
⚠️  AUTH_SECRET or NEXTAUTH_SECRET is not set!
```

If you don't see that warning, the secret is loaded correctly!

## 📝 Generate Your Own Secret (Optional)

If you want to generate a new secret:
```bash
openssl rand -base64 32
```

Then use the output as your `AUTH_SECRET` value.

## 🚀 After Adding the Secret

1. **Restart the server** (important!)
2. **Try logging in again**
3. The "Configuration" error should be gone!

---

**Note:** `.env.local` is automatically ignored by git, so it's safe to use for local development secrets.
