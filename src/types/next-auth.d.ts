import NextAuth from 'next-auth'
import { UserRole } from './index'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      role: UserRole
    }
  }

  interface User {
    id: string
    email: string
    name?: string
    role: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
  }
}