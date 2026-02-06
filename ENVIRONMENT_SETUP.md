# 🔐 Environment Variables Setup

## Required Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# ==============================================
# DATABASE CONFIGURATION
# ==============================================
DATABASE_URL="postgresql://username:password@localhost:5432/skill_erp"

# ==============================================
# AUTHENTICATION (NextAuth.js)
# ==============================================
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars-for-production"

# ==============================================
# APPLICATION SETTINGS
# ==============================================
NODE_ENV="development"
PORT="3001"
```

## Optional Variables

```env
# ==============================================
# FILE UPLOADS
# ==============================================
MAX_FILE_SIZE="10485760"  # 10MB in bytes
UPLOAD_DIR="./public/uploads"

# ==============================================
# EMAIL CONFIGURATION
# ==============================================
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@example.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="ASDC ERP <noreply@example.com>"

# ==============================================
# EXTERNAL API INTEGRATIONS
# ==============================================
WHATSAPP_API_KEY=""
GOOGLE_API_KEY=""
META_API_KEY=""

# ==============================================
# ANALYTICS
# ==============================================
POWERBI_EMBED_URL=""
POWERBI_ACCESS_TOKEN=""

# ==============================================
# OCR SERVICE
# ==============================================
OCR_API_KEY=""
```

## Production Configuration

For production deployment, use these settings:

```env
DATABASE_URL="postgresql://prod_user:prod_pass@prod-host:5432/skill_erp_prod"
NEXTAUTH_URL="https://erp.yourdomain.com"
NEXTAUTH_SECRET="generate-a-new-one-for-production-min-32-chars"
NODE_ENV="production"
```

## Security Notes

⚠️ **NEVER commit `.env` to version control!**
✅ Use different secrets for development and production
✅ Generate NEXTAUTH_SECRET using: `openssl rand -base64 32`
✅ Restrict database user permissions in production
✅ Use environment-specific variables on hosting platforms

## Platform-Specific Setup

### Vercel
Add environment variables in Project Settings → Environment Variables

### Docker
Pass environment variables using `--env-file` flag:
```bash
docker run --env-file .env -p 3001:3001 asdc-erp
```

### Traditional Server
Use a `.env` file or export variables in your shell:
```bash
export DATABASE_URL="postgresql://..."
export NEXTAUTH_SECRET="..."
```
