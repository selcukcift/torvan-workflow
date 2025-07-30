'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Plus, Minus, Package, ShoppingCart, Filter } from 'lucide-react'
import { toast } from 'sonner'

interface AccessoriesStepProps {
  data: any
  onComplete: (data: any) => void
  onBack: () => void
  canGoBack: boolean
}

// Accessory catalog organized by categories from the specification
const accessoryCategories = {
  'BASKETS, BINS & SHELVES': [
    { code: '702.4', name: 'T-OA-BINRAIL-24-KIT', description: 'BIN RAIL, 24" KIT' },
    { code: '702.5', name: 'T-OA-BINRAIL-36-KIT', description: 'BIN RAIL, 36" KIT' },
    { code: '702.6', name: 'T-OA-BINRAIL-48-KIT', description: 'BIN RAIL, 48" KIT' },
    { code: '702.7', name: 'T-OA-PFW1236FM-KIT', description: 'WIRE BASKET KIT, SLOT BRACKET HELD, CHROME, 36"W X 12"D WITH BRACKETS' },
    { code: '702.8', name: 'T-OA-PFW1218FM-KIT', description: 'WIRE BASKET KIT, SLOT BRACKET HELD, CHROME, 18"W X 12"D WITH BRACKETS' },
    { code: '702.9', name: 'T-OA-PFW1818FM-KIT', description: 'WIRE BASKET KIT, SLOT BRACKET HELD, CHROME, 18"W X 18"D WITH BRACKETS' },
    { code: '702.10', name: 'T-OA-SSSHELF-1812', description: 'STAINLESS STEEL SLOT SHELF, 18"W X 12"D' },
    { code: '702.11', name: 'T-OA-SSSHELF-1812-BOLT-ON-KIT', description: 'STAINLESS STEEL SHELF, 18"W X 12"D BOLT ON (FOR SOLID PEGBOARD) KIT' },
    { code: '702.12', name: 'T-OA-SSSHELF-3612', description: 'STAINLESS STEEL SLOT SHELF, 36"W X 12"D' },
    { code: '702.13', name: 'T-OA-SSSHELF-3612-BOLT-ON-KIT', description: 'STAINLESS STEEL SLOT SHELF, 36"W X 12"D BOLT ON (FOR SOLID PEGBOARD) KIT' },
    { code: '702.21', name: 'T-OA-SSSHELF-LGHT-1812-KIT', description: 'STAINLESS STEEL SLOT SHELF WITH UNDERLIGHT, 18"W X 12"D KIT' },
    { code: '702.22', name: 'T-OA-SSSHELF-LGHT-3612-KIT', description: 'STAINLESS STEEL SLOT SHELF WITH UNDERLIGHT, 36"W X 12"D KIT' },
    { code: '702.27', name: 'T-OA-FOOTREST-RAIL-KIT', description: 'FOOT RAIL REST KIT' },
  ],
  'HOLDERS, PLATES & HANGERS': [
    { code: '703.29', name: 'T-OA-1BRUSH-ORG-PB-KIT', description: 'SINGLE BRUSH HOLDER, STAY-PUT PEGBOARD MOUNT' },
    { code: '703.30', name: 'T-OA-6BRUSH-ORG-PB-KIT', description: '6 BRUSH ORGANIZER, STAY-PUT PEGBOARD MOUNT' },
    { code: '703.31', name: 'T-OA-WRK-FLW-PB', description: 'PEGBOARD MOUNT WORKFLOW INDICATOR (SET OF 3)' },
    { code: '703.32', name: 'T-OA-PPRACK-2066', description: 'STAINLESS STEEL PEEL POUCH RACK, 20.5 X 6 X 6' },
    { code: '703.33', name: 'T-OA-PB-SS-1L-SHLF', description: 'ONE LITRE DOUBLE BOTTLE HOLDER, STAINLESS STEEL' },
    { code: '703.34', name: 'T-OA-PB-SS-2G-SHLF', description: 'ONE GALLON DOUBLE DETERGENT HOLDER, STAINLESS STEEL' },
    { code: '703.35', name: 'T-OA-PB-SS-1GLOVE', description: 'SINGLE GLOVE DISPENSER, STAINLESS STEEL, 6"W X 11"H' },
    { code: '703.36', name: 'T-OA-PB-SS-2GLOVE', description: 'DOUBLE GLOVE DISPENSER, STAINLESS STEEL, 10"W X 11"H' },
    { code: '703.37', name: 'T-OA-PB-SS-3GLOVE', description: 'TRIPLE GLOVE DISPENSER, STAINLESS STEEL, 10"W X 17"H' },
    { code: '703.38', name: 'T2-OA-SC-2020-SS', description: 'SINK STAGING COVER FOR 20X20 BASIN, STAINLESS STEEL' },
    { code: '703.39', name: 'T2-OA-SC-2420-SS', description: 'SINK STAGING COVER FOR 24X20 BASIN, STAINLESS STEEL' },
    { code: '703.40', name: 'T2-OA-SC-3020-SS', description: 'SINK STAGING COVER FOR 30X20 BASIN, STAINLESS STEEL' },
  ],
  'LIGHTING ADD-ONS': [
    { code: '704.42', name: 'T-OA-MLIGHT-PB-KIT', description: 'MAGNIFYING LIGHT, 5" LENS, PEGBOARD MOUNT KIT' },
    { code: '704.43', name: 'T-OA-DIM-MLIGHT-PB-KIT', description: 'DIMMABLE MAGNIFYING LIGHT, 5" LENS, PEGBOARD MOUNT KIT' },
    { code: '704.44', name: 'T-OA-TASKLIGHT-PB', description: 'GOOSENECK 27" LED TASK LIGHT, 10DEG FOCUSING BEAM, IP65 HEAD, 24VDC, PB MOUNT' },
    { code: '704.45', name: 'T-OA-TASKLIGHT-PB-MAG-KIT', description: 'GOOSENECK LED TASK LIGHT WITH MAGNIFIER, FOCUSING BEAM, PB MOUNT KIT' },
  ],
  'ELECTRONIC & DIGITAL ADD-ONS': [
    { code: '705.46', name: 'T-OA-MNT-ARM', description: 'WALL MONITOR PIVOT, SINGLE MONITOR MOUNT' },
    { code: '705.47', name: 'T-OA-MNT-ARM-1EXT', description: 'WALL MONITOR ARM, 1 EXTENSION, SINGLE MONITOR MOUNT' },
    { code: '705.48', name: 'T-OA-MNT-ARM-2EXT', description: 'WALL MONITOR ARM, 2 EXTENSION, SINGLE MONITOR MOUNT' },
    { code: '705.49', name: 'T-OA-KB-MOUSE-ARM', description: 'WALL KEYBOARD ARM, KEYBOARD MOUNT WITH SLIDE-OUT MOUSE TRAY' },
    { code: '705.50', name: 'T-OA-2H-CPUSM', description: 'CPU HOLDER, VERTICAL, SMALL (80-063-200)' },
    { code: '705.51', name: 'T-OA-2H-CPULG', description: 'CPU HOLDER, VERTICAL, LARGE (97-468-202)' },
    { code: '705.52', name: 'T-OA-2H-CPUUV', description: 'CPU HOLDER, TETHERED, UNIVERSAL (80-105-064)' },
    { code: '705.53', name: 'T-OA-MMA-PB', description: 'MONITOR MOUNT ARM, SINGLE, PB MOUNT (45-353-026)' },
    { code: '705.54', name: 'T-OA-MMA-DUAL', description: 'MONITOR MOUNT ADAPTER, DUAL MONITOR (97-783)' },
    { code: '705.55', name: 'T-OA-MMA-LTAB', description: 'MONITOR MOUNT ADAPTER, TABLET, LOCKING (45-460-026)' },
    { code: '705.56', name: 'T-OA-MMA-LAP', description: 'MONITOR MOUNT ADAPTER, LAPTOP TRAY (50-193-200)' },
    { code: '705.57', name: 'T-OA-MNT-SINGLE-COMBO-PB', description: 'COMBO ARM, KEYBOARD & MONITOR MOUNT FOR PEGBOARD (BLACK)' },
  ],
  'DRAWERS & COMPARTMENTS': [
    { code: '702.25', name: 'T2-OA-CUST-SHELF-HA-SML', description: 'HEIGHT ADJUSTABLE BOTTOM SHELF ADDER (LENGTHS LESS THEN 84")' },
    { code: '702.26', name: 'T2-OA-CUST-SHELF-HA-LRG', description: 'HEIGHT ADJUSTABLE BOTTOM SHELF ADDER (LENGTHS GREATER THEN 84")' },
    { code: '702.28', name: 'T2-OA-DOSINGESK-BTMSHELF', description: 'BOTTOM SHELF FOR DOSING PUMP' },
  ]
}

export function AccessoriesStep({ data, onComplete, onBack, canGoBack }: AccessoriesStepProps) {
  const [selectedBuildNumber, setSelectedBuildNumber] = useState<string>('')
  const [completedConfigs, setCompletedConfigs] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('BASKETS, BINS & SHELVES')
  const [cart, setCart] = useState<Record<string, { accessory: any, quantity: number }>>({})

  const configurations = data.configurations || []
  const sinkConfigs = data.sinkConfigs || {}

  // Initialize with first configuration
  useEffect(() => {
    if (configurations.length > 0 && !selectedBuildNumber) {
      setSelectedBuildNumber(configurations[0].buildNumber)
    }
  }, [configurations, selectedBuildNumber])

  // Load saved accessories when build number changes
  useEffect(() => {
    if (selectedBuildNumber) {
      const savedAccessories = data.accessoryConfigs?.[selectedBuildNumber]
      if (savedAccessories) {
        const cartData: Record<string, { accessory: any, quantity: number }> = {}
        savedAccessories.forEach((item: any) => {
          const accessory = findAccessoryByCode(item.assemblyCode)
          if (accessory) {
            cartData[item.assemblyCode] = { accessory, quantity: item.quantity }
          }
        })
        setCart(cartData)
      } else {
        setCart({})
      }
    }
  }, [selectedBuildNumber, data.accessoryConfigs])

  const findAccessoryByCode = (code: string) => {
    for (const [category, accessories] of Object.entries(accessoryCategories)) {
      const found = accessories.find(acc => acc.code === code)
      if (found) return { ...found, category }
    }
    return null
  }

  // Filter accessories based on search term
  const filteredAccessories = useMemo(() => {
    const accessories = accessoryCategories[selectedCategory as keyof typeof accessoryCategories] || []
    if (!searchTerm) return accessories
    
    return accessories.filter(accessory => 
      accessory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accessory.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [selectedCategory, searchTerm])

  const addToCart = (accessory: any) => {
    setCart(prev => ({
      ...prev,
      [accessory.code]: {
        accessory: { ...accessory, category: selectedCategory },
        quantity: (prev[accessory.code]?.quantity || 0) + 1
      }
    }))
    toast.success(`Added ${accessory.name} to selection`)
  }

  const removeFromCart = (code: string) => {
    setCart(prev => {
      const updated = { ...prev }
      if (updated[code]) {
        if (updated[code].quantity > 1) {
          updated[code].quantity -= 1
        } else {
          delete updated[code]
        }
      }
      return updated
    })
  }

  const updateQuantity = (code: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(code)
      return
    }
    
    setCart(prev => ({
      ...prev,
      [code]: { ...prev[code], quantity }
    }))
  }

  const saveCurrentConfig = () => {
    const accessories = Object.entries(cart).map(([code, item]) => ({
      assemblyCode: code,
      quantity: item.quantity
    }))

    const updatedAccessoryConfigs = {
      ...data.accessoryConfigs,
      [selectedBuildNumber]: accessories
    }
    
    setCompletedConfigs(prev => new Set([...prev, selectedBuildNumber]))
    data.accessoryConfigs = updatedAccessoryConfigs
    toast.success(`Accessories saved for ${selectedBuildNumber}`)
  }

  const handleSubmit = () => {
    saveCurrentConfig()
    
    // Check if all configurations are completed
    const allCompleted = configurations.every((config: any) => 
      completedConfigs.has(config.buildNumber) || config.buildNumber === selectedBuildNumber
    )
    
    if (!allCompleted) {
      toast.error('Please complete all accessory selections before proceeding')
      return
    }

    onComplete({
      accessoryConfigs: {
        ...data.accessoryConfigs,
        [selectedBuildNumber]: Object.entries(cart).map(([code, item]) => ({
          assemblyCode: code,
          quantity: item.quantity
        }))
      }
    })
  }

  const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0)
  const currentSinkConfig = sinkConfigs[selectedBuildNumber]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
            5
          </span>
          Accessories Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Build Number Selection */}
        <div>
          <Label className="text-base font-medium">Select Accessories</Label>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Accessory Catalog */}
            <div className="lg:col-span-2 space-y-4">
              {/* Search and Filter */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search accessories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>

              {/* Category Tabs */}
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
                  {Object.keys(accessoryCategories).slice(0, 3).map((category) => (
                    <TabsTrigger key={category} value={category} className="text-xs">
                      {category.split(' ')[0]}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsList className="grid w-full grid-cols-2 mt-2">
                  {Object.keys(accessoryCategories).slice(3).map((category) => (
                    <TabsTrigger key={category} value={category} className="text-xs">
                      {category.split(' ')[0]}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(accessoryCategories).map(([category, accessories]) => (
                  <TabsContent key={category} value={category} className="mt-4">
                    <div className="space-y-3">
                      {filteredAccessories.map((accessory) => (
                        <div key={accessory.code} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Package className="h-4 w-4 text-gray-500" />
                              <span className="font-medium text-sm">{accessory.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {accessory.code}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {accessory.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {cart[accessory.code] && (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeFromCart(accessory.code)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-sm font-medium w-8 text-center">
                                  {cart[accessory.code].quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addToCart(accessory)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                            {!cart[accessory.code] && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addToCart(accessory)}
                                className="h-8"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                      {filteredAccessories.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No accessories found matching your search.
                        </div>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* Shopping Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <h3 className="font-medium">
                  Selected Items ({totalItems})
                </h3>
              </div>

              {currentSinkConfig && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Sink:</strong> {currentSinkConfig.sinkModel} - {currentSinkConfig.sinkLength}"
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>Pegboard:</strong> {currentSinkConfig.hasPegboard ? 'Yes' : 'No'}
                  </p>
                </div>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {Object.entries(cart).map(([code, item]) => (
                  <div key={code} className="p-2 border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">
                        {item.accessory.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(code)}
                        className="h-6 w-6 p-0 text-red-500"
                      >
                        ×
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {code}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(code, item.quantity - 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(code, parseInt(e.target.value) || 1)}
                          className="w-12 h-6 text-center text-xs"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(code, item.quantity + 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {Object.keys(cart).length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No accessories selected yet.
                    <br />
                    Browse the catalog to add items.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
              Save Selection
            </Button>
            <Button onClick={handleSubmit}>
              Continue to Review
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}