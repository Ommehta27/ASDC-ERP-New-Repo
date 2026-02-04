"use client"

import { SessionProvider as NextSessionProvider } from "next-auth/react"
import type { Session } from "next-auth"

interface SessionProviderProps {
  children: React.ReactNode
  session?: Session | null
}

export function SessionProvider({ children, session }: SessionProviderProps) {
  return <NextSessionProvider session={session}>{children}</NextSessionProvider>
}
