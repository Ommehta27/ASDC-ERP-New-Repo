"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  Menu, 
  X, 
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
  ChevronDown,
  ChevronUp,
} from "lucide-react"
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
]

const setupModules: NavItem[] = [
  { title: "Company", href: "/setup/company", icon: Building2 },
  { title: "Employees", href: "/setup/employees", icon: Users },
  { title: "Unit of Measure", href: "/setup/uom", icon: Settings },
  { title: "PO Templates", href: "/setup/po-templates", icon: FileText },
  { title: "System Lists", href: "/setup/system-lists", icon: Settings },
  { title: "General Settings", href: "/setup/general-settings", icon: Settings },
]

const navGroups: NavGroup[] = [
  { label: "Student Life Cycle", items: studentLifecycle },
  { label: "Inventory", items: inventoryModules },
  { label: "Procurement", items: procurementModules },
  { label: "Finance", items: financeModules },
  { label: "Setup", items: setupModules },
]

interface CompanyInfo {
  logo?: string | null
  companyName?: string
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Student Life Cycle": true,
    "Inventory": false,
    "Procurement": false,
    "Finance": false,
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
        onClick={() => setOpen(false)}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span>{item.title}</span>
      </Link>
    )
  }

  return (
    <>
      <button
        className="inline-flex items-center justify-center rounded-md border px-2 py-1 text-sm lg:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative z-50 flex w-80 flex-col bg-card">
            {/* Header */}
            <div className="flex h-14 items-center justify-between border-b px-4 shrink-0 bg-card">
              <div className="relative h-10 flex-1 mr-4">
                {companyInfo?.logo ? (
                  <Image
                    src={companyInfo.logo}
                    alt="Company Logo"
                    fill
                    className="object-contain"
                    unoptimized
                    priority
                  />
                ) : (
                  <div className="h-10 w-full flex items-center justify-center">
                    <Building2 className="h-7 w-7 text-primary" />
                  </div>
                )}
              </div>
              <button
                className="rounded-md border px-2 py-1.5 hover:bg-accent transition-colors shrink-0"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Navigation Container */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <nav className="overflow-y-auto px-2 py-3 custom-scrollbar scroll-smooth">
                <div className="space-y-1">
                  {/* Dashboard */}
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      pathname === "/dashboard"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <LayoutDashboard className="h-4 w-4 shrink-0" />
                    <span>Dashboard</span>
                  </Link>

                  {/* Analytics */}
                  <Link
                    href="/analytics"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      pathname === "/analytics"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <BarChart3 className="h-4 w-4 shrink-0" />
                    <span>Analytics</span>
                  </Link>

                  {/* Nav Groups */}
                  {navGroups.map((group) => (
                    <div key={group.label} className="space-y-1">
                      <button
                        onClick={() => toggleGroup(group.label)}
                        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-semibold uppercase text-muted-foreground hover:bg-accent transition-colors"
                      >
                        <span>{group.label}</span>
                        {expandedGroups[group.label] ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                      {expandedGroups[group.label] && (
                        <div className="space-y-1">
                          {group.items.map(renderNavItem)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
