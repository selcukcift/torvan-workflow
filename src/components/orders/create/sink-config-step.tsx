'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { sinkConfigSchema, type SinkConfigData } from '@/lib/validations/order'
import { Settings, Ruler, Wrench, Grid3X3, ArrowLeftRight, Info } from 'lucide-react'
import { toast } from 'sonner'

interface SinkConfigStepProps {
  data: any
  onComplete: (data: any) => void
  onBack: () => void
  canGoBack: boolean
}

export function SinkConfigStep({ data, onComplete, onBack, canGoBack }: SinkConfigStepProps) {
  const [selectedBuildNumber, setSelectedBuildNumber] = useState<string>('')
  const [currentConfig, setCurrentConfig] = useState<any>({})
  const [completedConfigs, setCompletedConfigs] = useState<Set<string>>(new Set())

  const configurations = data.configurations || []

  const form = useForm<SinkConfigData>({
    resolver: zodResolver(sinkConfigSchema),
    defaultValues: {
      buildNumber: '',
      sinkModel: 'T2-B1',
      sinkWidth: 48,
      sinkLength: 60,
      legType: 'DL27',
      legHeightType: 'Height Adjustable',
      feetType: 'Lock & Leveling Casters',
      workflowDirection: 'Left to Right',
      hasPegboard: false,
    }
  })

  const watchedValues = form.watch()

  // Initialize with first configuration
  useEffect(() => {
    if (configurations.length > 0 && !selectedBuildNumber) {
      setSelectedBuildNumber(configurations[0].buildNumber)
    }
  }, [configurations, selectedBuildNumber])

  // Load configuration data when build number changes
  useEffect(() => {
    if (selectedBuildNumber) {
      const savedConfig = data.sinkConfigs?.[selectedBuildNumber]
      if (savedConfig) {
        form.reset(savedConfig)
        setCurrentConfig(savedConfig)
      } else {
        const defaultConfig = {
          buildNumber: selectedBuildNumber,
          sinkModel: 'T2-B1',
          sinkWidth: 48,
          sinkLength: 60,
          legType: 'DL27',
          legHeightType: 'Height Adjustable',
          feetType: 'Lock & Leveling Casters',
          workflowDirection: 'Left to Right',
          hasPegboard: false,
        }
        form.reset(defaultConfig)
        setCurrentConfig(defaultConfig)
      }
    }
  }, [selectedBuildNumber, data.sinkConfigs, form])

  const getBasinCount = (model: string) => {
    switch (model) {
      case 'T2-B1': return 1
      case 'T2-B2': return 2
      case 'T2-B3': return 3
      default: return 1
    }
  }

  const getSinkBodyAssembly = (length: number) => {
    if (length >= 48 && length <= 60) return { code: '709.82', name: 'T2-BODY-48-60-HA' }
    if (length >= 61 && length <= 72) return { code: '709.83', name: 'T2-BODY-61-72-HA' }
    if (length >= 73 && length <= 120) return { code: '709.84', name: 'T2-BODY-73-120-HA' }
    return null
  }

  const getPegboardSizeRange = (length: number) => {
    if (length >= 34 && length <= 47) return '34X36 PEGBOARD (COVERS 34" - 47")'
    if (length >= 48 && length <= 59) return '48X36 PEGBOARD (COVERS 48" - 59")'
    if (length >= 60 && length <= 71) return '60X36 PEGBOARD (COVERS 60" - 71")'
    if (length >= 72 && length <= 83) return '72X36 PEGBOARD (COVERS 72" - 83")'
    if (length >= 84 && length <= 95) return '84X36 PEGBOARD (COVERS 84" - 95")'
    if (length >= 96 && length <= 107) return '96X36 PEGBOARD (COVERS 96" - 107")'
    if (length >= 108 && length <= 119) return '108X36 PEGBOARD (COVERS 108" - 119")'
    if (length >= 120 && length <= 130) return '120X36 PEGBOARD (COVERS 120" - 130")'
    return 'Custom size required'
  }

  const saveCurrentConfig = () => {
    const formData = form.getValues()
    const updatedSinkConfigs = {
      ...data.sinkConfigs,
      [selectedBuildNumber]: formData
    }
    
    setCurrentConfig(formData)
    setCompletedConfigs(prev => new Set([...prev, selectedBuildNumber]))
    
    // Update parent data
    data.sinkConfigs = updatedSinkConfigs
    toast.success(`Configuration saved for ${selectedBuildNumber}`)
  }

  const handleSubmit = () => {
    // Save current config first
    saveCurrentConfig()
    
    // Check if all configurations are completed
    const allCompleted = configurations.every((config: any) => 
      completedConfigs.has(config.buildNumber) || config.buildNumber === selectedBuildNumber
    )
    
    if (!allCompleted) {
      toast.error('Please complete all sink configurations before proceeding')
      return
    }

    onComplete({
      sinkConfigs: {
        ...data.sinkConfigs,
        [selectedBuildNumber]: form.getValues()
      }
    })
  }

  const sinkBodyAssembly = getSinkBodyAssembly(watchedValues.sinkLength || 60)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
            3
          </span>
          Sink Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Build Number Selection */}
        <div>
          <Label className="text-base font-medium">Configure Sink</Label>
          <div className="flex gap-2 mt-2">
            {configurations.map((config: any) => (
              <Button
                key={config.buildNumber}
                variant={selectedBuildNumber === config.buildNumber ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  if (selectedBuildNumber) saveCurrentConfig()
                  setSelectedBuildNumber(config.buildNumber)
                }}
                className="relative"
              >
                {config.buildNumber}
                {completedConfigs.has(config.buildNumber) && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 bg-green-500">
                    ✓
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {selectedBuildNumber && (
          <Form {...form}>
            <Tabs defaultValue="body" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="body" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Body
                </TabsTrigger>
                <TabsTrigger value="dimensions" className="flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  Dimensions
                </TabsTrigger>
                <TabsTrigger value="support" className="flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Support
                </TabsTrigger>
                <TabsTrigger value="pegboard" className="flex items-center gap-2">
                  <Grid3X3 className="h-4 w-4" />
                  Pegboard
                </TabsTrigger>
              </TabsList>

              <TabsContent value="body" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sinkModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sink Model *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sink model" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="T2-B1">T2-B1 (1 Basin)</SelectItem>
                            <SelectItem value="T2-B2">T2-B2 (2 Basins)</SelectItem>
                            <SelectItem value="T2-B3">T2-B3 (3 Basins)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Determines the number of basins: {getBasinCount(watchedValues.sinkModel)} basin(s)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="workflowDirection"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workflow Direction *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select workflow direction" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Left to Right">
                              <div className="flex items-center gap-2">
                                <ArrowLeftRight className="h-4 w-4" />
                                Left to Right
                              </div>
                            </SelectItem>
                            <SelectItem value="Right to Left">
                              <div className="flex items-center gap-2">
                                <ArrowLeftRight className="h-4 w-4 rotate-180" />
                                Right to Left
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {sinkBodyAssembly && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Info className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Selected Assembly</span>
                    </div>
                    <p className="text-sm text-blue-800">
                      {sinkBodyAssembly.code} - {sinkBodyAssembly.name}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="dimensions" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sinkWidth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sink Width (inches) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="24"
                            max="48"
                            placeholder="Enter width"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Typical range: 24" - 48"
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sinkLength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sink Length (inches) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="48"
                            max="120"
                            placeholder="Enter length"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Determines sink body assembly (48-120")
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Assembly Selection Based on Length</h4>
                  <div className="text-sm space-y-1">
                    <p className={watchedValues.sinkLength >= 48 && watchedValues.sinkLength <= 60 ? 'font-medium text-blue-600' : 'text-gray-600'}>
                      48-60": T2-BODY-48-60-HA
                    </p>
                    <p className={watchedValues.sinkLength >= 61 && watchedValues.sinkLength <= 72 ? 'font-medium text-blue-600' : 'text-gray-600'}>
                      61-72": T2-BODY-61-72-HA
                    </p>
                    <p className={watchedValues.sinkLength >= 73 && watchedValues.sinkLength <= 120 ? 'font-medium text-blue-600' : 'text-gray-600'}>
                      73-120": T2-BODY-73-120-HA
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="support" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="legType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Leg Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select leg type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DL27">DL27</SelectItem>
                            <SelectItem value="DL14">DL14</SelectItem>
                            <SelectItem value="LC1">LC1</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="legHeightType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select height type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Height Adjustable">Height Adjustable</SelectItem>
                            <SelectItem value="Fixed Height">Fixed Height</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="feetType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Feet Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select feet type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Lock & Leveling Casters">Lock & Leveling Casters</SelectItem>
                            <SelectItem value="S.S Adjustable Seismic Feet">S.S Adjustable Seismic Feet</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="pegboard" className="space-y-4">
                <FormField
                  control={form.control}
                  name="hasPegboard"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Include Pegboard</FormLabel>
                        <FormDescription>
                          Add pegboard for accessory mounting
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {watchedValues.hasPegboard && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="pegboardType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pegboard Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select pegboard type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Colorsafe+">Colorsafe+</SelectItem>
                                <SelectItem value="Perforated">Perforated</SelectItem>
                                <SelectItem value="Solid">Solid</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {watchedValues.pegboardType === 'Colorsafe+' && (
                        <FormField
                          control={form.control}
                          name="pegboardColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pegboard Color *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select color" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Green">Green</SelectItem>
                                  <SelectItem value="Black">Black</SelectItem>
                                  <SelectItem value="Yellow">Yellow</SelectItem>
                                  <SelectItem value="Grey">Grey</SelectItem>
                                  <SelectItem value="Red">Red</SelectItem>
                                  <SelectItem value="Blue">Blue</SelectItem>
                                  <SelectItem value="Orange">Orange</SelectItem>
                                  <SelectItem value="White">White</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name="pegboardSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pegboard Size *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select pegboard size" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Same as Sink Length">Same as Sink Length</SelectItem>
                              <SelectItem value="Custom Size">Custom Size</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {watchedValues.pegboardSize === 'Same as Sink Length' && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>Auto-selected:</strong> {getPegboardSizeRange(watchedValues.sinkLength || 60)}
                        </p>
                      </div>
                    )}

                    {watchedValues.pegboardSize === 'Custom Size' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="pegboardWidth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Custom Width (inches) *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="12"
                                  max="48"
                                  placeholder="Enter width"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="pegboardLength"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Custom Length (inches) *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="12"
                                  max="130"
                                  placeholder="Enter length"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={!canGoBack}
              >
                Back
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={saveCurrentConfig}
                >
                  Save Configuration
                </Button>
                <Button onClick={handleSubmit}>
                  Continue to Basin & Faucets
                </Button>
              </div>
            </div>
          </Form>
        )}
      </CardContent>
    </Card>
  )
}