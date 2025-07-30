'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BOMGenerator } from '@/lib/bom-generator'
import { FileText, Download, Package, User, Settings, CheckCircle, Calendar, Share, Printer } from 'lucide-react'
import { toast } from 'sonner'

interface OrderReviewProps {
  data: any
  onComplete: (data: any) => void
  onBack: () => void
  canGoBack: boolean
}

export function OrderReview({ data, onComplete, onBack, canGoBack }: OrderReviewProps) {
  const [generatedBOMs, setGeneratedBOMs] = useState<Record<string, any>>({})
  const [isGeneratingBOM, setIsGeneratingBOM] = useState(false)
  const [selectedBuildNumber, setSelectedBuildNumber] = useState<string>('')

  const configurations = data.configurations || []

  useEffect(() => {
    if (configurations.length > 0 && !selectedBuildNumber) {
      setSelectedBuildNumber(configurations[0].buildNumber)
    }
  }, [configurations, selectedBuildNumber])

  const generateBOM = async (buildNumber: string) => {
    setIsGeneratingBOM(true)
    try {
      const bomGenerator = new BOMGenerator()
      await bomGenerator.initialize()

      const sinkConfig = data.sinkConfigs?.[buildNumber]
      const basinConfig = data.basinConfigs?.[buildNumber]
      const accessoryConfig = data.accessoryConfigs?.[buildNumber] || []

      if (!sinkConfig || !basinConfig) {
        toast.error('Missing configuration data for BOM generation')
        return
      }

      // Convert our data format to BOM generator format
      const bomConfig = {
        buildNumber,
        sinkFamily: data.sinkFamily,
        sinkModel: sinkConfig.sinkModel,
        sinkLength: sinkConfig.sinkLength,
        legType: sinkConfig.legType,
        legHeightType: sinkConfig.legHeightType,
        feetType: sinkConfig.feetType,
        hasPegboard: sinkConfig.hasPegboard,
        pegboardType: sinkConfig.pegboardType,
        pegboardSize: sinkConfig.pegboardSize,
        pegboardWidth: sinkConfig.pegboardWidth,
        pegboardLength: sinkConfig.pegboardLength,
        basins: basinConfig.basins,
        faucets: basinConfig.faucets,
        accessories: accessoryConfig
      }

      const bom = await bomGenerator.generateBOM(bomConfig)
      
      setGeneratedBOMs(prev => ({
        ...prev,
        [buildNumber]: bom
      }))

      toast.success(`BOM generated successfully for ${buildNumber}`)
    } catch (error) {
      console.error('BOM generation error:', error)
      toast.error('Failed to generate BOM. Please check configuration.')
    } finally {
      setIsGeneratingBOM(false)
    }
  }

  const generateAllBOMs = async () => {
    for (const config of configurations) {
      await generateBOM(config.buildNumber)
    }
  }

  const exportBOM = (buildNumber: string, format: 'csv' | 'pdf' = 'csv') => {
    const bom = generatedBOMs[buildNumber]
    if (!bom) {
      toast.error('Please generate BOM first')
      return
    }

    // Create CSV content
    const csvContent = [
      'Assembly Code,Assembly Name,Quantity',
      ...bom.map((item: any) => `${item.assemblyCode},${item.assemblyName},${item.quantity}`)
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `BOM_${buildNumber}_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast.success(`BOM exported for ${buildNumber}`)
  }

  const handleSubmitOrder = async () => {
    // Generate all BOMs before submission
    if (Object.keys(generatedBOMs).length === 0) {
      toast.info('Generating BOMs before submission...')
      await generateAllBOMs()
    }

    // Here we would save the order to the database
    const orderPayload = {
      ...data,
      generatedBOMs,
      submittedAt: new Date().toISOString(),
      status: 'CREATED'
    }

    console.log('Submitting order:', orderPayload)
    toast.success('Order submitted successfully!')
    
    onComplete({ 
      orderSubmitted: true,
      orderId: `ORD-${Date.now()}`,
      generatedBOMs 
    })
  }

  const getTotalQuantity = () => {
    return configurations.reduce((sum: number, config: any) => sum + config.quantity, 0)
  }

  const getTotalBOMItems = () => {
    return Object.values(generatedBOMs).reduce((sum: number, bom: any) => 
      sum + bom.reduce((bomSum: number, item: any) => bomSum + item.quantity, 0), 0
    )
  }

  const currentBOM = generatedBOMs[selectedBuildNumber]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
            6
          </span>
          Review & Submit Order
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Order Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Customer</p>
                  <p className="text-xs text-gray-600">{data.customerName}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Total Sinks</p>
                  <p className="text-xs text-gray-600">{getTotalQuantity()} units</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Configurations</p>
                  <p className="text-xs text-gray-600">{configurations.length} builds</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Delivery</p>
                  <p className="text-xs text-gray-600">
                    {new Date(data.wantDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* BOM Generation Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Bill of Materials (BOM)</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => selectedBuildNumber && generateBOM(selectedBuildNumber)}
                disabled={isGeneratingBOM}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                {isGeneratingBOM ? 'Generating...' : 'Generate BOM'}
              </Button>
              <Button
                variant="outline"
                onClick={generateAllBOMs}
                disabled={isGeneratingBOM}
                className="flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                Generate All
              </Button>
            </div>
          </div>

          {/* Build Number Selection for BOM View */}
          <div className="flex gap-2">
            {configurations.map((config: any) => (
              <Button
                key={config.buildNumber}
                variant={selectedBuildNumber === config.buildNumber ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedBuildNumber(config.buildNumber)}
                className="relative"
              >
                {config.buildNumber}
                {generatedBOMs[config.buildNumber] && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 bg-green-500">
                    ✓
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {/* BOM Display */}
          {currentBOM ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">BOM for {selectedBuildNumber}</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportBOM(selectedBuildNumber, 'csv')}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.print()
                      toast.success('BOM sent to printer')
                    }}
                    className="flex items-center gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        currentBOM.map((item: any) => 
                          `${item.assemblyCode} - ${item.assemblyName} (Qty: ${item.quantity})`
                        ).join('\n')
                      )
                      toast.success('BOM copied to clipboard')
                    }}
                    className="flex items-center gap-2"
                  >
                    <Share className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <div className="grid grid-cols-12 gap-4 font-medium text-sm">
                    <div className="col-span-3">Assembly Code</div>
                    <div className="col-span-7">Assembly Name</div>
                    <div className="col-span-2 text-center">Quantity</div>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {currentBOM.map((item: any, index: number) => (
                    <div key={index} className="px-4 py-3 border-b last:border-b-0 hover:bg-gray-50">
                      <div className="grid grid-cols-12 gap-4 items-center text-sm">
                        <div className="col-span-3">
                          <Badge variant="outline">{item.assemblyCode}</Badge>
                        </div>
                        <div className="col-span-7 font-medium">
                          {item.assemblyName}
                        </div>
                        <div className="col-span-2 text-center">
                          <Badge>{item.quantity}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 px-4 py-2 border-t">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Total Items:</span>
                    <span>{currentBOM.reduce((sum: number, item: any) => sum + item.quantity, 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 border rounded-lg bg-gray-50">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-4">
                Generate BOM to see bill of materials for {selectedBuildNumber}
              </p>
              <Button
                onClick={() => generateBOM(selectedBuildNumber)}
                disabled={isGeneratingBOM}
              >
                Generate BOM
              </Button>
            </div>
          )}
        </div>

        {/* Order Details */}
        <Tabs defaultValue="summary" className="w-full">
          <TabsList>
            <TabsTrigger value="summary">Order Summary</TabsTrigger>
            <TabsTrigger value="configurations">Configurations</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>PO Number:</strong> {data.poNumber}</div>
                  <div><strong>Customer:</strong> {data.customerName}</div>
                  <div><strong>Project:</strong> {data.projectName || 'N/A'}</div>
                  <div><strong>Sales Person:</strong> {data.salesPerson}</div>
                  <div><strong>Language:</strong> {data.language}</div>
                  <div><strong>Delivery Date:</strong> {new Date(data.wantDate).toLocaleDateString()}</div>
                  {data.notes && <div><strong>Notes:</strong> {data.notes}</div>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Order Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Sink Family:</strong> {data.sinkFamily}</div>
                  <div><strong>Total Configurations:</strong> {configurations.length}</div>
                  <div><strong>Total Quantity:</strong> {getTotalQuantity()}</div>
                  <div><strong>Generated BOMs:</strong> {Object.keys(generatedBOMs).length}</div>
                  <div><strong>Total BOM Items:</strong> {getTotalBOMItems()}</div>
                  <div><strong>Uploaded Files:</strong> {data.uploadedFiles?.length || 0}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="configurations" className="space-y-4">
            {configurations.map((config: any) => (
              <Card key={config.buildNumber}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    {config.buildNumber}
                    <Badge>Qty: {config.quantity}</Badge>
                    {generatedBOMs[config.buildNumber] && (
                      <Badge className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        BOM Ready
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <strong>Model:</strong><br />
                      {data.sinkConfigs?.[config.buildNumber]?.sinkModel || 'N/A'}
                    </div>
                    <div>
                      <strong>Dimensions:</strong><br />
                      {data.sinkConfigs?.[config.buildNumber]?.sinkWidth || 'N/A'}" × {data.sinkConfigs?.[config.buildNumber]?.sinkLength || 'N/A'}"
                    </div>
                    <div>
                      <strong>Basins:</strong><br />
                      {data.basinConfigs?.[config.buildNumber]?.basins?.length || 0} basins
                    </div>
                    <div>
                      <strong>Accessories:</strong><br />
                      {data.accessoryConfigs?.[config.buildNumber]?.length || 0} items
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Uploaded Documents</CardTitle>
              </CardHeader>
              <CardContent>
                {data.uploadedFiles && data.uploadedFiles.length > 0 ? (
                  <div className="space-y-2">
                    {data.uploadedFiles.map((file: File, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <FileText className="h-4 w-4" />
                        <span className="flex-1">{file.name}</span>
                        <Badge variant="outline">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No documents uploaded</p>
                )}
              </CardContent>
            </Card>
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
          <Button 
            onClick={handleSubmitOrder} 
            className="bg-green-600 hover:bg-green-700"
            disabled={isGeneratingBOM}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Submit Order
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}