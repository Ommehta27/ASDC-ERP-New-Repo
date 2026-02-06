# 🏢 ASDC ERP - Enterprise Project Structure

## 📁 Project Root: `/skill-erp`

This project follows **Next.js 13+ App Router** enterprise-grade architecture with TypeScript and Prisma ORM.

---

## 🗂️ Directory Structure

```
skill-erp/
├── 📱 app/                          # Next.js App Router (Pages & API Routes)
│   ├── (dashboard)/                 # Protected dashboard routes (route group)
│   │   ├── analytics/              # Analytics & Reports
│   │   ├── centers/                # Training Centers Management
│   │   ├── courses/                # Course Catalog
│   │   ├── crm/                    # CRM & Lead Management
│   │   ├── dashboard/              # Main Dashboard
│   │   ├── enrollments/            # Student Enrollments
│   │   ├── finance/                # Finance & Accounting
│   │   │   ├── budgets/           # Budget Management
│   │   │   ├── chart-of-accounts/ # Chart of Accounts (SAP-style)
│   │   │   └── cost-centers/      # Cost Center Management
│   │   ├── hr/                     # HR & Payroll
│   │   ├── inquiries/              # Student Inquiries + CRM
│   │   ├── inventory/              # Inventory Management
│   │   ├── placements/             # Placement Management
│   │   ├── procurement/            # Procurement & PO
│   │   ├── setup/                  # System Configuration
│   │   │   └── approval-hierarchies/ # Approval Workflows
│   │   ├── students/               # Student Management
│   │   └── workflows/              # Workflow Automation
│   ├── api/                        # Backend API Routes
│   │   ├── auth/                  # Authentication endpoints
│   │   ├── centers/               # Centers API
│   │   ├── courses/               # Courses API
│   │   ├── crm/                   # CRM API
│   │   ├── enrollments/           # Enrollments API
│   │   ├── finance/               # Finance APIs
│   │   │   ├── budgets/
│   │   │   ├── chart-of-accounts/
│   │   │   └── cost-centers/
│   │   ├── hr/                    # HR APIs
│   │   ├── inquiries/             # Inquiries API
│   │   ├── inventory/             # Inventory API
│   │   ├── placements/            # Placements API
│   │   ├── procurement/           # Procurement API
│   │   ├── setup/                 # Setup APIs
│   │   │   └── approval-hierarchies/
│   │   ├── students/              # Students API
│   │   └── upload/                # File Upload API
│   ├── auth/                       # Auth Pages (Login, etc.)
│   ├── public/                     # Public Pages
│   ├── layout.tsx                  # Root Layout
│   ├── page.tsx                    # Home/Landing Page
│   └── globals.css                 # Global Styles
│
├── 🎨 components/                   # React Components (Client & Server)
│   ├── analytics/                  # Analytics Components
│   ├── centers/                    # Centers Components
│   ├── courses/                    # Courses Components
│   ├── dashboard/                  # Dashboard Widgets
│   ├── enrollments/                # Enrollment Forms & Tables
│   ├── finance/                    # Finance Components
│   │   ├── budget-form.tsx
│   │   ├── chart-of-accounts-form.tsx
│   │   └── cost-center-form.tsx
│   ├── hr/                         # HR Components
│   ├── inquiries/                  # Inquiry Components
│   ├── inventory/                  # Inventory Components
│   ├── layout/                     # Layout Components
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── user-nav.tsx
│   ├── placements/                 # Placement Components
│   ├── procurement/                # Procurement Components
│   ├── providers/                  # Context Providers
│   ├── setup/                      # Setup Components
│   ├── students/                   # Student Components
│   ├── ui/                         # Shadcn UI Components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── switch.tsx
│   │   └── ... (22+ components)
│   └── workflows/                  # Workflow Components
│
├── 🛠️ lib/                          # Core Business Logic & Utilities
│   ├── auth-options.ts             # NextAuth Configuration
│   ├── inventory.ts                # Inventory Business Logic
│   ├── ocr/                        # OCR Processing
│   ├── permissions.ts              # RBAC Permission System
│   ├── prisma.ts                   # Prisma Client Singleton
│   ├── session.ts                  # Session Management
│   └── utils.ts                    # Utility Functions
│
├── 🗄️ prisma/                       # Database Layer
│   ├── schema.prisma               # Database Schema (60+ models)
│   ├── seed.ts                     # Database Seeder
│   ├── seed-coa.ts                 # Chart of Accounts Seed
│   ├── ERD.svg                     # Entity Relationship Diagram
│   └── inventory-backup.json       # Data Backups
│
├── 📂 public/                       # Static Assets
│   ├── uploads/                    # User Uploaded Files
│   ├── *.svg                       # Icons & Logos
│   └── *.png                       # Images
│
├── 📝 types/                        # TypeScript Type Definitions
│   └── next-auth.d.ts              # NextAuth Type Extensions
│
├── 📄 Configuration Files
│   ├── .env                        # Environment Variables (DO NOT COMMIT)
│   ├── .env.example                # Environment Template
│   ├── .gitignore                  # Git Ignore Rules
│   ├── auth.ts                     # Auth.js Configuration
│   ├── components.json             # Shadcn UI Config
│   ├── eslint.config.mjs           # ESLint Configuration
│   ├── middleware.ts               # Next.js Middleware (Auth & Routing)
│   ├── next.config.ts              # Next.js Configuration
│   ├── next-env.d.ts               # Next.js Types
│   ├── package.json                # Dependencies
│   ├── package-lock.json           # Lock File
│   ├── postcss.config.mjs          # PostCSS Config
│   ├── prisma.config.ts            # Prisma Config
│   ├── tsconfig.json               # TypeScript Config
│   └── tailwind.config.ts          # Tailwind CSS Config
│
└── 📚 Documentation
    ├── README.md                   # Main Documentation
    ├── PROJECT_STRUCTURE.md        # This File
    ├── DEPLOYMENT_GUIDE.md         # Deployment Instructions
    ├── CRM_FEATURE_GUIDE.md        # CRM Documentation
    ├── INTELLIGENT_CRM_GUIDE.md    # Advanced CRM Features
    ├── OCR_FEATURE.md              # OCR Documentation
    ├── WORKFLOWS_GUIDE.md          # Workflow Automation Guide
    └── FISCAL_YEAR_BUDGET_FIX.md   # Budget System Documentation
```

---

## 🏗️ Architecture Principles

### 1. **Separation of Concerns**
- **`app/`**: Routing, pages, and API endpoints
- **`components/`**: Reusable UI components
- **`lib/`**: Business logic and utilities
- **`prisma/`**: Data layer and database schema

### 2. **Route Groups** (`(dashboard)`)
- Shared layouts without affecting URL structure
- All authenticated routes are grouped under `(dashboard)`

### 3. **API Routes** (`app/api/`)
- RESTful endpoints
- Follows resource-based naming
- Authentication and authorization middleware

### 4. **Component Organization**
- Feature-based folder structure
- Co-located with their domain (finance, hr, etc.)
- Shared UI components in `components/ui/`

### 5. **Type Safety**
- Full TypeScript coverage
- Prisma-generated types
- Custom type definitions in `types/`

---

## 🚀 Development Workflow

### Local Development
```bash
cd /Users/ommehta/Documents/ASDC\ ERP\ Cursor/skill-erp
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### Database Operations
```bash
npx prisma studio          # Database GUI
npx prisma generate        # Generate Prisma Client
npx prisma db push         # Push schema changes
npx prisma migrate dev     # Create migration
```

---

## 📦 Core Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js** | React Framework | 16.1.6 |
| **React** | UI Library | 19.2.3 |
| **TypeScript** | Type Safety | ^5 |
| **Prisma** | ORM | 6.19.2 |
| **PostgreSQL** | Database | Latest |
| **NextAuth.js** | Authentication | 5.0.0 |
| **Tailwind CSS** | Styling | ^4 |
| **Shadcn UI** | Component Library | Latest |
| **Zod** | Validation | ^4.3.6 |

---

## 🔐 Environment Variables

Create `.env` file in project root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/skill_erp"

# NextAuth
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-secret-key-here"

# Optional
NODE_ENV="development"
```

---

## 📊 Database Schema Highlights

- **60+ Models** covering entire ERP system
- **Student Lifecycle**: Inquiries → Enrollments → Batches → Placements
- **Finance**: Chart of Accounts, Budgets, Cost Centers, Transactions
- **HR & Payroll**: Employees, Attendance, Leave, Payroll, Performance
- **Inventory**: Items, Allocations, Stock Tracking
- **Procurement**: Purchase Orders, Vendors, Requisitions
- **CRM**: Lead Scoring, Call Logging, Activity Tracking
- **Workflows**: Approval Hierarchies, Automation

---

## 🎯 Key Features

✅ **Role-Based Access Control (RBAC)**
✅ **Multi-tenant Architecture (Centers)**
✅ **Enterprise Chart of Accounts (SAP/NetSuite-style)**
✅ **Fiscal Year-Aware Budgeting**
✅ **Approval Workflow Engine**
✅ **Intelligent CRM with Lead Scoring**
✅ **Workflow Automation (WhatsApp, Meta, Google)**
✅ **OCR Document Processing**
✅ **Real-time Analytics**
✅ **Comprehensive Audit Trails**

---

## 📝 Coding Standards

### File Naming
- **Components**: `PascalCase` (e.g., `StudentForm.tsx`)
- **Utilities**: `kebab-case` (e.g., `auth-options.ts`)
- **API Routes**: `route.ts` (Next.js convention)

### Code Organization
1. Imports (external → internal → types)
2. Type definitions
3. Component/Function declaration
4. Exports

### Component Structure
```tsx
"use client" // if client component

import statements...

interface Props {
  // prop types
}

export function ComponentName({ props }: Props) {
  // hooks
  // handlers
  // effects
  // render
}
```

---

## 🔄 Git Workflow

```bash
# Main branch
main (production-ready)

# Development
dev (active development)

# Feature branches
feature/approval-hierarchies
feature/crm-integration
bugfix/select-item-validation
```

---

## 📈 Performance Optimizations

- **Server Components** by default
- **Dynamic Imports** for heavy components
- **Database Indexing** on frequently queried fields
- **API Response Caching**
- **Image Optimization** with Next.js Image
- **Code Splitting** with Next.js

---

## 🛡️ Security Best Practices

✅ Environment variables for secrets
✅ CSRF protection via NextAuth
✅ SQL injection prevention via Prisma
✅ XSS protection via React
✅ Permission-based API routes
✅ Secure password hashing (bcrypt)
✅ HTTP-only cookies for sessions

---

## 📞 Support & Maintenance

**Project Location**: `/Users/ommehta/Documents/ASDC ERP Cursor/skill-erp/`
**Running On**: http://localhost:3001
**Database**: PostgreSQL (skill_erp)

**Important**: The `untitled folder/` is an outdated backup and should be removed.

---

*Last Updated: February 2026*
*Version: 0.1.0*
*Maintained by: Enterprise Development Team*
