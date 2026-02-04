import { ReactNode } from "react"
import { SessionProvider } from "@/components/providers/session-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { auth } from "@/auth"

interface DashboardLayoutProps {
  children: ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await auth()

  return (
    <SessionProvider session={session}>
      <QueryProvider>
        <div className="flex min-h-screen flex-col bg-background text-foreground">
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex min-h-screen flex-1 flex-col">
              <Header />
              <div className="flex-1 p-4 lg:p-6 bg-muted/10">
                {children}
              </div>
            </main>
          </div>
        </div>
      </QueryProvider>
    </SessionProvider>
  )
}
