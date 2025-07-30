'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
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
import { basinConfigSchema, type BasinConfigData } from '@/lib/validations/order'
import { Droplet, Wrench, Plus, Minus, Info, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface BasinFaucetStepProps {
  data: any
  onComplete: (data: any) => void
  onBack: () => void
  canGoBack: boolean
}

export function BasinFaucetStep({ data, onComplete, onBack, canGoBack }: BasinFaucetStepProps) {
  const [selectedBuildNumber, setSelectedBuildNumber] = useState<string>('')
  const [completedConfigs, setCompletedConfigs] = useState<Set<string>>(new Set())

  const configurations = data.configurations || []
  const sinkConfigs = data.sinkConfigs || {}

  const form = useForm<BasinConfigData>({
    resolver: zodResolver(basinConfigSchema),
    defaultValues: {
      buildNumber: '',
      basins: [{ type: 'E-Sink', size: '20X20X8', hasPTrap: false, hasBasinLight: false }],
      faucets: [{ type: '10" WRIST BLADE SWING SPOUT WALL MOUNTED FAUCET KIT', quantity: 1, hasSprayer: false }],
    }
  })

  const { fields: basinFields, append: appendBasin, remove: removeBasin } = useFieldArray({
    control: form.control,
    name: 'basins'
  })

  const { fields: faucetFields, append: appendFaucet, remove: removeFaucet } = useFieldArray({
    control: form.control,
    name: 'faucets'
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
      const sinkConfig = sinkConfigs[selectedBuildNumber]
      const savedBasinConfig = data.basinConfigs?.[selectedBuildNumber]
      
      if (savedBasinConfig) {
        form.reset(savedBasinConfig)
      } else {
        // Initialize based on sink model
        const basinCount = getBasinCount(sinkConfig?.sinkModel || 'T2-B1')
        const initialBasins = Array.from({ length: basinCount }, () => ({
          type: 'E-Sink',
          size: '20X20X8',
          hasPTrap: false,
          hasBasinLight: false
        }))
        
        const maxFaucets = Math.min(basinCount, 2) // Max 2 faucets even for 3 basins
        const initialFaucets = Array.from({ length: 1 }, () => ({
          type: '10" WRIST BLADE SWING SPOUT WALL MOUNTED FAUCET KIT',
          quantity: 1,
          placement: basinCount > 1 ? 'Between Basins' : 'Center',
          hasSprayer: false
        }))

        form.reset({
          buildNumber: selectedBuildNumber,
          basins: initialBasins,
          faucets: initialFaucets
        })
      }
    }
  }, [selectedBuildNumber, sinkConfigs, data.basinConfigs, form])

  const getBasinCount = (sinkModel: string) => {
    switch (sinkModel) {
      case 'T2-B1': return 1
      case 'T2-B2': return 2
      case 'T2-B3': return 3
      default: return 1
    }
  }

  const getCurrentSinkModel = () => {
    return sinkConfigs[selectedBuildNumber]?.sinkModel || 'T2-B1'
  }

  const getMaxFaucets = () => {
    const basinCount = getBasinCount(getCurrentSinkModel())
    return basinCount === 3 ? 3 : 2
  }

  const getControlBoxType = (basins: any[]) => {
    const eSinkCount = basins.filter(b => b.type === 'E-Sink' || b.type === 'E-Sink DI').length
    const eDrainCount = basins.filter(b => b.type === 'E-Drain').length

    if (eDrainCount === 1 && eSinkCount === 0) return 'T2-CTRL-EDR1'
    if (eDrainCount === 0 && eSinkCount === 1) return 'T2-CTRL-ESK1'
    if (eDrainCount === 1 && eSinkCount === 1) return 'T2-CTRL-EDR1-ESK1'
    if (eDrainCount === 2 && eSinkCount === 0) return 'T2-CTRL-EDR2'
    if (eDrainCount === 0 && eSinkCount === 2) return 'T2-CTRL-ESK2'
    if (eDrainCount === 3 && eSinkCount === 0) return 'T2-CTRL-EDR3'
    if (eDrainCount === 0 && eSinkCount === 3) return 'T2-CTRL-ESK3'
    if (eDrainCount === 1 && eSinkCount === 2) return 'T2-CTRL-EDR1-ESK2'
    if (eDrainCount === 2 && eSinkCount === 1) return 'T2-CTRL-EDR2-ESK1'

    return 'No matching control box'
  }

  const saveCurrentConfig = () => {
    const formData = form.getValues()
    const updatedBasinConfigs = {
      ...data.basinConfigs,
      [selectedBuildNumber]: formData
    }
    
    setCompletedConfigs(prev => new Set([...prev, selectedBuildNumber]))
    data.basinConfigs = updatedBasinConfigs
    toast.success(`Basin configuration saved for ${selectedBuildNumber}`)
  }

  const handleSubmit = () => {
    saveCurrentConfig()
    
    // Check if all configurations are completed
    const allCompleted = configurations.every((config: any) => 
      completedConfigs.has(config.buildNumber) || config.buildNumber === selectedBuildNumber
    )
    
    if (!allCompleted) {
      toast.error('Please complete all basin configurations before proceeding')
      return
    }

    onComplete({
      basinConfigs: {
        ...data.basinConfigs,
        [selectedBuildNumber]: form.getValues()
      }
    })
  }

  const currentBasinCount = getBasinCount(getCurrentSinkModel())
  const controlBoxType = getControlBoxType(watchedValues.basins || [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
            4
          </span>
          Basin & Faucet Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Build Number Selection */}
        <div>
          <Label className="text-base font-medium">Configure Basin & Faucets</Label>
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
            <div className="p-3 bg-blue-50 rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Sink Configuration</span>
              </div>
              <p className="text-sm text-blue-800">
                Model: {getCurrentSinkModel()} ({currentBasinCount} basin{currentBasinCount > 1 ? 's' : ''})
              </p>
            </div>

            <Tabs defaultValue="basins" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basins" className="flex items-center gap-2">
                  <Droplet className="h-4 w-4" />
                  Basins ({basinFields.length})
                </TabsTrigger>
                <TabsTrigger value="faucets" className="flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Faucets ({faucetFields.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basins" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Basin Configuration</Label>
                  <div className="flex gap-2">
                    {basinFields.length < currentBasinCount && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendBasin({ type: 'E-Sink', size: '20X20X8', hasPTrap: false, hasBasinLight: false })}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Basin
                      </Button>
                    )}
                  </div>
                </div>

                {basinFields.length !== currentBasinCount && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-900">
                        Basin Count Mismatch
                      </span>
                    </div>
                    <p className="text-sm text-yellow-800 mt-1">
                      Your sink model ({getCurrentSinkModel()}) requires {currentBasinCount} basin{currentBasinCount > 1 ? 's' : ''}, 
                      but you have {basinFields.length} configured.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {basinFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Basin {index + 1}</h4>
                        {basinFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBasin(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`basins.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Basin Type *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select basin type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="E-Sink">E-Sink</SelectItem>
                                  <SelectItem value="E-Sink DI">E-Sink DI</SelectItem>
                                  <SelectItem value="E-Drain">E-Drain</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`basins.${index}.size`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Basin Size *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select basin size" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="20X20X8">20" × 20" × 8"</SelectItem>
                                  <SelectItem value="24X20X8">24" × 20" × 8"</SelectItem>
                                  <SelectItem value="24X20X10">24" × 20" × 10"</SelectItem>
                                  <SelectItem value="30X20X8">30" × 20" × 8"</SelectItem>
                                  <SelectItem value="30X20X10">30" × 20" × 10"</SelectItem>
                                  <SelectItem value="Custom">Custom Size</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {watchedValues.basins?.[index]?.size === 'Custom' && (
                          <>
                            <FormField
                              control={form.control}
                              name={`basins.${index}.customSize.width`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Width (inches) *</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="12"
                                      max="36"
                                      placeholder="Width"
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
                              name={`basins.${index}.customSize.length`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Length (inches) *</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="12"
                                      max="36"
                                      placeholder="Length"
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        )}

                        <FormField
                          control={form.control}
                          name={`basins.${index}.hasPTrap`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm">P-Trap Disinfection</FormLabel>
                                <FormDescription className="text-xs">
                                  Add P-trap drain unit
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

                        <FormField
                          control={form.control}
                          name={`basins.${index}.hasBasinLight`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm">Basin Light</FormLabel>
                                <FormDescription className="text-xs">
                                  Add illumination to basin
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
                      </div>
                    </div>
                  ))}
                </div>

                {/* Control Box Info */}
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Info className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Required Control Box</span>
                  </div>
                  <p className="text-sm text-green-800">
                    Based on your basin configuration: <strong>{controlBoxType}</strong>
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="faucets" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Faucet Configuration</Label>
                  <div className="flex gap-2">
                    {faucetFields.length < getMaxFaucets() && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendFaucet({ 
                          type: '10" WRIST BLADE SWING SPOUT WALL MOUNTED FAUCET KIT', 
                          quantity: 1, 
                          hasSprayer: false 
                        })}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Faucet
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {faucetFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Faucet {index + 1}</h4>
                        {faucetFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFaucet(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`faucets.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Faucet Type *</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                disabled={watchedValues.basins?.some(b => b.type === 'E-Sink DI')}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select faucet type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value='10" WRIST BLADE SWING SPOUT WALL MOUNTED FAUCET KIT'>
                                    10" Wrist Blade Swing Spout
                                  </SelectItem>
                                  <SelectItem value="PRE-RINSE OVERHEAD SPRAY UNIT KIT">
                                    Pre-Rinse Overhead Spray Unit
                                  </SelectItem>
                                  <SelectItem value="GOOSENECK TREATED WATER FAUCET KIT PVC">
                                    Gooseneck Treated Water Faucet (PVC)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              {watchedValues.basins?.some(b => b.type === 'E-Sink DI') && (
                                <FormDescription className="text-xs">
                                  E-Sink DI automatically selects Gooseneck faucet
                                </FormDescription>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`faucets.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity *</FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select quantity" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">1</SelectItem>
                                  {currentBasinCount >= 2 && <SelectItem value="2">2</SelectItem>}
                                  {currentBasinCount >= 3 && <SelectItem value="3">3</SelectItem>}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {currentBasinCount > 1 && (
                          <FormField
                            control={form.control}
                            name={`faucets.${index}.placement`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Placement</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select placement" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Center">Center</SelectItem>
                                    <SelectItem value="Between Basins">Between Basins</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <FormField
                          control={form.control}
                          name={`faucets.${index}.hasSprayer`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm">Add Sprayer</FormLabel>
                                <FormDescription className="text-xs">
                                  Include water/air gun kit
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

                        {watchedValues.faucets?.[index]?.hasSprayer && (
                          <>
                            <FormField
                              control={form.control}
                              name={`faucets.${index}.sprayerType`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Sprayer Type *</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select sprayer type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="DI WATER GUN KIT & TURRET">DI Water Gun Kit & Turret</SelectItem>
                                      <SelectItem value="DI WATER GUN KIT & ROSETTE">DI Water Gun Kit & Rosette</SelectItem>
                                      <SelectItem value="AIR GUN KIT & TURRET">Air Gun Kit & Turret</SelectItem>
                                      <SelectItem value="AIR GUN KIT & ROSETTE">Air Gun Kit & Rosette</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`faucets.${index}.sprayerQuantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Sprayer Quantity *</FormLabel>
                                  <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select quantity" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="1">1</SelectItem>
                                      <SelectItem value="2">2</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`faucets.${index}.sprayerLocation`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Sprayer Location *</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select location" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Left Side">Left Side</SelectItem>
                                      <SelectItem value="Right Side">Right Side</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
                  Continue to Accessories
                </Button>
              </div>
            </div>
          </Form>
        )}
      </CardContent>
    </Card>
  )
}