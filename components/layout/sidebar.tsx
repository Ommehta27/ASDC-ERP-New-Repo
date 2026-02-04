"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  Package,
  ShoppingCart,
  FileText,
  Landmark,
  Settings,
  BarChart3,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Calendar,
  Clock,
  Award,
  BookOpen,
  DollarSign,
  UserPlus,
  LogOut,
  PiggyBank,
  TrendingUp,
  FolderTree,
  Workflow,
  Zap,
  Plug,
} from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const studentLifecycle: NavItem[] = [
  { title: "Students", href: "/students", icon: Users },
  { title: "Batches", href: "/students/batches", icon: Users },
  { title: "Inquiries", href: "/inquiries", icon: Users },
  { title: "Enrollments", href: "/enrollments", icon: GraduationCap },
  { title: "Placements", href: "/placements", icon: Briefcase },
  { title: "Courses", href: "/courses", icon: GraduationCap },
  { title: "Centers", href: "/centers", icon: Building2 },
]

const inventoryModules: NavItem[] = [
  { title: "Items", href: "/inventory", icon: Package },
  { title: "Allocations", href: "/inventory/allocations", icon: Package },
]

const procurementModules: NavItem[] = [
  { title: "Purchases", href: "/procurement/purchases", icon: ShoppingCart },
  { title: "PO Generator", href: "/procurement/purchase-orders", icon: FileText },
  { title: "Vendors", href: "/procurement/vendors", icon: FileText },
]

const financeModules: NavItem[] = [
  { title: "Chart of Accounts", href: "/finance/chart-of-accounts", icon: Landmark },
  { title: "Budgets", href: "/finance/budgets", icon: PiggyBank },
  { title: "Budget Reports", href: "/finance/budget-reports", icon: TrendingUp },
  { title: "Cost Centers", href: "/finance/cost-centers", icon: FolderTree },
]

const hrModules: NavItem[] = [
  { title: "Employees", href: "/hr/employees", icon: UserCheck },
  { title: "Attendance", href: "/hr/attendance", icon: Clock },
  { title: "Leave Management", href: "/hr/leaves", icon: Calendar },
  { title: "Performance", href: "/hr/performance", icon: Award },
  { title: "Training", href: "/hr/training", icon: BookOpen },
  { title: "Payroll", href: "/hr/payroll", icon: DollarSign },
  { title: "Onboarding", href: "/hr/onboarding", icon: UserPlus },
  { title: "Exit Management", href: "/hr/exit", icon: LogOut },
]

const workflowModules: NavItem[] = [
  { title: "Workflows", href: "/workflows", icon: Workflow },
  { title: "API Connections", href: "/workflows/connections", icon: Plug },
  { title: "Executions", href: "/workflows/executions", icon: Zap },
  { title: "Templates", href: "/workflows/templates", icon: FileText },
]

const setupModules: NavItem[] = [
  { title: "Company", href: "/setup/company", icon: Building2 },
  { title: "Employee Setup", href: "/setup/employees", icon: Users },
  { title: "Unit of Measure", href: "/setup/uom", icon: Settings },
  { title: "PO Templates", href: "/setup/po-templates", icon: FileText },
  { title: "System Lists", href: "/setup/system-lists", icon: Settings },
  { title: "General Settings", href: "/setup/general-settings", icon: Settings },
]

const navGroups: NavGroup[] = [
  { label: "Student Life Cycle", items: studentLifecycle },
  { label: "HR & Payroll", items: hrModules },
  { label: "Inventory", items: inventoryModules },
  { label: "Procurement", items: procurementModules },
  { label: "Finance", items: financeModules },
  { label: "Automation", items: workflowModules },
  { label: "Setup", items: setupModules },
]

interface CompanyInfo {
  logo?: string | null
  companyName?: string
}

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Student Life Cycle": true,
    "Inventory": true,
    "Procurement": true,
    "Finance": true,
    "Setup": false,
  })
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null)

  useEffect(() => {
    fetch("/api/company/info")
      .then(res => res.json())
      .then(data => setCompanyInfo(data))
      .catch(err => console.error("Failed to fetch company info:", err))
  }, [])

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [label]: !prev[label],
    }))
  }

  const renderNavItem = (item: NavItem) => {
    const active = pathname === item.href || pathname?.startsWith(item.href + "/")
    const Icon = item.icon

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          collapsed && "justify-center px-2"
        )}
        title={collapsed ? item.title : undefined}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span>{item.title}</span>}
      </Link>
    )
  }

  return (
    <aside className={cn(
      "hidden border-r bg-card/80 lg:flex lg:flex-col transition-all duration-300 h-screen",
      collapsed ? "lg:w-16" : "lg:w-64"
    )}>
      {/* Company Logo */}
      <div className="flex h-14 items-center justify-center border-b px-2 shrink-0 bg-card">
        {!collapsed ? (
          <div className="relative h-12 w-full">
            {companyInfo?.logo ? (
              <Image
                src={companyInfo.logo}
                alt="Company Logo"
                fill
                className="object-contain px-2"
                unoptimized
                priority
              />
            ) : (
              <div className="h-12 w-full flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
            )}
          </div>
        ) : (
          <div className="relative h-10 w-10">
            {companyInfo?.logo ? (
              <Image
                src={companyInfo.logo}
                alt="Company Logo"
                fill
                className="object-contain"
                unoptimized
              />
            ) : (
              <Building2 className="h-6 w-6 text-primary" />
            )}
          </div>
        )}
      </div>

      {/* Navigation Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <nav className="overflow-y-auto px-2 py-3 custom-scrollbar scroll-smooth">
          <div className="space-y-1">
            {/* Dashboard */}
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/dashboard"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? "Dashboard" : undefined}
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Dashboard</span>}
            </Link>

            {/* Analytics */}
            <Link
              href="/analytics"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/analytics"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? "Analytics" : undefined}
            >
              <BarChart3 className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Analytics</span>}
            </Link>

            {/* Nav Groups */}
            {navGroups.map((group) => (
              <div key={group.label} className="space-y-1">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-semibold uppercase text-muted-foreground hover:bg-accent transition-colors",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? group.label : undefined}
                >
                  {!collapsed && <span>{group.label}</span>}
                  {!collapsed && (
                    expandedGroups[group.label] ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )
                  )}
                  {collapsed && <div className="h-1 w-1 rounded-full bg-muted-foreground" />}
                </button>
                {(expandedGroups[group.label] || collapsed) && (
                  <div className="space-y-1">
                    {group.items.map(renderNavItem)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>
      </div>

      {/* Collapse/Expand Toggle */}
      <div className="border-t p-2 shrink-0 bg-card/80">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  )
}
