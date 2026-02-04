import { auth } from "@/auth"
import { redirect } from "next/navigation"
import type { UserRole } from "@prisma/client"

export async function getCurrentUser() {
  const session = await auth()
  return session?.user ?? null
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  return user
}

export async function requireRole(roles: UserRole | UserRole[]) {
  const user = await requireAuth()
  const allowedRoles = Array.isArray(roles) ? roles : [roles]

  if (!allowedRoles.includes(user.role as UserRole)) {
    redirect("/auth/unauthorized")
  }

  return user
}
