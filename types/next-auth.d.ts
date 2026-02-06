import { DefaultSession } from "next-auth"
import { UserRole } from "@prisma/client"

// Extend the built-in session types to include our role and ids

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      firstName: string
      lastName: string
      email: string
      centerId: string | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: UserRole
    firstName: string
    lastName: string
    email: string
    centerId: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    firstName: string
    lastName: string
    centerId: string | null
  }
}
