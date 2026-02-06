"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LogOut, Building2 } from "lucide-react"
import { useEffect, useState } from "react"
import Image from "next/image"

interface HeaderProps {
  className?: string
}

interface CompanyInfo {
  logo?: string | null
  companyName?: string
}

export function Header({ className }: HeaderProps) {
  const { data } = useSession()
  const user = data?.user
  const router = useRouter()
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null)

  useEffect(() => {
    fetch("/api/company/info")
      .then(res => res.json())
      .then(data => setCompanyInfo(data))
      .catch(err => console.error("Failed to fetch company info:", err))
  }, [])

  return (
    <header
      className={cn(
        "flex h-14 items-center justify-between border-b bg-background px-4",
        className,
      )}
    >
      <div className="flex-1 text-center font-semibold tracking-tight text-lg">
        ASDC Vantage
      </div>

      <div className="flex items-center gap-3 text-sm">
        {user && (
          <span className="hidden sm:inline text-muted-foreground">
            {user.firstName} {user.lastName} ({user.role})
          </span>
        )}
        <button
          onClick={async () => {
            await signOut({ redirect: false })
            router.push("/auth/login")
            router.refresh()
          }}
          className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-accent"
        >
          <LogOut className="h-3 w-3" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  )
}
