export type UserRole = 
  | 'PRODUCTION_COORDINATOR'
  | 'PROCUREMENT_SPECIALIST' 
  | 'QC_SPECIALIST'
  | 'ASSEMBLER'
  | 'ADMIN'
  | 'SERVICE_DEPARTMENT'

export type OrderStatus = 
  | 'CREATED'
  | 'PROCUREMENT_REVIEW'
  | 'PROCUREMENT_APPROVED'
  | 'PRE_QC'
  | 'ASSEMBLY'
  | 'FINAL_QC'
  | 'SHIPPED'

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED'

export interface User {
  id: string
  email: string
  name?: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  poNumber: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  deliveryDate: Date
  salesRep: string
  status: OrderStatus
  totalQuantity: number
  notes?: string
  createdAt: Date
  updatedAt: Date
  createdById: string
  configurations: OrderConfiguration[]
  documents: Document[]
  bomEntries: BOMEntry[]
  tasks: Task[]
  qcRecords: QCRecord[]
}

export interface OrderConfiguration {
  id: string
  orderId: string
  sinkType: string
  quantity: number
  legs: boolean
  pegboards: boolean
  basinType?: string
  basinSize?: string
  faucetType?: string
  faucetCount: number
  accessories?: any
}

export interface Task {
  id: string
  orderId: string
  title: string
  description?: string
  status: TaskStatus
  priority: number
  estimatedHours?: number
  actualHours?: number
  assignedToId?: string
  workInstructionId?: string
  dueDate?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
  assignedTo?: User
}

export interface BOMEntry {
  id: string
  orderId: string
  assemblyId?: string
  subassemblyId?: string
  quantity: number
  approved: boolean
  procured: boolean
  notes?: string
}

export interface QCRecord {
  id: string
  orderId: string
  type: string
  inspectorId: string
  passed: boolean
  checklist: any
  notes?: string
  inspectedAt: Date
}