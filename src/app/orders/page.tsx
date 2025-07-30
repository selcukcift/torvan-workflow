'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Package, Clock, CheckCircle, Truck } from 'lucide-react'
import Link from 'next/link'

const mockOrders = [
  {
    id: '1',
    poNumber: 'PO-2024-001',
    customerName: 'General Hospital',
    status: 'CREATED',
    totalQuantity: 2,
    createdAt: '2024-01-15',
    deliveryDate: '2024-02-15'
  },
  {
    id: '2',
    poNumber: 'PO-2024-002',
    customerName: 'Medical Center',
    status: 'ASSEMBLY',
    totalQuantity: 1,
    createdAt: '2024-01-10',
    deliveryDate: '2024-02-10'
  },
  {
    id: '3',
    poNumber: 'PO-2024-003',
    customerName: 'Surgery Clinic',
    status: 'SHIPPED',
    totalQuantity: 3,
    createdAt: '2024-01-05',
    deliveryDate: '2024-01-25'
  }
]

const statusIcons = {
  CREATED: Clock,
  PROCUREMENT_REVIEW: Package,
  PROCUREMENT_APPROVED: CheckCircle,
  PRE_QC: Clock,
  ASSEMBLY: Package,
  FINAL_QC: CheckCircle,
  SHIPPED: Truck
}

const statusColors = {
  CREATED: 'text-yellow-600 bg-yellow-100',
  PROCUREMENT_REVIEW: 'text-blue-600 bg-blue-100',
  PROCUREMENT_APPROVED: 'text-green-600 bg-green-100',
  PRE_QC: 'text-orange-600 bg-orange-100',
  ASSEMBLY: 'text-purple-600 bg-purple-100',
  FINAL_QC: 'text-indigo-600 bg-indigo-100',
  SHIPPED: 'text-green-600 bg-green-100'
}

export default function OrdersPage() {
  const breadcrumbs = [
    { label: 'Orders' }
  ]

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Orders</h1>
            <p className="text-muted-foreground">
              Manage production orders and track their progress
            </p>
          </div>
          <Link href="/orders/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Order
            </Button>
          </Link>
        </div>

        {/* Order Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockOrders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockOrders.filter(o => o.status !== 'SHIPPED').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockOrders.filter(o => o.status === 'SHIPPED').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockOrders.reduce((sum, order) => sum + order.totalQuantity, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockOrders.map((order) => {
                const StatusIcon = statusIcons[order.status as keyof typeof statusIcons]
                const statusColor = statusColors[order.status as keyof typeof statusColors]
                
                return (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${statusColor}`}>
                        <StatusIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-medium">{order.poNumber}</h3>
                        <p className="text-sm text-muted-foreground">{order.customerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">Qty: {order.totalQuantity}</p>
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(order.deliveryDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                        {order.status.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}