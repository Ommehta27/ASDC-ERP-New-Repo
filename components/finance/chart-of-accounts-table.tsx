"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Edit, Eye, ChevronRight } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Account {
  id: string
  accountCode: string
  accountName: string
  accountType: string
  accountCategory: string
  accountSubCategory: string | null
  currentBalance: number
  isActive: boolean
  gstApplicable: boolean
  tdsApplicable: boolean
  tcsApplicable: boolean
  isControlAccount: boolean
  level: number
}

export function ChartOfAccountsTable() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")

  useEffect(() => {
    fetchAccounts()
  }, [search, filterType, filterCategory])

  const fetchAccounts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (filterType !== "all") params.append("accountType", filterType)
      if (filterCategory !== "all") params.append("accountCategory", filterCategory)
      
      const response = await fetch(`/api/finance/chart-of-accounts?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAccounts(data)
      }
    } catch (error) {
      console.error("Error fetching accounts:", error)
    } finally {
      setLoading(false)
    }
  }

  const typeColors: Record<string, string> = {
    ASSET: "bg-blue-500",
    LIABILITY: "bg-red-500",
    EQUITY: "bg-purple-500",
    INCOME: "bg-green-500",
    EXPENSE: "bg-orange-500",
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="ASSET">Asset</SelectItem>
            <SelectItem value="LIABILITY">Liability</SelectItem>
            <SelectItem value="EQUITY">Equity</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
            <SelectItem value="EXPENSE">Expense</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="CURRENT_ASSETS">Current Assets</SelectItem>
            <SelectItem value="FIXED_ASSETS">Fixed Assets</SelectItem>
            <SelectItem value="CURRENT_LIABILITIES">Current Liabilities</SelectItem>
            <SelectItem value="LONG_TERM_LIABILITIES">Long-term Liabilities</SelectItem>
            <SelectItem value="DIRECT_INCOME">Direct Income</SelectItem>
            <SelectItem value="INDIRECT_INCOME">Indirect Income</SelectItem>
            <SelectItem value="DIRECT_EXPENSES">Direct Expenses</SelectItem>
            <SelectItem value="INDIRECT_EXPENSES">Indirect Expenses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Code</TableHead>
              <TableHead>Account Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Current Balance</TableHead>
              <TableHead>Tax</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No accounts found
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-mono font-medium">
                    <div className="flex items-center gap-1">
                      {account.level > 0 && (
                        <span className="text-muted-foreground" style={{ paddingLeft: `${account.level * 16}px` }}>
                          <ChevronRight className="h-3 w-3 inline" />
                        </span>
                      )}
                      {account.accountCode}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {account.accountName}
                      {account.isControlAccount && (
                        <Badge variant="outline" className="text-xs">Control</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={typeColors[account.accountType]}>
                      {account.accountType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {account.accountCategory.replace(/_/g, " ")}
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    {formatCurrency(account.currentBalance)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {account.gstApplicable && (
                        <Badge variant="outline" className="text-xs bg-green-500/10">GST</Badge>
                      )}
                      {account.tdsApplicable && (
                        <Badge variant="outline" className="text-xs bg-orange-500/10">TDS</Badge>
                      )}
                      {account.tcsApplicable && (
                        <Badge variant="outline" className="text-xs bg-purple-500/10">TCS</Badge>
                      )}
                      {!account.gstApplicable && !account.tdsApplicable && !account.tcsApplicable && "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={account.isActive ? "default" : "secondary"}>
                      {account.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/finance/chart-of-accounts/${account.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/finance/chart-of-accounts/${account.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
