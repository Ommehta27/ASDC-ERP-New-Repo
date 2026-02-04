import { PrismaClient } from "@prisma/client"
import { randomUUID } from "crypto"

const prisma = new PrismaClient()
const uuidv4 = randomUUID

async function main() {
  console.log("💰 Seeding Comprehensive Chart of Accounts (Indian Standards)...")

  const accounts = [
    // ASSETS - Current Assets
    { code: "1000", name: "Cash and Cash Equivalents", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "CASH_AND_BANK", isControl: true },
    { code: "1010", name: "Cash on Hand", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "CASH_AND_BANK" },
    { code: "1020", name: "Petty Cash", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "CASH_AND_BANK" },
    { code: "1100", name: "Bank Accounts", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "CASH_AND_BANK", isControl: true },
    { code: "1110", name: "Current Account - HDFC", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "CASH_AND_BANK" },
    { code: "1120", name: "Current Account - ICICI", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "CASH_AND_BANK" },
    { code: "1130", name: "Savings Account", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "CASH_AND_BANK" },
    
    { code: "1200", name: "Accounts Receivable", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "ACCOUNTS_RECEIVABLE", isControl: true },
    { code: "1210", name: "Trade Receivables - Domestic", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "ACCOUNTS_RECEIVABLE" },
    { code: "1220", name: "Trade Receivables - Export", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "ACCOUNTS_RECEIVABLE" },
    
    { code: "1250", name: "Prepaid Expenses", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "PREPAID_EXPENSES" },
    { code: "1260", name: "Advance to Suppliers", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "ADVANCE_TO_SUPPLIERS" },
    { code: "1270", name: "GST Input Credit", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "ADVANCE_TO_SUPPLIERS" },
    { code: "1271", name: "CGST Receivable", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "ADVANCE_TO_SUPPLIERS" },
    { code: "1272", name: "SGST Receivable", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "ADVANCE_TO_SUPPLIERS" },
    { code: "1273", name: "IGST Receivable", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "ADVANCE_TO_SUPPLIERS" },
    { code: "1280", name: "TDS Receivable", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "ADVANCE_TO_SUPPLIERS" },
    
    { code: "1300", name: "Inventory", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "INVENTORY", isControl: true },
    { code: "1310", name: "Raw Materials", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "INVENTORY" },
    { code: "1320", name: "Finished Goods", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "INVENTORY" },
    { code: "1330", name: "Consumables", type: "ASSET", category: "CURRENT_ASSETS", subCategory: "INVENTORY" },
    
    // ASSETS - Fixed Assets
    { code: "1400", name: "Land and Buildings", type: "ASSET", category: "FIXED_ASSETS", subCategory: "LAND_AND_BUILDING" },
    { code: "1450", name: "Plant and Machinery", type: "ASSET", category: "FIXED_ASSETS", subCategory: "PLANT_AND_MACHINERY" },
    { code: "1500", name: "Furniture and Fixtures", type: "ASSET", category: "FIXED_ASSETS", subCategory: "FURNITURE_AND_FIXTURES" },
    { code: "1550", name: "Vehicles", type: "ASSET", category: "FIXED_ASSETS", subCategory: "VEHICLES" },
    { code: "1600", name: "Computers and IT Equipment", type: "ASSET", category: "FIXED_ASSETS", subCategory: "COMPUTER_EQUIPMENT" },
    { code: "1650", name: "Office Equipment", type: "ASSET", category: "FIXED_ASSETS", subCategory: "OFFICE_EQUIPMENT" },
    
    // ASSETS - Intangible Assets
    { code: "1700", name: "Goodwill", type: "ASSET", category: "INTANGIBLE_ASSETS", subCategory: "GOODWILL" },
    { code: "1750", name: "Software and Licenses", type: "ASSET", category: "INTANGIBLE_ASSETS", subCategory: "SOFTWARE" },
    { code: "1760", name: "Patents", type: "ASSET", category: "INTANGIBLE_ASSETS", subCategory: "PATENTS" },
    { code: "1770", name: "Trademarks", type: "ASSET", category: "INTANGIBLE_ASSETS", subCategory: "TRADEMARKS" },
    
    // LIABILITIES - Current Liabilities
    { code: "2000", name: "Accounts Payable", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "ACCOUNTS_PAYABLE", isControl: true },
    { code: "2010", name: "Trade Payables - Domestic", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "ACCOUNTS_PAYABLE" },
    { code: "2020", name: "Trade Payables - Import", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "ACCOUNTS_PAYABLE" },
    { code: "2030", name: "Accrued Expenses", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "OUTSTANDING_EXPENSES" },
    
    { code: "2100", name: "Short-term Loans", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "SHORT_TERM_LOANS", isControl: true },
    { code: "2110", name: "Bank Overdraft", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "SHORT_TERM_LOANS" },
    { code: "2120", name: "Working Capital Loan", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "SHORT_TERM_LOANS" },
    
    { code: "2200", name: "GST Payable", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "GST_PAYABLE", isControl: true },
    { code: "2210", name: "CGST Payable", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "GST_PAYABLE" },
    { code: "2220", name: "SGST Payable", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "GST_PAYABLE" },
    { code: "2230", name: "IGST Payable", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "GST_PAYABLE" },
    { code: "2240", name: "TDS Payable", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "TDS_PAYABLE" },
    { code: "2250", name: "TCS Payable", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "TCS_PAYABLE" },
    { code: "2260", name: "Provident Fund Payable", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "TAX_PAYABLE" },
    { code: "2270", name: "ESI Payable", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "TAX_PAYABLE" },
    { code: "2280", name: "Professional Tax Payable", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "PROFESSIONAL_TAX" },
    
    { code: "2300", name: "Other Current Liabilities", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "OUTSTANDING_EXPENSES" },
    { code: "2310", name: "Advance from Customers", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "ADVANCE_FROM_CUSTOMERS" },
    { code: "2320", name: "Salary Payable", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "OUTSTANDING_EXPENSES" },
    { code: "2330", name: "Rent Payable", type: "LIABILITY", category: "CURRENT_LIABILITIES", subCategory: "OUTSTANDING_EXPENSES" },
    
    // LIABILITIES - Non-Current Liabilities
    { code: "2400", name: "Long-term Loans", type: "LIABILITY", category: "NON_CURRENT_LIABILITIES", subCategory: "LONG_TERM_LOANS", isControl: true },
    { code: "2410", name: "Term Loans", type: "LIABILITY", category: "NON_CURRENT_LIABILITIES", subCategory: "LONG_TERM_LOANS" },
    { code: "2420", name: "Debentures", type: "LIABILITY", category: "NON_CURRENT_LIABILITIES", subCategory: "BONDS_PAYABLE" },
    
    { code: "2500", name: "Employee Benefits Obligation", type: "LIABILITY", category: "PROVISIONS", subCategory: "PROVISION_FOR_GRATUITY" },
    { code: "2510", name: "Gratuity Payable", type: "LIABILITY", category: "PROVISIONS", subCategory: "PROVISION_FOR_GRATUITY" },
    { code: "2520", name: "Leave Encashment", type: "LIABILITY", category: "PROVISIONS", subCategory: "PROVISION_FOR_LEAVE" },
    
    // EQUITY
    { code: "3000", name: "Equity Share Capital", type: "EQUITY", category: "SHARE_CAPITAL", subCategory: "EQUITY_SHARE_CAPITAL" },
    { code: "3010", name: "Preference Share Capital", type: "EQUITY", category: "SHARE_CAPITAL", subCategory: "PREFERENCE_SHARE_CAPITAL" },
    
    { code: "3100", name: "Reserves and Surplus", type: "EQUITY", category: "RESERVES_AND_SURPLUS", subCategory: "GENERAL_RESERVE", isControl: true },
    { code: "3110", name: "Capital Reserve", type: "EQUITY", category: "RESERVES_AND_SURPLUS", subCategory: "CAPITAL_RESERVE" },
    { code: "3120", name: "Securities Premium", type: "EQUITY", category: "RESERVES_AND_SURPLUS", subCategory: "SECURITIES_PREMIUM" },
    { code: "3130", name: "General Reserve", type: "EQUITY", category: "RESERVES_AND_SURPLUS", subCategory: "GENERAL_RESERVE" },
    
    { code: "3200", name: "Retained Earnings", type: "EQUITY", category: "RETAINED_EARNINGS", subCategory: "PROFIT_AND_LOSS_ACCOUNT" },
    
    // INCOME - Operating Income
    { code: "4000", name: "Course Fees Revenue", type: "INCOME", category: "OPERATING_INCOME", subCategory: "SALES_REVENUE", isControl: true },
    { code: "4010", name: "Training Fees - Domestic", type: "INCOME", category: "OPERATING_INCOME", subCategory: "SALES_REVENUE" },
    { code: "4020", name: "Certification Fees", type: "INCOME", category: "OPERATING_INCOME", subCategory: "SALES_REVENUE" },
    { code: "4030", name: "Placement Services Revenue", type: "INCOME", category: "OPERATING_INCOME", subCategory: "SERVICE_REVENUE" },
    { code: "4040", name: "Consulting Revenue", type: "INCOME", category: "OPERATING_INCOME", subCategory: "SERVICE_REVENUE" },
    
    { code: "4500", name: "Other Income", type: "INCOME", category: "OTHER_INCOME", subCategory: "MISCELLANEOUS_INCOME", isControl: true },
    { code: "4510", name: "Interest Income", type: "INCOME", category: "OTHER_INCOME", subCategory: "INTEREST_INCOME" },
    { code: "4520", name: "Dividend Income", type: "INCOME", category: "OTHER_INCOME", subCategory: "DIVIDEND_INCOME" },
    { code: "4530", name: "Gain on Sale of Assets", type: "INCOME", category: "OTHER_INCOME", subCategory: "CAPITAL_GAINS" },
    
    // EXPENSES - Direct Expenses
    { code: "5000", name: "Cost of Training Delivery", type: "EXPENSE", category: "DIRECT_EXPENSES", subCategory: "TRAINING_MATERIALS", isControl: true },
    { code: "5010", name: "Trainer Fees", type: "EXPENSE", category: "DIRECT_EXPENSES", subCategory: "DIRECT_LABOR" },
    { code: "5020", name: "Course Materials", type: "EXPENSE", category: "DIRECT_EXPENSES", subCategory: "COURSE_MATERIALS" },
    { code: "5030", name: "Lab Infrastructure Costs", type: "EXPENSE", category: "DIRECT_EXPENSES", subCategory: "TRAINING_MATERIALS" },
    
    // EXPENSES - Operating Expenses
    { code: "5300", name: "Salaries and Wages", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "SALARIES_AND_WAGES", isControl: true },
    { code: "5310", name: "Employee Salaries", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "SALARIES_AND_WAGES" },
    { code: "5320", name: "Bonus and Incentives", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "SALARIES_AND_WAGES" },
    { code: "5330", name: "PF Contribution", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "SALARIES_AND_WAGES" },
    { code: "5340", name: "ESI Contribution", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "SALARIES_AND_WAGES" },
    { code: "5350", name: "Gratuity Expense", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "SALARIES_AND_WAGES" },
    
    { code: "5400", name: "Rent Expense", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "RENT" },
    { code: "5450", name: "Electricity and Utilities", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "UTILITIES" },
    { code: "5500", name: "Repairs and Maintenance", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "REPAIRS_AND_MAINTENANCE" },
    { code: "5550", name: "Insurance", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "INSURANCE" },
    { code: "5600", name: "Office Supplies", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "OFFICE_SUPPLIES" },
    { code: "5650", name: "Telephone and Internet", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "COMMUNICATION" },
    
    { code: "5700", name: "Advertising and Marketing", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "MARKETING_AND_ADVERTISING" },
    { code: "5710", name: "Digital Marketing", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "MARKETING_AND_ADVERTISING" },
    { code: "5720", name: "Sales Promotion", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "MARKETING_AND_ADVERTISING" },
    
    { code: "5800", name: "Travel and Conveyance", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "TRAVEL_AND_CONVEYANCE" },
    { code: "5850", name: "Professional Fees", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "PROFESSIONAL_FEES" },
    { code: "5860", name: "Legal Fees", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "LEGAL_FEES" },
    { code: "5870", name: "Audit Fees", type: "EXPENSE", category: "OPERATING_EXPENSES", subCategory: "AUDIT_FEES" },
    
    // EXPENSES - Financial Expenses
    { code: "5900", name: "Interest Expense", type: "EXPENSE", category: "FINANCIAL_EXPENSES", subCategory: "INTEREST_EXPENSE", isControl: true },
    { code: "5910", name: "Interest on Loans", type: "EXPENSE", category: "FINANCIAL_EXPENSES", subCategory: "INTEREST_EXPENSE" },
    { code: "5920", name: "Bank Charges", type: "EXPENSE", category: "FINANCIAL_EXPENSES", subCategory: "BANK_CHARGES" },
    
    // EXPENSES - Depreciation
    { code: "6000", name: "Depreciation Expense", type: "EXPENSE", category: "DEPRECIATION_AMORTIZATION", subCategory: "DEPRECIATION", isControl: true },
    { code: "6010", name: "Depreciation - Buildings", type: "EXPENSE", category: "DEPRECIATION_AMORTIZATION", subCategory: "DEPRECIATION" },
    { code: "6020", name: "Depreciation - Machinery", type: "EXPENSE", category: "DEPRECIATION_AMORTIZATION", subCategory: "DEPRECIATION" },
    { code: "6030", name: "Depreciation - Furniture", type: "EXPENSE", category: "DEPRECIATION_AMORTIZATION", subCategory: "DEPRECIATION" },
    { code: "6040", name: "Depreciation - Vehicles", type: "EXPENSE", category: "DEPRECIATION_AMORTIZATION", subCategory: "DEPRECIATION" },
    { code: "6050", name: "Amortization - Intangibles", type: "EXPENSE", category: "DEPRECIATION_AMORTIZATION", subCategory: "AMORTIZATION" },
    
    // EXPENSES - Tax
    { code: "6100", name: "Income Tax Expense", type: "EXPENSE", category: "TAX_EXPENSES", subCategory: "INCOME_TAX" },
    { code: "6110", name: "Current Tax", type: "EXPENSE", category: "TAX_EXPENSES", subCategory: "INCOME_TAX" },
    { code: "6120", name: "Deferred Tax", type: "EXPENSE", category: "TAX_EXPENSES", subCategory: "INCOME_TAX" },
  ]

  let created = 0
  let failed = 0

  for (const acc of accounts) {
    try {
      await prisma.chart_of_accounts.upsert({
        where: { accountCode: acc.code },
        update: {},
        create: {
          id: uuidv4(),
          accountCode: acc.code,
          accountName: acc.name,
          accountType: acc.type as any,
          accountCategory: acc.category as any,
          accountSubCategory: acc.subCategory as any,
          isControlAccount: acc.isControl || false,
          isSystemAccount: true,
          allowPosting: !(acc.isControl || false),
          openingBalance: 0,
          currentBalance: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
      created++
    } catch (error: any) {
      console.error(`Failed to create ${acc.code} - ${acc.name}:`, error.message)
      failed++
    }
  }

  console.log(`✅ Successfully created ${created} chart of accounts`)
  if (failed > 0) {
    console.log(`⚠️  Failed to create ${failed} accounts`)
  }
}

main()
  .catch((e) => {
    console.error("❌ Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
