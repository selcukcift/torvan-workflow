'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { 
  Home,
  Package,
  ClipboardList,
  Users,
  Settings,
  CheckSquare,
  Wrench,
  LogOut,
  Building2
} from 'lucide-react'
import { hasPermission } from '@/lib/role-guard'

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    permission: null
  },
  {
    title: 'Orders',
    href: '/orders',
    icon: Package,
    permission: 'orders:read'
  },
  {
    title: 'Tasks',
    href: '/tasks',
    icon: ClipboardList,
    permission: 'tasks:read'
  },
  {
    title: 'Quality Control',
    href: '/qc',
    icon: CheckSquare,
    permission: 'qc:read'
  },
  {
    title: 'Inventory',
    href: '/inventory',
    icon: Building2,
    permission: 'inventory:read'
  },
  {
    title: 'BOM Management',
    href: '/bom',
    icon: Wrench,
    permission: 'bom:read'
  },
  {
    title: 'Users',
    href: '/users',
    icon: Users,
    permission: '*'
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    permission: null
  }
]

export function AppSidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  const filteredNavItems = navigationItems.filter(item => {
    if (!item.permission) return true
    if (!session?.user?.role) return false
    return hasPermission(session.user.role, item.permission)
  })

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border/40">
        <div className="flex items-center gap-2 px-4 py-2">
          <Building2 className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-semibold">TORVAN</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {filteredNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
              >
                <Link href={item.href} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-border/40">
        <div className="px-4 py-2">
          {session?.user && (
            <div className="space-y-2">
              <div className="text-sm">
                <p className="font-medium">{session.user.name || session.user.email}</p>
                <p className="text-muted-foreground text-xs">
                  {session.user.role.replace('_', ' ').toLowerCase()}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => signOut()}
                className="w-full justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}