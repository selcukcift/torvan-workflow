'use client'

import { useSession } from 'next-auth/react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, ClipboardList, CheckSquare, Users, TrendingUp, AlertCircle } from 'lucide-react'

const stats = [
  {
    title: 'Active Orders',
    value: '12',
    description: 'Currently in production',
    icon: Package,
    color: 'text-blue-600'
  },
  {
    title: 'Pending Tasks',
    value: '34',
    description: 'Awaiting completion',
    icon: ClipboardList,
    color: 'text-orange-600'
  },
  {
    title: 'QC Reviews',
    value: '5',
    description: 'Pending inspection',
    icon: CheckSquare,
    color: 'text-green-600'
  },
  {
    title: 'Team Members',
    value: '8',
    description: 'Currently active',
    icon: Users,
    color: 'text-purple-600'
  }
]

const recentActivity = [
  { id: 1, action: 'Order #PO-2024-001 moved to Assembly', time: '2 hours ago', status: 'info' },
  { id: 2, action: 'QC Review completed for Order #PO-2024-003', time: '4 hours ago', status: 'success' },
  { id: 3, action: 'BOM approved for Order #PO-2024-005', time: '6 hours ago', status: 'info' },
  { id: 4, action: 'Task overdue: Basin Installation #T-456', time: '8 hours ago', status: 'warning' },
]

export default function DashboardPage() {
  const { data: session } = useSession()

  if (!session) {
    return <div>Loading...</div>
  }

  const breadcrumbs = [
    { label: 'Dashboard' }
  ]

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {session.user.name || session.user.email}
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your workflow today.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates across your workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-500' :
                      activity.status === 'warning' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.action}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks for your role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {session.user.role === 'PRODUCTION_COORDINATOR' && (
                  <>
                    <button className="w-full text-left p-2 rounded hover:bg-muted text-sm">
                      Create New Order
                    </button>
                    <button className="w-full text-left p-2 rounded hover:bg-muted text-sm">
                      Assign Tasks
                    </button>
                    <button className="w-full text-left p-2 rounded hover:bg-muted text-sm">
                      Review Progress
                    </button>
                  </>
                )}
                {session.user.role === 'PROCUREMENT_SPECIALIST' && (
                  <>
                    <button className="w-full text-left p-2 rounded hover:bg-muted text-sm">
                      Review BOMs
                    </button>
                    <button className="w-full text-left p-2 rounded hover:bg-muted text-sm">
                      Update Procurement Status
                    </button>
                    <button className="w-full text-left p-2 rounded hover:bg-muted text-sm">
                      Check Inventory
                    </button>
                  </>
                )}
                {session.user.role === 'QC_SPECIALIST' && (
                  <>
                    <button className="w-full text-left p-2 rounded hover:bg-muted text-sm">
                      Pending QC Reviews
                    </button>
                    <button className="w-full text-left p-2 rounded hover:bg-muted text-sm">
                      Create QC Checklist
                    </button>
                    <button className="w-full text-left p-2 rounded hover:bg-muted text-sm">
                      View QC History
                    </button>
                  </>
                )}
                {session.user.role === 'ASSEMBLER' && (
                  <>
                    <button className="w-full text-left p-2 rounded hover:bg-muted text-sm">
                      My Active Tasks
                    </button>
                    <button className="w-full text-left p-2 rounded hover:bg-muted text-sm">
                      View Work Instructions
                    </button>
                    <button className="w-full text-left p-2 rounded hover:bg-muted text-sm">
                      Report Issue
                    </button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}