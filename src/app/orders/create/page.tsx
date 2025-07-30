'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { CustomerInfoStep } from '@/components/orders/create/customer-info-step'
import { SinkSelectionStep } from '@/components/orders/create/sink-selection-step'
import { SinkConfigStep } from '@/components/orders/create/sink-config-step'
import { BasinFaucetStep } from '@/components/orders/create/basin-faucet-step'
import { AccessoriesStep } from '@/components/orders/create/accessories-step'
import { OrderReview } from '@/components/orders/create/order-review'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle } from 'lucide-react'

const steps = [
  { id: 1, title: 'Customer Information', component: CustomerInfoStep },
  { id: 2, title: 'Sink Selection', component: SinkSelectionStep },
  { id: 3, title: 'Sink Configuration', component: SinkConfigStep },
  { id: 4, title: 'Basin & Faucets', component: BasinFaucetStep },
  { id: 5, title: 'Accessories', component: AccessoriesStep },
  { id: 6, title: 'Review & Submit', component: OrderReview },
]

export default function CreateOrderPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [orderData, setOrderData] = useState<any>({})
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const breadcrumbs = [
    { label: 'Orders', href: '/orders' },
    { label: 'Create Order' }
  ]

  const handleStepComplete = (stepId: number, data: any) => {
    setOrderData((prev: any) => ({ ...prev, ...data }))
    setCompletedSteps((prev: Set<number>) => new Set([...prev, stepId]))
    
    if (stepId < steps.length) {
      setCurrentStep(stepId + 1)
    }
  }

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const CurrentStepComponent = steps[currentStep - 1]?.component

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create New Order</h1>
          <p className="text-muted-foreground mt-2">
            Complete the 5-step process to create a new sink order
          </p>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Progress</CardTitle>
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {steps.length}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={(currentStep / steps.length) * 100} className="mb-4" />
            <div className="flex justify-between">
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center space-y-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    completedSteps.has(step.id) 
                      ? 'bg-green-500 text-white' 
                      : currentStep === step.id 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {completedSteps.has(step.id) ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className={`text-xs text-center max-w-20 ${
                    currentStep === step.id ? 'font-medium' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Step */}
        {CurrentStepComponent && (
          <CurrentStepComponent
            data={orderData}
            onComplete={(data: any) => handleStepComplete(currentStep, data)}
            onBack={handleStepBack}
            canGoBack={currentStep > 1}
          />
        )}
      </div>
    </DashboardLayout>
  )
}