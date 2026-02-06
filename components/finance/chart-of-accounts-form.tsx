"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Building2, 
  FileText, 
  Calculator, 
  Shield, 
  Settings, 
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from "lucide-react"

const formSchema = z.object({
  accountCode: z.string().min(1, "Account code is required").regex(/^[A-Z0-9-]+$/, "Use uppercase letters, numbers, and hyphens only"),
  accountName: z.string().min(2, "Account name must be at least 2 characters"),
  accountType: z.enum(["ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"]),
  accountCategory: z.string().min(1, "Account category is required"),
  accountSubCategory: z.string().optional(),
  parentAccountId: z.string().optional(),
  description: z.string().optional(),
  
  // GST Configuration
  gstApplicable: z.boolean(),
  gstRate: z.string().optional(),
  hsnSacCode: z.string().optional(),
  
  // TDS Configuration
  tdsApplicable: z.boolean(),
  tdsSection: z.string().optional(),
  tdsRate: z.string().optional(),
  
  // TCS Configuration
  tcsApplicable: z.boolean(),
  tcsSection: z.string().optional(),
  tcsRate: z.string().optional(),
  
  // Opening Balance
  openingBalance: z.string(),
  openingBalanceType: z.enum(["DEBIT", "CREDIT"]),
  
  // Budget
  budgetAmount: z.string().optional(),
  budgetPeriod: z.string().optional(),
  
  // Account Controls
  isControlAccount: z.boolean(),
  allowPosting: z.boolean(),
  requiresReconciliation: z.boolean(),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface ChartOfAccountsFormProps {
  initialData?: any
}

const accountCategories = {
  ASSET: [
    { value: "CURRENT_ASSETS", label: "Current Assets" },
    { value: "FIXED_ASSETS", label: "Fixed Assets" },
    { value: "INTANGIBLE_ASSETS", label: "Intangible Assets" },
    { value: "INVESTMENTS", label: "Investments" },
    { value: "OTHER_ASSETS", label: "Other Assets" },
  ],
  LIABILITY: [
    { value: "CURRENT_LIABILITIES", label: "Current Liabilities" },
    { value: "NON_CURRENT_LIABILITIES", label: "Non-Current Liabilities" },
    { value: "PROVISIONS", label: "Provisions" },
  ],
  EQUITY: [
    { value: "SHARE_CAPITAL", label: "Share Capital" },
    { value: "RESERVES_AND_SURPLUS", label: "Reserves & Surplus" },
    { value: "RETAINED_EARNINGS", label: "Retained Earnings" },
  ],
  INCOME: [
    { value: "OPERATING_INCOME", label: "Operating Income" },
    { value: "NON_OPERATING_INCOME", label: "Non-Operating Income" },
    { value: "OTHER_INCOME", label: "Other Income" },
  ],
  EXPENSE: [
    { value: "DIRECT_EXPENSES", label: "Direct Expenses" },
    { value: "INDIRECT_EXPENSES", label: "Indirect Expenses" },
    { value: "OPERATING_EXPENSES", label: "Operating Expenses" },
    { value: "FINANCIAL_EXPENSES", label: "Financial Expenses" },
    { value: "DEPRECIATION_AMORTIZATION", label: "Depreciation & Amortization" },
    { value: "TAX_EXPENSES", label: "Tax Expenses" },
  ],
}

const accountSubCategories = {
  CURRENT_ASSETS: [
    { value: "CASH_AND_BANK", label: "Cash & Bank" },
    { value: "ACCOUNTS_RECEIVABLE", label: "Accounts Receivable" },
    { value: "INVENTORY", label: "Inventory" },
    { value: "PREPAID_EXPENSES", label: "Prepaid Expenses" },
    { value: "SHORT_TERM_INVESTMENTS", label: "Short-term Investments" },
    { value: "ADVANCE_TO_SUPPLIERS", label: "Advance to Suppliers" },
  ],
  FIXED_ASSETS: [
    { value: "LAND_AND_BUILDING", label: "Land & Building" },
    { value: "PLANT_AND_MACHINERY", label: "Plant & Machinery" },
    { value: "FURNITURE_AND_FIXTURES", label: "Furniture & Fixtures" },
    { value: "VEHICLES", label: "Vehicles" },
    { value: "COMPUTER_EQUIPMENT", label: "Computer Equipment" },
    { value: "OFFICE_EQUIPMENT", label: "Office Equipment" },
    { value: "LEASEHOLD_IMPROVEMENTS", label: "Leasehold Improvements" },
  ],
  INTANGIBLE_ASSETS: [
    { value: "GOODWILL", label: "Goodwill" },
    { value: "PATENTS", label: "Patents" },
    { value: "TRADEMARKS", label: "Trademarks" },
    { value: "SOFTWARE", label: "Software" },
    { value: "LICENSES", label: "Licenses" },
    { value: "COPYRIGHTS", label: "Copyrights" },
  ],
  INVESTMENTS: [
    { value: "LONG_TERM_INVESTMENTS", label: "Long-term Investments" },
  ],
  CURRENT_LIABILITIES: [
    { value: "ACCOUNTS_PAYABLE", label: "Accounts Payable" },
    { value: "SHORT_TERM_LOANS", label: "Short-term Loans" },
    { value: "ACCRUED_EXPENSES", label: "Accrued Expenses" },
    { value: "UNEARNED_REVENUE", label: "Unearned Revenue" },
    { value: "TAX_PAYABLE", label: "Tax Payable" },
  ],
  NON_CURRENT_LIABILITIES: [
    { value: "LONG_TERM_LOANS", label: "Long-term Loans" },
    { value: "BONDS_PAYABLE", label: "Bonds Payable" },
    { value: "DEFERRED_TAX", label: "Deferred Tax Liability" },
  ],
}

const tdseSections = [
  { value: "194C", label: "194C - Payment to Contractors" },
  { value: "194H", label: "194H - Commission or Brokerage" },
  { value: "194I", label: "194I - Rent" },
  { value: "194J", label: "194J - Professional Services" },
  { value: "194Q", label: "194Q - Purchase of Goods" },
  { value: "195", label: "195 - Payment to Non-Residents" },
]

const tcsSections = [
  { value: "206C(1)", label: "206C(1) - Sale of Goods" },
  { value: "206C(1H)", label: "206C(1H) - Sale of Motor Vehicles" },
]

const budgetPeriods = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "HALF_YEARLY", label: "Half-Yearly" },
  { value: "ANNUALLY", label: "Annually" },
]

export function ChartOfAccountsForm({ initialData }: ChartOfAccountsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [parentAccounts, setParentAccounts] = useState<any[]>([])
  const [filteredCategories, setFilteredCategories] = useState<any[]>([])
  const [filteredSubCategories, setFilteredSubCategories] = useState<any[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountCode: initialData?.accountCode || "",
      accountName: initialData?.accountName || "",
      accountType: initialData?.accountType || "ASSET",
      accountCategory: initialData?.accountCategory || "",
      accountSubCategory: initialData?.accountSubCategory || undefined,
      parentAccountId: initialData?.parentAccountId || undefined,
      description: initialData?.description || "",
      gstApplicable: initialData?.gstApplicable ?? false,
      gstRate: initialData?.gstRate?.toString() || undefined,
      hsnSacCode: initialData?.hsnSacCode || undefined,
      tdsApplicable: initialData?.tdsApplicable ?? false,
      tdsSection: initialData?.tdsSection || undefined,
      tdsRate: initialData?.tdsRate?.toString() || undefined,
      tcsApplicable: initialData?.tcsApplicable ?? false,
      tcsSection: initialData?.tcsSection || undefined,
      tcsRate: initialData?.tcsRate?.toString() || undefined,
      openingBalance: initialData?.openingBalance?.toString() || "0",
      openingBalanceType: initialData?.openingBalanceType || "DEBIT",
      budgetAmount: initialData?.budgetAmount?.toString() || undefined,
      budgetPeriod: initialData?.budgetPeriod || undefined,
      isControlAccount: initialData?.isControlAccount || false,
      allowPosting: initialData?.allowPosting ?? true,
      requiresReconciliation: initialData?.requiresReconciliation || false,
      isActive: initialData?.isActive ?? true,
    },
  })

  const watchAccountType = form.watch("accountType")
  const watchAccountCategory = form.watch("accountCategory")
  const watchGstApplicable = form.watch("gstApplicable")
  const watchTdsApplicable = form.watch("tdsApplicable")
  const watchTcsApplicable = form.watch("tcsApplicable")

  useEffect(() => {
    fetchParentAccounts()
  }, [])

  useEffect(() => {
    if (watchAccountType) {
      const categories = accountCategories[watchAccountType as keyof typeof accountCategories] || []
      setFilteredCategories(categories)
      
      // Reset category and subcategory when type changes
      if (form.getValues("accountCategory") && !categories.find(c => c.value === form.getValues("accountCategory"))) {
        form.setValue("accountCategory", "")
        form.setValue("accountSubCategory", "")
      }
    }
  }, [watchAccountType])

  useEffect(() => {
    if (watchAccountCategory) {
      const subCategories = accountSubCategories[watchAccountCategory as keyof typeof accountSubCategories] || []
      setFilteredSubCategories(subCategories)
      
      // Reset subcategory when category changes
      if (form.getValues("accountSubCategory") && !subCategories.find(sc => sc.value === form.getValues("accountSubCategory"))) {
        form.setValue("accountSubCategory", "")
      }
    }
  }, [watchAccountCategory])

  const fetchParentAccounts = async () => {
    try {
      const response = await fetch("/api/finance/chart-of-accounts")
      if (response.ok) {
        const data = await response.json()
        setParentAccounts(data.filter((acc: any) => acc.isControlAccount))
      }
    } catch (error) {
      console.error("Error fetching parent accounts:", error)
    }
  }

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      const payload = {
        ...data,
        gstRate: data.gstRate ? parseFloat(data.gstRate) : undefined,
        tdsRate: data.tdsRate ? parseFloat(data.tdsRate) : undefined,
        tcsRate: data.tcsRate ? parseFloat(data.tcsRate) : undefined,
        openingBalance: parseFloat(data.openingBalance),
        budgetAmount: data.budgetAmount ? parseFloat(data.budgetAmount) : undefined,
        parentAccountId: data.parentAccountId || undefined,
        accountSubCategory: data.accountSubCategory || undefined,
      }

      const url = initialData
        ? `/api/finance/chart-of-accounts/${initialData.id}`
        : "/api/finance/chart-of-accounts"
      
      const method = initialData ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to save account")
      }

      toast.success(initialData ? "Account updated successfully!" : "Account created successfully!")
      router.push("/finance/chart-of-accounts")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">
              <Building2 className="mr-2 h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="tax">
              <Calculator className="mr-2 h-4 w-4" />
              Tax Config
            </TabsTrigger>
            <TabsTrigger value="balance">
              <TrendingUp className="mr-2 h-4 w-4" />
              Balance & Budget
            </TabsTrigger>
            <TabsTrigger value="controls">
              <Shield className="mr-2 h-4 w-4" />
              Controls
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Settings className="mr-2 h-4 w-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          {/* BASIC INFORMATION TAB */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Identification</CardTitle>
                <CardDescription>
                  Define the account structure and classification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="accountCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Code *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., 1000-CASH" 
                            {...field}
                            className="font-mono"
                          />
                        </FormControl>
                        <FormDescription>
                          Unique identifier (use uppercase, numbers, hyphens)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accountName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Cash in Hand" {...field} />
                        </FormControl>
                        <FormDescription>
                          Descriptive name for the account
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="accountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ASSET">
                              <Badge className="bg-blue-500">Asset</Badge>
                            </SelectItem>
                            <SelectItem value="LIABILITY">
                              <Badge className="bg-red-500">Liability</Badge>
                            </SelectItem>
                            <SelectItem value="EQUITY">
                              <Badge className="bg-purple-500">Equity</Badge>
                            </SelectItem>
                            <SelectItem value="INCOME">
                              <Badge className="bg-green-500">Income</Badge>
                            </SelectItem>
                            <SelectItem value="EXPENSE">
                              <Badge className="bg-orange-500">Expense</Badge>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Primary account classification
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accountCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Category *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={!watchAccountType}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredCategories.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Sub-classification within type
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accountSubCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sub-Category</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value || undefined}
                          disabled={!watchAccountCategory || filteredSubCategories.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sub-category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredSubCategories.map((subCat) => (
                              <SelectItem key={subCat.value} value={subCat.value}>
                                {subCat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Detailed classification (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="parentAccountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Account</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value === "none" ? undefined : value)} 
                        value={field.value || "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select parent account (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None (Top Level)</SelectItem>
                          {parentAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.accountCode} - {account.accountName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Link to parent for hierarchical structure
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter detailed description of this account..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Additional notes or usage guidelines
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAX CONFIGURATION TAB */}
          <TabsContent value="tax" className="space-y-6">
            {/* GST Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>GST Configuration</CardTitle>
                <CardDescription>
                  Configure Goods and Services Tax settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="gstApplicable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          GST Applicable
                        </FormLabel>
                        <FormDescription>
                          Enable GST calculations for this account
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {watchGstApplicable && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4">
                    <FormField
                      control={form.control}
                      name="gstRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GST Rate (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="e.g., 18.00" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            GST percentage (5%, 12%, 18%, 28%)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hsnSacCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>HSN/SAC Code</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., 9954 or 998314" 
                              {...field}
                              className="font-mono"
                            />
                          </FormControl>
                          <FormDescription>
                            HSN (goods) or SAC (services) code
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* TDS Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>TDS Configuration</CardTitle>
                <CardDescription>
                  Configure Tax Deducted at Source settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="tdsApplicable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          TDS Applicable
                        </FormLabel>
                        <FormDescription>
                          Enable TDS deductions for this account
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {watchTdsApplicable && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4">
                    <FormField
                      control={form.control}
                      name="tdsSection"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>TDS Section</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select TDS section" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {tdseSections.map((section) => (
                                <SelectItem key={section.value} value={section.value}>
                                  {section.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Applicable TDS section
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tdsRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>TDS Rate (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="e.g., 10.00" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            TDS percentage to be deducted
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* TCS Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>TCS Configuration</CardTitle>
                <CardDescription>
                  Configure Tax Collected at Source settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="tcsApplicable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          TCS Applicable
                        </FormLabel>
                        <FormDescription>
                          Enable TCS collections for this account
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {watchTcsApplicable && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4">
                    <FormField
                      control={form.control}
                      name="tcsSection"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>TCS Section</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select TCS section" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {tcsSections.map((section) => (
                                <SelectItem key={section.value} value={section.value}>
                                  {section.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Applicable TCS section
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tcsRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>TCS Rate (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="e.g., 0.10" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            TCS percentage to be collected
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* BALANCE & BUDGET TAB */}
          <TabsContent value="balance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Opening Balance</CardTitle>
                <CardDescription>
                  Set the initial balance for this account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="openingBalance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opening Balance Amount</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00" 
                            {...field}
                            className="font-mono text-lg"
                          />
                        </FormControl>
                        <FormDescription>
                          Initial balance at account creation
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="openingBalanceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Balance Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DEBIT">
                              <div className="flex items-center">
                                <Badge variant="outline" className="mr-2">DR</Badge>
                                Debit
                              </div>
                            </SelectItem>
                            <SelectItem value="CREDIT">
                              <div className="flex items-center">
                                <Badge variant="outline" className="mr-2">CR</Badge>
                                Credit
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Debit or Credit balance
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget Configuration</CardTitle>
                <CardDescription>
                  Set budget limits for expense and income accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="budgetAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget Amount</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00" 
                            {...field}
                            className="font-mono text-lg"
                          />
                        </FormControl>
                        <FormDescription>
                          Budget limit for this account
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="budgetPeriod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget Period</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {budgetPeriods.map((period) => (
                              <SelectItem key={period.value} value={period.value}>
                                {period.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Budget period duration
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CONTROLS TAB */}
          <TabsContent value="controls" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Controls</CardTitle>
                <CardDescription>
                  Configure how this account behaves in the system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="isControlAccount"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-blue-50">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="flex items-center">
                          <Shield className="mr-2 h-4 w-4 text-blue-600" />
                          Control Account
                        </FormLabel>
                        <FormDescription>
                          This account can have sub-accounts (used for grouping)
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allowPosting"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="flex items-center">
                          <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                          Allow Direct Posting
                        </FormLabel>
                        <FormDescription>
                          Allow transactions to be posted directly to this account
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requiresReconciliation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-yellow-50">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="flex items-center">
                          <AlertCircle className="mr-2 h-4 w-4 text-yellow-600" />
                          Requires Reconciliation
                        </FormLabel>
                        <FormDescription>
                          This account needs periodic reconciliation (e.g., bank accounts)
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-green-50">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="flex items-center">
                          <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                          Active Account
                        </FormLabel>
                        <FormDescription>
                          This account is active and available for use
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ADVANCED TAB */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Configuration</CardTitle>
                <CardDescription>
                  Additional settings and information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border p-4 space-y-4 bg-muted/50">
                  <h3 className="font-semibold flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Account Hierarchy Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Account Level</p>
                      <p className="font-medium">
                        {form.watch("parentAccountId") ? "Sub-Account (Level 1+)" : "Top Level (Level 0)"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Can Be Parent</p>
                      <p className="font-medium">
                        {form.watch("isControlAccount") ? "Yes" : "No"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Direct Posting</p>
                      <p className="font-medium">
                        {form.watch("allowPosting") ? "Enabled" : "Disabled"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-medium">
                        {form.watch("isActive") ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4 space-y-4 bg-muted/50">
                  <h3 className="font-semibold flex items-center">
                    <Calculator className="mr-2 h-4 w-4" />
                    Tax Summary
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">GST</p>
                      <p className="font-medium">
                        {watchGstApplicable ? (
                          <Badge className="bg-green-500">
                            {form.watch("gstRate")}%
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Applicable</Badge>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">TDS</p>
                      <p className="font-medium">
                        {watchTdsApplicable ? (
                          <Badge className="bg-orange-500">
                            {form.watch("tdsSection")}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Applicable</Badge>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">TCS</p>
                      <p className="font-medium">
                        {watchTcsApplicable ? (
                          <Badge className="bg-purple-500">
                            {form.watch("tcsSection")}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Applicable</Badge>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4 space-y-4 bg-muted/50">
                  <h3 className="font-semibold flex items-center">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Financial Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Opening Balance</p>
                      <p className="font-mono font-medium text-lg">
                        ₹{parseFloat(form.watch("openingBalance") || "0").toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        <Badge variant="outline" className="ml-2">
                          {form.watch("openingBalanceType")}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Budget</p>
                      <p className="font-mono font-medium text-lg">
                        {form.watch("budgetAmount") ? (
                          <>
                            ₹{parseFloat(form.watch("budgetAmount") || "0").toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{" "}
                            <Badge variant="outline" className="ml-2">
                              {form.watch("budgetPeriod")}
                            </Badge>
                          </>
                        ) : (
                          <Badge variant="outline">No Budget Set</Badge>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} size="lg">
            {loading ? "Saving..." : initialData ? "Update Account" : "Create Account"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
