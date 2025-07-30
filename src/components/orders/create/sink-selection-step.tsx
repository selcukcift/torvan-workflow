'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Minus, Building2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface SinkConfiguration {
  buildNumber: string
  quantity: number
}

interface SinkSelectionStepProps {
  data: any
  onComplete: (data: any) => void
  onBack: () => void
  canGoBack: boolean
}

export function SinkSelectionStep({ data, onComplete, onBack, canGoBack }: SinkSelectionStepProps) {
  const [selectedFamily, setSelectedFamily] = useState<string>(data.sinkFamily || 'MDRD')
  const [configurations, setConfigurations] = useState<SinkConfiguration[]>(
    data.configurations || [{ buildNumber: '', quantity: 1 }]
  )

  const sinkFamilies = [
    {
      id: 'MDRD',
      name: 'MDRD',
      description: 'Medical Device Reprocessing Decontamination sink',
      available: true
    },
    {
      id: 'Endoscope',
      name: 'Endoscope CleanStation',
      description: 'Specialized endoscope cleaning system',
      available: false
    },
    {
      id: 'InstroSink',
      name: 'InstroSink',
      description: 'General instrument cleaning sink',
      available: false
    }
  ]

  const generateBuildNumber = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0')
    return `${selectedFamily}-${timestamp}${random}`
  }

  const addConfiguration = () => {
    setConfigurations([...configurations, { buildNumber: generateBuildNumber(), quantity: 1 }])
  }

  const removeConfiguration = (index: number) => {
    if (configurations.length > 1) {
      setConfigurations(configurations.filter((_, i) => i !== index))
    }
  }

  const updateConfiguration = (index: number, field: keyof SinkConfiguration, value: any) => {
    const updated = configurations.map((config, i) => 
      i === index ? { ...config, [field]: value } : config
    )
    setConfigurations(updated)
  }

  const handleSubmit = () => {
    // Validate configurations
    const hasEmptyBuildNumbers = configurations.some(config => !config.buildNumber.trim())
    const hasInvalidQuantities = configurations.some(config => config.quantity < 1)
    const hasDuplicateBuildNumbers = new Set(configurations.map(c => c.buildNumber)).size !== configurations.length

    if (hasEmptyBuildNumbers) {
      toast.error('Please provide build numbers for all configurations')
      return
    }

    if (hasInvalidQuantities) {
      toast.error('All quantities must be at least 1')
      return
    }

    if (hasDuplicateBuildNumbers) {
      toast.error('Build numbers must be unique')
      return
    }

    if (!sinkFamilies.find(f => f.id === selectedFamily)?.available) {
      toast.error('Selected sink family is not yet available')
      return
    }

    const totalQuantity = configurations.reduce((sum, config) => sum + config.quantity, 0)

    onComplete({
      sinkFamily: selectedFamily,
      configurations,
      totalQuantity
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
            2
          </span>
          Sink Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sink Family Selection */}
        <div>
          <Label className="text-base font-medium">Select Sink Family</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            {sinkFamilies.map((family) => (
              <div
                key={family.id}
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedFamily === family.id
                    ? 'border-blue-500 bg-blue-50'
                    : family.available 
                      ? 'border-gray-200 hover:border-gray-300'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
                onClick={() => family.available && setSelectedFamily(family.id)}
              >
                <div className="flex items-start gap-3">
                  <Building2 className="h-6 w-6 text-gray-600 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{family.name}</h3>
                      {!family.available && (
                        <Badge variant="secondary" className="text-xs">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{family.description}</p>
                  </div>
                </div>
                {!family.available && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-500">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Under Construction</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sink Configurations */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base font-medium">Sink Configurations</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addConfiguration}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Configuration
            </Button>
          </div>

          <div className="space-y-3">
            {configurations.map((config, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Configuration {index + 1}</h4>
                  {configurations.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeConfiguration(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Build Number *</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        placeholder="Enter unique build number"
                        value={config.buildNumber}
                        onChange={(e) => updateConfiguration(index, 'buildNumber', e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => updateConfiguration(index, 'buildNumber', generateBuildNumber())}
                      >
                        Generate
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      This will be the unique identifier for this sink configuration
                    </p>
                  </div>
                  
                  <div>
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={config.quantity}
                      onChange={(e) => updateConfiguration(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Summary</h4>
          <div className="text-sm text-blue-800">
            <p>Sink Family: <span className="font-medium">{selectedFamily}</span></p>
            <p>Total Configurations: <span className="font-medium">{configurations.length}</span></p>
            <p>Total Quantity: <span className="font-medium">
              {configurations.reduce((sum, config) => sum + config.quantity, 0)}
            </span></p>
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={!canGoBack}
          >
            Back
          </Button>
          <Button onClick={handleSubmit}>
            Continue to Sink Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}