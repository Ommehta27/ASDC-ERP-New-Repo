import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { randomUUID } from "crypto"

const prisma = new PrismaClient()
const uuidv4 = randomUUID

async function main() {
  console.log("🌱 Starting database seed...")

  // Seed System Lists
  console.log("📋 Seeding system lists...")
  
  // Inquiry Status List
  const inquiryStatusList = await prisma.system_lists.upsert({
    where: { code: "INQUIRY_STATUS" },
    update: {},
    create: {
      id: crypto.randomUUID(),
      code: "INQUIRY_STATUS",
      name: "Inquiry Status",
      description: "Status options for student inquiries",
      category: "STUDENT_LIFECYCLE",
      isSystem: true,
      isActive: true,
      updatedAt: new Date(),
      system_list_items: {
        create: [
          { id: crypto.randomUUID(), code: "NEW", label: "New", color: "#3B82F6", sortOrder: 0, isDefault: true, isSystem: true, isActive: true, updatedAt: new Date() },
          { id: crypto.randomUUID(), code: "FOLLOW_UP", label: "Follow Up", color: "#F59E0B", sortOrder: 1, isSystem: true, isActive: true, updatedAt: new Date() },
          { id: crypto.randomUUID(), code: "QUALIFIED", label: "Qualified", color: "#10B981", sortOrder: 2, isSystem: true, isActive: true, updatedAt: new Date() },
          { id: crypto.randomUUID(), code: "CONVERTED", label: "Converted", color: "#8B5CF6", sortOrder: 3, isSystem: true, isActive: true, updatedAt: new Date() },
          { id: crypto.randomUUID(), code: "LOST", label: "Lost", color: "#EF4444", sortOrder: 4, isSystem: true, isActive: true, updatedAt: new Date() },
        ],
      },
    },
  })

  // Enrollment Status List
  const enrollmentStatusList = await prisma.system_lists.upsert({
    where: { code: "ENROLLMENT_STATUS" },
    update: {},
    create: {
      id: crypto.randomUUID(),
      code: "ENROLLMENT_STATUS",
      name: "Enrollment Status",
      description: "Status options for student enrollments",
      category: "STUDENT_LIFECYCLE",
      isSystem: true,
      isActive: true,
      updatedAt: new Date(),
      system_list_items: {
        create: [
          { id: crypto.randomUUID(), code: "ENROLLED", label: "Enrolled", color: "#10B981", sortOrder: 0, isDefault: true, isSystem: true, isActive: true, updatedAt: new Date() },
          { id: crypto.randomUUID(), code: "IN_PROGRESS", label: "In Progress", color: "#3B82F6", sortOrder: 1, isSystem: true, isActive: true, updatedAt: new Date() },
          { id: crypto.randomUUID(), code: "COMPLETED", label: "Completed", color: "#8B5CF6", sortOrder: 2, isSystem: true, isActive: true, updatedAt: new Date() },
          { id: crypto.randomUUID(), code: "DROPPED", label: "Dropped", color: "#EF4444", sortOrder: 3, isSystem: true, isActive: true, updatedAt: new Date() },
          { id: crypto.randomUUID(), code: "SUSPENDED", label: "Suspended", color: "#F59E0B", sortOrder: 4, isSystem: true, isActive: true, updatedAt: new Date() },
        ],
      },
    },
  })

  // Placement Status List
  const placementStatusList = await prisma.system_lists.upsert({
    where: { code: "PLACEMENT_STATUS" },
    update: {},
    create: {
      id: crypto.randomUUID(),
      code: "PLACEMENT_STATUS",
      name: "Placement Status",
      description: "Status options for student placements",
      category: "STUDENT_LIFECYCLE",
      isSystem: true,
      isActive: true,
      updatedAt: new Date(),
      system_list_items: {
        create: [
          { id: crypto.randomUUID(), code: "APPLIED", label: "Applied", color: "#3B82F6", sortOrder: 0, isSystem: true, isActive: true, updatedAt: new Date() },
          { id: crypto.randomUUID(), code: "SHORTLISTED", label: "Shortlisted", color: "#F59E0B", sortOrder: 1, isSystem: true, isActive: true, updatedAt: new Date() },
          { id: crypto.randomUUID(), code: "INTERVIEW", label: "Interview", color: "#8B5CF6", sortOrder: 2, isSystem: true, isActive: true, updatedAt: new Date() },
          { id: crypto.randomUUID(), code: "OFFERED", label: "Offered", color: "#10B981", sortOrder: 3, isDefault: true, isSystem: true, isActive: true, updatedAt: new Date() },
          { id: crypto.randomUUID(), code: "JOINED", label: "Joined", color: "#059669", sortOrder: 4, isSystem: true, isActive: true, updatedAt: new Date() },
          { id: crypto.randomUUID(), code: "REJECTED", label: "Rejected", color: "#EF4444", sortOrder: 5, isSystem: true, isActive: true, updatedAt: new Date() },
        ],
      },
    },
  })

  console.log("✅ System lists seeded")

  // Seed Units of Measure
  console.log("📏 Seeding units of measure...")
  
  const uoms = [
    { code: "PCS", name: "Pieces", abbreviation: "pcs", type: "QUANTITY", description: "Individual units" },
    { code: "KG", name: "Kilogram", abbreviation: "kg", type: "WEIGHT", description: "Weight measurement" },
    { code: "L", name: "Liter", abbreviation: "L", type: "VOLUME", description: "Volume measurement" },
    { code: "M", name: "Meter", abbreviation: "m", type: "LENGTH", description: "Length measurement" },
    { code: "BOX", name: "Box", abbreviation: "box", type: "QUANTITY", description: "Boxed items" },
    { code: "SET", name: "Set", abbreviation: "set", type: "QUANTITY", description: "Set of items" },
    { code: "UNIT", name: "Unit", abbreviation: "unit", type: "QUANTITY", description: "Generic unit" },
  ]

  for (const uom of uoms) {
    await prisma.units_of_measure.upsert({
      where: { code: uom.code },
      update: {},
      create: {
        id: crypto.randomUUID(),
        ...uom,
        isActive: true,
        updatedAt: new Date(),
      },
    })
  }

  console.log("✅ Units of measure seeded")

  // Seed Default PO Template
  console.log("📄 Seeding PO templates...")
  
  await prisma.po_templates.upsert({
    where: { templateCode: "DEFAULT" },
    update: {},
    create: {
      id: crypto.randomUUID(),
      templateCode: "DEFAULT",
      name: "Standard Purchase Order",
      description: "Default template for purchase orders",
      isDefault: true,
      isActive: true,
      paymentTerms: "Net 30 days from invoice date",
      deliveryTerms: "FOB Destination",
      defaultTaxRate: 18.0,
      includeTax: true,
      termsConditions: "1. Payment terms as agreed\n2. Quality standards must be met\n3. Delivery on time is essential",
      headerText: "Purchase Order",
      footerText: "Thank you for your business",
      requiresApproval: true,
      autoApproveBelow: 10000,
      notifyOnCreate: true,
      notifyOnApprove: true,
      notifyEmails: [],
      updatedAt: new Date(),
    },
  })

  console.log("✅ PO templates seeded")

  // Seed Company Information
  console.log("🏢 Seeding company information...")
  
  await prisma.company_info.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      companyName: "ASDC Vantage",
      legalName: "Adani Skill Development Centre",
      tagline: "Empowering Skills, Enabling Success",
      registeredAddress: "Adani House",
      registeredCity: "Ahmedabad",
      registeredState: "Gujarat",
      registeredPincode: "380001",
      phone: "+91-1234567890",
      email: "info@asdcvantage.com",
      website: "https://asdcvantage.com",
      gstin: "24AAAAA0000A1Z5",
      pan: "AAAAA0000A",
      cin: "U12345MH2020PTC123456",
      updatedAt: new Date(),
    },
  })

  console.log("✅ Company information seeded")

  // Seed comprehensive Chart of Accounts (Indian Standards)
  console.log("💰 Seeding Chart of Accounts...")
  
  const chartOfAccounts = [
    // ===== ASSETS (1000-1999) =====
    // Current Assets (1000-1299)
    { code: "1000", name: "Cash and Cash Equivalents", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "CASH", isControlAccount: true },
    { code: "1010", name: "Cash on Hand", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "CASH", parentCode: "1000" },
    { code: "1020", name: "Petty Cash", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "CASH", parentCode: "1000" },
    { code: "1030", name: "Cash in Transit", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "CASH", parentCode: "1000" },
    
    { code: "1100", name: "Bank Accounts", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "BANK", isControlAccount: true },
    { code: "1110", name: "Current Account - HDFC Bank", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "BANK", parentCode: "1100" },
    { code: "1120", name: "Current Account - ICICI Bank", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "BANK", parentCode: "1100" },
    { code: "1130", name: "Savings Account", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "BANK", parentCode: "1100" },
    { code: "1140", name: "Fixed Deposit", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "BANK", parentCode: "1100" },
    
    { code: "1200", name: "Accounts Receivable", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "RECEIVABLES", isControlAccount: true },
    { code: "1210", name: "Trade Receivables - Domestic", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "RECEIVABLES", parentCode: "1200" },
    { code: "1220", name: "Trade Receivables - Export", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "RECEIVABLES", parentCode: "1200" },
    { code: "1230", name: "Unbilled Receivables", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "RECEIVABLES", parentCode: "1200" },
    { code: "1240", name: "Provision for Doubtful Debts", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "RECEIVABLES", parentCode: "1200", isContraAccount: true },
    
    { code: "1250", name: "Other Current Assets", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "OTHER", isControlAccount: true },
    { code: "1251", name: "Prepaid Expenses", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "OTHER", parentCode: "1250" },
    { code: "1252", name: "Advance to Employees", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "OTHER", parentCode: "1250" },
    { code: "1253", name: "Advance to Suppliers", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "OTHER", parentCode: "1250" },
    { code: "1254", name: "Security Deposits", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "OTHER", parentCode: "1250" },
    { code: "1255", name: "Input GST Credit", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "OTHER", parentCode: "1250" },
    { code: "1256", name: "CGST Receivable", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "OTHER", parentCode: "1250" },
    { code: "1257", name: "SGST Receivable", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "OTHER", parentCode: "1250" },
    { code: "1258", name: "IGST Receivable", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "OTHER", parentCode: "1250" },
    { code: "1259", name: "TDS Receivable", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "OTHER", parentCode: "1250" },
    
    { code: "1260", name: "Inventory", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "INVENTORY", isControlAccount: true },
    { code: "1261", name: "Raw Materials", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "INVENTORY", parentCode: "1260" },
    { code: "1262", name: "Work in Progress", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "INVENTORY", parentCode: "1260" },
    { code: "1263", name: "Finished Goods", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "INVENTORY", parentCode: "1260" },
    { code: "1264", name: "Consumables and Supplies", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "INVENTORY", parentCode: "1260" },
    
    // Fixed Assets (1300-1599)
    { code: "1300", name: "Property, Plant & Equipment", type: "ASSET", category: "FIXED_ASSETS", subCategory: "TANGIBLE", isControlAccount: true },
    { code: "1310", name: "Land and Buildings", type: "ASSET", category: "FIXED_ASSETS", subCategory: "TANGIBLE", parentCode: "1300" },
    { code: "1320", name: "Plant and Machinery", type: "ASSET", category: "FIXED_ASSETS", subCategory: "TANGIBLE", parentCode: "1300" },
    { code: "1330", name: "Furniture and Fixtures", type: "ASSET", category: "FIXED_ASSETS", subCategory: "TANGIBLE", parentCode: "1300" },
    { code: "1340", name: "Office Equipment", type: "ASSET", category: "FIXED_ASSETS", subCategory: "TANGIBLE", parentCode: "1300" },
    { code: "1350", name: "Computers and IT Equipment", type: "ASSET", category: "FIXED_ASSETS", subCategory: "TANGIBLE", parentCode: "1300" },
    { code: "1360", name: "Vehicles", type: "ASSET", category: "FIXED_ASSETS", subCategory: "TANGIBLE", parentCode: "1300" },
    { code: "1370", name: "Leasehold Improvements", type: "ASSET", category: "FIXED_ASSETS", subCategory: "TANGIBLE", parentCode: "1300" },
    
    { code: "1400", name: "Accumulated Depreciation", type: "ASSET", category: "FIXED_ASSETS", subCategory: "DEPRECIATION", isControlAccount: true, isContraAccount: true },
    { code: "1410", name: "Accumulated Depreciation - Buildings", type: "ASSET", category: "FIXED_ASSETS", subCategory: "DEPRECIATION", parentCode: "1400", isContraAccount: true },
    { code: "1420", name: "Accumulated Depreciation - Machinery", type: "ASSET", category: "FIXED_ASSETS", subCategory: "DEPRECIATION", parentCode: "1400", isContraAccount: true },
    { code: "1430", name: "Accumulated Depreciation - Furniture", type: "ASSET", category: "FIXED_ASSETS", subCategory: "DEPRECIATION", parentCode: "1400", isContraAccount: true },
    { code: "1440", name: "Accumulated Depreciation - Equipment", type: "ASSET", category: "FIXED_ASSETS", subCategory: "DEPRECIATION", parentCode: "1400", isContraAccount: true },
    { code: "1450", name: "Accumulated Depreciation - Vehicles", type: "ASSET", category: "FIXED_ASSETS", subCategory: "DEPRECIATION", parentCode: "1400", isContraAccount: true },
    
    { code: "1500", name: "Intangible Assets", type: "ASSET", category: "FIXED_ASSETS", subCategory: "INTANGIBLE", isControlAccount: true },
    { code: "1510", name: "Goodwill", type: "ASSET", category: "FIXED_ASSETS", subCategory: "INTANGIBLE", parentCode: "1500" },
    { code: "1520", name: "Software and Licenses", type: "ASSET", category: "FIXED_ASSETS", subCategory: "INTANGIBLE", parentCode: "1500" },
    { code: "1530", name: "Patents and Trademarks", type: "ASSET", category: "FIXED_ASSETS", subCategory: "INTANGIBLE", parentCode: "1500" },
    { code: "1540", name: "Copyrights", type: "ASSET", category: "FIXED_ASSETS", subCategory: "INTANGIBLE", parentCode: "1500" },
    
    { code: "1600", name: "Investments", type: "ASSET", category: "INVESTMENTS", subCategory: "LONG_TERM", isControlAccount: true },
    { code: "1610", name: "Long-term Investments", type: "ASSET", category: "INVESTMENTS", subCategory: "LONG_TERM", parentCode: "1600" },
    { code: "1620", name: "Short-term Investments", type: "ASSET", category: "INVESTMENTS", subCategory: "SHORT_TERM", parentCode: "1600" },
    { code: "1630", name: "Investment in Subsidiaries", type: "ASSET", category: "INVESTMENTS", subCategory: "EQUITY", parentCode: "1600" },
    
    // ===== LIABILITIES (2000-2999) =====
    // Current Liabilities (2000-2299)
    { code: "2000", name: "Accounts Payable", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "PAYABLES", isControlAccount: true },
    { code: "2010", name: "Trade Payables - Domestic", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "PAYABLES", parentCode: "2000" },
    { code: "2020", name: "Trade Payables - Import", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "PAYABLES", parentCode: "2000" },
    { code: "2030", name: "Accrued Expenses", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "PAYABLES", parentCode: "2000" },
    
    { code: "2100", name: "Short-term Borrowings", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "LOANS", isControlAccount: true },
    { code: "2110", name: "Bank Overdraft", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "LOANS", parentCode: "2100" },
    { code: "2120", name: "Working Capital Loan", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "LOANS", parentCode: "2100" },
    { code: "2130", name: "Short-term Loans", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "LOANS", parentCode: "2100" },
    
    { code: "2200", name: "Statutory Liabilities", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "STATUTORY", isControlAccount: true },
    { code: "2210", name: "GST Payable", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "STATUTORY", parentCode: "2200" },
    { code: "2211", name: "CGST Payable", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "STATUTORY", parentCode: "2210" },
    { code: "2212", name: "SGST Payable", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "STATUTORY", parentCode: "2210" },
    { code: "2213", name: "IGST Payable", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "STATUTORY", parentCode: "2210" },
    { code: "2220", name: "TDS Payable", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "STATUTORY", parentCode: "2200" },
    { code: "2230", name: "TCS Payable", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "STATUTORY", parentCode: "2200" },
    { code: "2240", name: "Professional Tax Payable", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "STATUTORY", parentCode: "2200" },
    { code: "2250", name: "Provident Fund Payable", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "STATUTORY", parentCode: "2200" },
    { code: "2260", name: "ESI Payable", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "STATUTORY", parentCode: "2200" },
    { code: "2270", name: "Income Tax Payable", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "STATUTORY", parentCode: "2200" },
    
    { code: "2280", name: "Other Current Liabilities", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "OTHER", isControlAccount: true },
    { code: "2281", name: "Advance from Customers", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "OTHER", parentCode: "2280" },
    { code: "2282", name: "Security Deposits Received", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "OTHER", parentCode: "2280" },
    { code: "2283", name: "Salary Payable", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "OTHER", parentCode: "2280" },
    { code: "2284", name: "Bonus and Incentives Payable", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "OTHER", parentCode: "2280" },
    { code: "2285", name: "Rent Payable", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "OTHER", parentCode: "2280" },
    { code: "2286", name: "Utilities Payable", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "OTHER", parentCode: "2280" },
    
    // Long-term Liabilities (2300-2599)
    { code: "2300", name: "Long-term Borrowings", type: "LIABILITY", category: "LONG_TERM_LIABILITIES", subCategory: "LOANS", isControlAccount: true },
    { code: "2310", name: "Term Loans", type: "LIABILITY", category: "LONG_TERM_LIABILITIES", subCategory: "LOANS", parentCode: "2300" },
    { code: "2320", name: "Debentures", type: "LIABILITY", category: "LONG_TERM_LIABILITIES", subCategory: "LOANS", parentCode: "2300" },
    { code: "2330", name: "Bonds Payable", type: "LIABILITY", category: "LONG_TERM_LIABILITIES", subCategory: "LOANS", parentCode: "2300" },
    
    { code: "2400", name: "Deferred Tax Liability", type: "LIABILITY", category: "LONG_TERM_LIABILITIES", subCategory: "DEFERRED", isControlAccount: true },
    { code: "2500", name: "Employee Benefits Obligation", type: "LIABILITY", category: "LONG_TERM_LIABILITIES", subCategory: "EMPLOYEE", isControlAccount: true },
    { code: "2510", name: "Gratuity Payable", type: "LIABILITY", category: "LONG_TERM_LIABILITIES", subCategory: "EMPLOYEE", parentCode: "2500" },
    { code: "2520", name: "Leave Encashment Payable", type: "LIABILITY", category: "LONG_TERM_LIABILITIES", subCategory: "EMPLOYEE", parentCode: "2500" },
    
    // ===== EQUITY (3000-3999) =====
    { code: "3000", name: "Share Capital", type: "EQUITY", category: "EQUITY", subCategory: "CAPITAL", isControlAccount: true },
    { code: "3010", name: "Equity Share Capital", type: "EQUITY", category: "EQUITY", subCategory: "CAPITAL", parentCode: "3000" },
    { code: "3020", name: "Preference Share Capital", type: "EQUITY", category: "EQUITY", subCategory: "CAPITAL", parentCode: "3000" },
    
    { code: "3100", name: "Reserves and Surplus", type: "EQUITY", category: "EQUITY", subCategory: "RESERVES", isControlAccount: true },
    { code: "3110", name: "Capital Reserve", type: "EQUITY", category: "EQUITY", subCategory: "RESERVES", parentCode: "3100" },
    { code: "3120", name: "Securities Premium", type: "EQUITY", category: "EQUITY", subCategory: "RESERVES", parentCode: "3100" },
    { code: "3130", name: "General Reserve", type: "EQUITY", category: "EQUITY", subCategory: "RESERVES", parentCode: "3100" },
    { code: "3140", name: "Revaluation Reserve", type: "EQUITY", category: "EQUITY", subCategory: "RESERVES", parentCode: "3100" },
    
    { code: "3200", name: "Retained Earnings", type: "EQUITY", category: "EQUITY", subCategory: "RETAINED_EARNINGS", isControlAccount: true },
    { code: "3210", name: "Retained Earnings - Current Year", type: "EQUITY", category: "EQUITY", subCategory: "RETAINED_EARNINGS", parentCode: "3200" },
    { code: "3220", name: "Retained Earnings - Previous Years", type: "EQUITY", category: "EQUITY", subCategory: "RETAINED_EARNINGS", parentCode: "3200" },
    
    { code: "3300", name: "Drawings", type: "EQUITY", category: "EQUITY", subCategory: "DRAWINGS", isControlAccount: true },
    
    // ===== INCOME (4000-4999) =====
    { code: "4000", name: "Operating Revenue", type: "INCOME", category: "OPERATING_INCOME", subCategory: "REVENUE", isControlAccount: true },
    { code: "4010", name: "Course Fees - Domestic", type: "INCOME", category: "OPERATING_INCOME", subCategory: "REVENUE", parentCode: "4000" },
    { code: "4020", name: "Training Revenue", type: "INCOME", category: "OPERATING_INCOME", subCategory: "REVENUE", parentCode: "4000" },
    { code: "4030", name: "Certification Fees", type: "INCOME", category: "OPERATING_INCOME", subCategory: "REVENUE", parentCode: "4000" },
    { code: "4040", name: "Placement Services Revenue", type: "INCOME", category: "OPERATING_INCOME", subCategory: "REVENUE", parentCode: "4000" },
    { code: "4050", name: "Consulting Revenue", type: "INCOME", category: "OPERATING_INCOME", subCategory: "REVENUE", parentCode: "4000" },
    
    { code: "4100", name: "Other Operating Income", type: "INCOME", category: "OPERATING_INCOME", subCategory: "OTHER", isControlAccount: true },
    { code: "4110", name: "Registration Fees", type: "INCOME", category: "OPERATING_INCOME", subCategory: "OTHER", parentCode: "4100" },
    { code: "4120", name: "Material Sales", type: "INCOME", category: "OPERATING_INCOME", subCategory: "OTHER", parentCode: "4100" },
    
    { code: "4500", name: "Other Income", type: "INCOME", category: "OTHER_INCOME", subCategory: "OTHER", isControlAccount: true },
    { code: "4510", name: "Interest Income", type: "INCOME", category: "OTHER_INCOME", subCategory: "OTHER", parentCode: "4500" },
    { code: "4520", name: "Dividend Income", type: "INCOME", category: "OTHER_INCOME", subCategory: "OTHER", parentCode: "4500" },
    { code: "4530", name: "Gain on Sale of Assets", type: "INCOME", category: "OTHER_INCOME", subCategory: "OTHER", parentCode: "4500" },
    { code: "4540", name: "Foreign Exchange Gain", type: "INCOME", category: "OTHER_INCOME", subCategory: "OTHER", parentCode: "4500" },
    { code: "4550", name: "Miscellaneous Income", type: "INCOME", category: "OTHER_INCOME", subCategory: "OTHER", parentCode: "4500" },
    
    // ===== EXPENSES (5000-5999) =====
    // Direct Expenses / Cost of Revenue (5000-5299)
    { code: "5000", name: "Cost of Training Delivery", type: "EXPENSE", category: "DIRECT_EXPENSES", subCategory: "COST_OF_REVENUE", isControlAccount: true },
    { code: "5010", name: "Trainer Fees", type: "EXPENSE", category: "DIRECT_EXPENSES", subCategory: "COST_OF_REVENUE", parentCode: "5000" },
    { code: "5020", name: "Course Materials", type: "EXPENSE", category: "DIRECT_EXPENSES", subCategory: "COST_OF_REVENUE", parentCode: "5000" },
    { code: "5030", name: "Lab and Infrastructure Costs", type: "EXPENSE", category: "DIRECT_EXPENSES", subCategory: "COST_OF_REVENUE", parentCode: "5000" },
    { code: "5040", name: "Software Licenses for Training", type: "EXPENSE", category: "DIRECT_EXPENSES", subCategory: "COST_OF_REVENUE", parentCode: "5000" },
    
    // Operating Expenses (5300-5899)
    { code: "5300", name: "Employee Benefits Expense", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "PERSONNEL", isControlAccount: true },
    { code: "5310", name: "Salaries and Wages", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "PERSONNEL", parentCode: "5300" },
    { code: "5320", name: "Bonus and Incentives", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "PERSONNEL", parentCode: "5300" },
    { code: "5330", name: "Gratuity Expense", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "PERSONNEL", parentCode: "5300" },
    { code: "5340", name: "Provident Fund Contribution", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "PERSONNEL", parentCode: "5300" },
    { code: "5350", name: "ESI Contribution", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "PERSONNEL", parentCode: "5300" },
    { code: "5360", name: "Staff Welfare", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "PERSONNEL", parentCode: "5300" },
    { code: "5370", name: "Training and Development", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "PERSONNEL", parentCode: "5300" },
    
    { code: "5400", name: "Administrative Expenses", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "ADMINISTRATIVE", isControlAccount: true },
    { code: "5410", name: "Rent Expense", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "ADMINISTRATIVE", parentCode: "5400" },
    { code: "5420", name: "Electricity and Water", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "ADMINISTRATIVE", parentCode: "5400" },
    { code: "5430", name: "Telephone and Internet", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "ADMINISTRATIVE", parentCode: "5400" },
    { code: "5440", name: "Office Supplies", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "ADMINISTRATIVE", parentCode: "5400" },
    { code: "5450", name: "Printing and Stationery", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "ADMINISTRATIVE", parentCode: "5400" },
    { code: "5460", name: "Insurance", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "ADMINISTRATIVE", parentCode: "5400" },
    { code: "5470", name: "Repairs and Maintenance", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "ADMINISTRATIVE", parentCode: "5400" },
    { code: "5480", name: "Housekeeping and Cleaning", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "ADMINISTRATIVE", parentCode: "5400" },
    { code: "5490", name: "Security Services", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "ADMINISTRATIVE", parentCode: "5400" },
    
    { code: "5500", name: "Selling and Marketing Expenses", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "MARKETING", isControlAccount: true },
    { code: "5510", name: "Advertising and Promotion", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "MARKETING", parentCode: "5500" },
    { code: "5520", name: "Digital Marketing", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "MARKETING", parentCode: "5500" },
    { code: "5530", name: "Sales Commission", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "MARKETING", parentCode: "5500" },
    { code: "5540", name: "Business Development", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "MARKETING", parentCode: "5500" },
    { code: "5550", name: "Branding and PR", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "MARKETING", parentCode: "5500" },
    
    { code: "5600", name: "Technology and IT Expenses", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "TECHNOLOGY", isControlAccount: true },
    { code: "5610", name: "Software Subscriptions", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "TECHNOLOGY", parentCode: "5600" },
    { code: "5620", name: "Website and Hosting", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "TECHNOLOGY", parentCode: "5600" },
    { code: "5630", name: "IT Support and Maintenance", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "TECHNOLOGY", parentCode: "5600" },
    { code: "5640", name: "Cloud Services", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "TECHNOLOGY", parentCode: "5600" },
    
    { code: "5700", name: "Professional Fees", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "PROFESSIONAL", isControlAccount: true },
    { code: "5710", name: "Legal and Professional Fees", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "PROFESSIONAL", parentCode: "5700" },
    { code: "5720", name: "Audit Fees", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "PROFESSIONAL", parentCode: "5700" },
    { code: "5730", name: "Consultancy Fees", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "PROFESSIONAL", parentCode: "5700" },
    { code: "5740", name: "License and Registration Fees", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "PROFESSIONAL", parentCode: "5700" },
    
    { code: "5800", name: "Travel and Conveyance", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "TRAVEL", isControlAccount: true },
    { code: "5810", name: "Domestic Travel", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "TRAVEL", parentCode: "5800" },
    { code: "5820", name: "International Travel", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "TRAVEL", parentCode: "5800" },
    { code: "5830", name: "Local Conveyance", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "TRAVEL", parentCode: "5800" },
    { code: "5840", name: "Vehicle Running and Maintenance", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "TRAVEL", parentCode: "5800" },
    
    // Financial Expenses (5900-5999)
    { code: "5900", name: "Finance Costs", type: "EXPENSE", category: "FINANCIAL_EXPENSES", subCategory: "INTEREST", isControlAccount: true },
    { code: "5910", name: "Interest on Loans", type: "EXPENSE", category: "FINANCIAL_EXPENSES", subCategory: "INTEREST", parentCode: "5900" },
    { code: "5920", name: "Bank Charges", type: "EXPENSE", category: "FINANCIAL_EXPENSES", subCategory: "INTEREST", parentCode: "5900" },
    { code: "5930", name: "Foreign Exchange Loss", type: "EXPENSE", category: "FINANCIAL_EXPENSES", subCategory: "INTEREST", parentCode: "5900" },
    
    // Depreciation and Amortization (6000-6099)
    { code: "6000", name: "Depreciation and Amortization", type: "EXPENSE", category: "DEPRECIATION", subCategory: "DEPRECIATION", isControlAccount: true },
    { code: "6010", name: "Depreciation - Buildings", type: "EXPENSE", category: "DEPRECIATION", subCategory: "DEPRECIATION", parentCode: "6000" },
    { code: "6020", name: "Depreciation - Machinery", type: "EXPENSE", category: "DEPRECIATION", subCategory: "DEPRECIATION", parentCode: "6000" },
    { code: "6030", name: "Depreciation - Furniture", type: "EXPENSE", category: "DEPRECIATION", subCategory: "DEPRECIATION", parentCode: "6000" },
    { code: "6040", name: "Depreciation - Vehicles", type: "EXPENSE", category: "DEPRECIATION", subCategory: "DEPRECIATION", parentCode: "6000" },
    { code: "6050", name: "Amortization - Intangible Assets", type: "EXPENSE", category: "DEPRECIATION", subCategory: "DEPRECIATION", parentCode: "6000" },
    
    // Tax Expenses (6100-6199)
    { code: "6100", name: "Tax Expense", type: "EXPENSE", category: "TAX", subCategory: "INCOME_TAX", isControlAccount: true },
    { code: "6110", name: "Current Tax", type: "EXPENSE", category: "TAX", subCategory: "INCOME_TAX", parentCode: "6100" },
    { code: "6120", name: "Deferred Tax", type: "EXPENSE", category: "TAX", subCategory: "INCOME_TAX", parentCode: "6100" },
    
    // Other Expenses (6200-6299)
    { code: "6200", name: "Other Expenses", type: "EXPENSE", category: "OTHER_EXPENSES", subCategory: "OTHER", isControlAccount: true },
    { code: "6210", name: "Loss on Sale of Assets", type: "EXPENSE", category: "OTHER_EXPENSES", subCategory: "OTHER", parentCode: "6200" },
    { code: "6220", name: "Donation and CSR", type: "EXPENSE", category: "OTHER_EXPENSES", subCategory: "OTHER", parentCode: "6200" },
    { code: "6230", name: "Penalties and Fines", type: "EXPENSE", category: "OTHER_EXPENSES", subCategory: "OTHER", parentCode: "6200" },
    { code: "6240", name: "Bad Debts Written Off", type: "EXPENSE", category: "OTHER_EXPENSES", subCategory: "OTHER", parentCode: "6200" },
    { code: "6250", name: "Miscellaneous Expenses", type: "EXPENSE", category: "OTHER_EXPENSES", subCategory: "OTHER", parentCode: "6200" },
  ]

  let accountsCreated = 0
  for (const account of chartOfAccounts) {
    try {
      await prisma.chart_of_accounts.upsert({
        where: { accountCode: account.code },
        update: {},
        create: {
          id: uuidv4(),
          accountCode: account.code,
          accountName: account.name,
          accountType: account.type as any,
          accountCategory: account.category as any,
          accountSubCategory: account.subCategory as any,
          parentAccountId: account.parentCode || null,
          isControlAccount: account.isControlAccount || false,
          openingBalance: 0,
          currentBalance: 0,
          isActive: true,
          isSystemAccount: true,
          allowPosting: !account.isControlAccount,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
      accountsCreated++
    } catch (error) {
      console.error(`Error creating account ${account.code}:`, error)
    }
  }

  console.log(`✅ ${accountsCreated} chart of accounts created`)

  // Seed batches
  const courses = await prisma.courses.findMany({ take: 3 })
  
  if (courses.length > 0) {
    const batches = []
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i]
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() + i)
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 3)

      batches.push({
        id: uuidv4(),
        code: `BATCH-${course.code}-${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`,
        courseId: course.id,
        startDate,
        endDate,
        maxCapacity: 30,
        currentStrength: 0,
        updatedAt: new Date(),
      })
    }

    for (const batch of batches) {
      await prisma.batches.upsert({
        where: { code: batch.code },
        update: {},
        create: batch,
      })
    }

    console.log(`✅ ${batches.length} batches seeded`)

    // Refetch batches to get the correct IDs from the database
    const createdBatches = await prisma.batches.findMany({
      orderBy: { startDate: 'desc' },
      take: 3
    })

    // Seed enrollments
    const students = await prisma.students.findMany({
      where: {
        status: { not: 'INQUIRY' }
      },
      orderBy: { createdAt: 'desc' }
    })
    const centers = await prisma.centers.findMany()
    const adminUser = await prisma.users.findFirst({
      where: { role: 'SUPER_ADMIN' }
    })

    if (students.length > 0 && centers.length > 0 && createdBatches.length > 0 && adminUser) {
      const enrollments = []
      const statuses = ['ACTIVE', 'APPROVED', 'PENDING', 'COMPLETED', 'ACTIVE', 'APPROVED']
      const paymentStatuses = ['PAID', 'PARTIAL', 'PENDING', 'PAID', 'PARTIAL']
      
      // Create enrollments for available students
      const numEnrollments = Math.min(students.length, 10)
      
      for (let i = 0; i < numEnrollments; i++) {
        const student = students[i]
        const course = courses[i % courses.length]
        const batch = createdBatches[i % createdBatches.length]
        const center = centers[i % centers.length]
        const enrollmentDate = new Date()
        enrollmentDate.setDate(enrollmentDate.getDate() - (i * 7))

        const fees = course.fees || (20000 + Math.random() * 30000)
        
        // Vary payment amounts based on payment status
        let paidAmount = 0
        const paymentStatus = paymentStatuses[i % paymentStatuses.length]
        
        if (paymentStatus === 'PAID') {
          paidAmount = fees
        } else if (paymentStatus === 'PARTIAL') {
          paidAmount = Math.floor(fees * (0.3 + Math.random() * 0.5))
        } else {
          paidAmount = 0
        }

        const startDate = new Date(enrollmentDate)
        startDate.setDate(startDate.getDate() + 7)

        enrollments.push({
          id: uuidv4(),
          enrollmentNumber: `ENR${String(i + 1001).padStart(6, '0')}`,
          studentId: student.id,
          courseId: course.id,
          batchId: batch.id,
          centerId: center.id,
          enrollmentDate,
          startDate,
          status: statuses[i % statuses.length] as any,
          totalFees: Math.round(fees),
          paidAmount: Math.round(paidAmount),
          paymentStatus: paymentStatus as any,
          createdById: adminUser.id,
          createdAt: enrollmentDate,
          updatedAt: new Date(),
        })
      }

      let createdCount = 0
      for (const enrollment of enrollments) {
        const result = await prisma.enrollments.upsert({
          where: { enrollmentNumber: enrollment.enrollmentNumber },
          update: {},
          create: enrollment,
        })
        if (result) createdCount++
      }

      console.log(`✅ ${createdCount} enrollments seeded`)
    }
  }

  // Seed Central Warehouse (Unallocated Inventory Pool)
  console.log("🏢 Seeding Central Warehouse...")
  const centralWarehouse = await prisma.centers.upsert({
    where: { code: "CENTRAL-WH" },
    update: {},
    create: {
      id: uuidv4(),
      code: "CENTRAL-WH",
      name: "Central Warehouse (Unallocated)",
      address: "Head Office",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      phone: "+91 22 1234 5678",
      email: "warehouse@asdc.com",
      capacity: 9999,
      status: "ACTIVE",
      updatedAt: new Date(),
    },
  })
  console.log(`✅ Central Warehouse created: ${centralWarehouse.name}`)

  console.log("🎉 Database seed completed successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
