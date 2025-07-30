import { prisma } from './prisma'

interface SinkConfiguration {
  buildNumber: string
  sinkFamily: string
  sinkModel: string // T2-B1, T2-B2, T2-B3
  sinkLength: number // in inches
  legType: string // DL27, DL14, LC1
  legHeightType: string // Height Adjustable, Fixed Height
  feetType: string
  hasPegboard: boolean
  pegboardType?: string // Colorsafe+, Perforated, Solid
  pegboardSize?: string // Same as Sink Length or Custom Size
  pegboardWidth?: number
  pegboardLength?: number
  basins: Array<{
    type: string // E-Sink, E-Sink DI, E-Drain
    size: string // 20X20X8, 24X20X8, etc.
    customSize?: { width: number, length: number, depth: number }
    hasPTrap?: boolean
    hasBasinLight?: boolean
  }>
  faucets: Array<{
    type: string // 10" WRIST BLADE, PRE-RINSE, GOOSENECK
    quantity: number
    placement?: string
    hasSprayer?: boolean
    sprayerType?: string
    sprayerQuantity?: number
    sprayerLocation?: string
  }>
  accessories: Array<{
    assemblyCode: string
    quantity: number
  }>
}

export class BOMGenerator {
  private assemblies: Map<string, any> = new Map()

  async initialize() {
    const assemblies = await prisma.assembly.findMany({
      include: {
        components: {
          include: { part: true }
        }
      }
    })
    
    assemblies.forEach(assembly => {
      this.assemblies.set(assembly.assemblyCode, assembly)
    })
  }

  async generateBOM(config: SinkConfiguration): Promise<Array<{ assemblyCode: string, quantity: number, assemblyName: string }>> {
    const bom: Array<{ assemblyCode: string, quantity: number, assemblyName: string }> = []

    // 1. Sink Body Assembly - Based on length
    const bodyAssembly = this.getSinkBodyAssembly(config.sinkLength)
    if (bodyAssembly) {
      bom.push({ assemblyCode: bodyAssembly, quantity: 1, assemblyName: this.getAssemblyName(bodyAssembly) })
    }

    // 2. Leg Kit - Based on leg type and height type
    const legAssembly = this.getLegAssembly(config.legType, config.legHeightType)
    if (legAssembly) {
      bom.push({ assemblyCode: legAssembly, quantity: 1, assemblyName: this.getAssemblyName(legAssembly) })
    }

    // 3. Feet - Based on feet type
    const feetAssembly = this.getFeetAssembly(config.feetType)
    if (feetAssembly) {
      bom.push({ assemblyCode: feetAssembly, quantity: 1, assemblyName: this.getAssemblyName(feetAssembly) })
    }

    // 4. Pegboard Components
    if (config.hasPegboard) {
      const pegboardComponents = this.getPegboardComponents(config)
      bom.push(...pegboardComponents)
    }

    // 5. Basin Components
    for (const basin of config.basins) {
      const basinComponents = this.getBasinComponents(basin)
      bom.push(...basinComponents)
    }

    // 6. Control Box - Based on basin configuration
    const controlBox = this.getControlBox(config.basins)
    if (controlBox) {
      bom.push({ assemblyCode: controlBox, quantity: 1, assemblyName: this.getAssemblyName(controlBox) })
    }

    // 7. Faucet Components
    for (const faucet of config.faucets) {
      const faucetComponents = this.getFaucetComponents(faucet)
      bom.push(...faucetComponents)
    }

    // 8. Accessories
    for (const accessory of config.accessories) {
      bom.push({ 
        assemblyCode: accessory.assemblyCode, 
        quantity: accessory.quantity,
        assemblyName: this.getAssemblyName(accessory.assemblyCode)
      })
    }

    return bom
  }

  private getSinkBodyAssembly(length: number): string | null {
    if (length >= 48 && length <= 60) return '709.82' // T2-BODY-48-60-HA
    if (length >= 61 && length <= 72) return '709.83' // T2-BODY-61-72-HA
    if (length >= 73 && length <= 120) return '709.84' // T2-BODY-73-120-HA
    return null
  }

  private getLegAssembly(legType: string, heightType: string): string | null {
    if (heightType === 'Height Adjustable') {
      switch (legType) {
        case 'DL27': return '711.97' // T2-DL27-KIT
        case 'DL14': return '711.98' // T2-DL14-KIT
        case 'LC1': return '711.99' // T2-LC1-KIT
      }
    } else if (heightType === 'Fixed Height') {
      switch (legType) {
        case 'DL27': return '711.100' // T2-DL27-FH-KIT
        case 'DL14': return '711.101' // T2-DL14-FH-KIT
      }
    }
    return null
  }

  private getFeetAssembly(feetType: string): string | null {
    switch (feetType) {
      case 'Lock & Leveling Casters': return '711.95' // T2-LEVELING-CASTOR-475
      case 'S.S Adjustable Seismic Feet': return '711.96' // T2-SEISMIC-FEET
    }
    return null
  }

  private getPegboardComponents(config: SinkConfiguration): Array<{ assemblyCode: string, quantity: number, assemblyName: string }> {
    const components: Array<{ assemblyCode: string, quantity: number, assemblyName: string }> = []

    // Mandatory overhead light kit for MDRD
    if (config.sinkFamily === 'MDRD') {
      components.push({ assemblyCode: '716.128', quantity: 1, assemblyName: 'T2-OHL-MDRD-KIT' })
    }

    // Pegboard type specific kits
    if (config.pegboardType === 'Perforated') {
      components.push({ assemblyCode: '716.130', quantity: 1, assemblyName: 'T2-ADW-PB-PERF-KIT' })
    } else if (config.pegboardType === 'Solid') {
      components.push({ assemblyCode: '716.131', quantity: 1, assemblyName: 'T2-ADW-PB-SOLID-KIT' })
    }

    // Colorsafe+ pegboard
    if (config.pegboardType === 'Colorsafe+') {
      components.push({ assemblyCode: '708.77', quantity: 1, assemblyName: 'T-OA-PB-COLOR' })
    }

    // Pegboard size
    if (config.pegboardSize === 'Same as Sink Length') {
      const pegboardAssembly = this.getPegboardSizeAssembly(config.sinkLength)
      if (pegboardAssembly) {
        components.push({ assemblyCode: pegboardAssembly.code, quantity: 1, assemblyName: pegboardAssembly.name })
      }
    } else if (config.pegboardSize === 'Custom Size' && config.pegboardWidth && config.pegboardLength) {
      // Generate custom part number
      const customCode = '720.215.002'
      const customName = `T2-ADW-PB-${config.pegboardWidth}x${config.pegboardLength}`
      components.push({ assemblyCode: customCode, quantity: 1, assemblyName: customName })
    }

    return components
  }

  private getPegboardSizeAssembly(sinkLength: number): { code: string, name: string } | null {
    if (sinkLength >= 34 && sinkLength <= 47) return { code: '715.120', name: 'T2-ADW-PB-3436' }
    if (sinkLength >= 48 && sinkLength <= 59) return { code: '715.121', name: 'T2-ADW-PB-4836' }
    if (sinkLength >= 60 && sinkLength <= 71) return { code: '715.122', name: 'T2-ADW-PB-6036' }
    if (sinkLength >= 72 && sinkLength <= 83) return { code: '715.123', name: 'T2-ADW-PB-7236' }
    if (sinkLength >= 84 && sinkLength <= 95) return { code: '715.124', name: 'T2-ADW-PB-8436' }
    if (sinkLength >= 96 && sinkLength <= 107) return { code: '715.125', name: 'T2-ADW-PB-9636' }
    if (sinkLength >= 108 && sinkLength <= 119) return { code: '715.126', name: 'T2-ADW-PB-10836' }
    if (sinkLength >= 120 && sinkLength <= 130) return { code: '715.127', name: 'T2-ADW-PB-12036' }
    return null
  }

  private getBasinComponents(basin: any): Array<{ assemblyCode: string, quantity: number, assemblyName: string }> {
    const components: Array<{ assemblyCode: string, quantity: number, assemblyName: string }> = []

    // Basin type kit
    switch (basin.type) {
      case 'E-Sink': 
        components.push({ assemblyCode: '713.109', quantity: 1, assemblyName: 'T2-BSN-ESK-KIT' })
        break
      case 'E-Drain': 
        components.push({ assemblyCode: '713.107', quantity: 1, assemblyName: 'T2-BSN-EDR-KIT' })
        break
      case 'E-Sink DI': 
        components.push({ assemblyCode: '713.108', quantity: 1, assemblyName: 'T2-BSN-ESK-DI-KIT' })
        break
    }

    // Basin size
    if (basin.customSize) {
      const { width, length, depth } = basin.customSize
      components.push({ 
        assemblyCode: '720.215.001', 
        quantity: 1, 
        assemblyName: `T2-ADW-BASIN${width}X${length}X${depth}` 
      })
    } else {
      const basinSizeCode = this.getBasinSizeCode(basin.size)
      if (basinSizeCode) {
        components.push({ assemblyCode: basinSizeCode.code, quantity: 1, assemblyName: basinSizeCode.name })
      }
    }

    // P-Trap
    if (basin.hasPTrap) {
      components.push({ assemblyCode: '706.65', quantity: 1, assemblyName: 'T2-OA-MS-1026' })
    }

    // Basin Light
    if (basin.hasBasinLight) {
      if (basin.type === 'E-Drain') {
        components.push({ assemblyCode: '706.67', quantity: 1, assemblyName: 'T2-OA-BASIN-LIGHT-EDR-KIT' })
      } else if (basin.type === 'E-Sink' || basin.type === 'E-Sink DI') {
        components.push({ assemblyCode: '706.68', quantity: 1, assemblyName: 'T2-OA-BASIN-LIGHT-ESK-KIT' })
      }
    }

    return components
  }

  private getBasinSizeCode(size: string): { code: string, name: string } | null {
    const sizeMap: Record<string, { code: string, name: string }> = {
      '20X20X8': { code: '712.102', name: 'T2-ADW-BASIN20X20X8' },
      '24X20X8': { code: '712.103', name: 'T2-ADW-BASIN24X20X8' },
      '24X20X10': { code: '712.104', name: 'T2-ADW-BASIN24X20X10' },
      '30X20X8': { code: '712.105', name: 'T2-ADW-BASIN30X20X8' },
      '30X20X10': { code: '712.106', name: 'T2-ADW-BASIN30X20X10' }
    }
    return sizeMap[size] || null
  }

  private getControlBox(basins: Array<any>): string | null {
    const eSinkCount = basins.filter(b => b.type === 'E-Sink' || b.type === 'E-Sink DI').length
    const eDrainCount = basins.filter(b => b.type === 'E-Drain').length

    // Control box logic based on basin combinations
    if (eDrainCount === 1 && eSinkCount === 0) return '719.176' // T2-CTRL-EDR1
    if (eDrainCount === 0 && eSinkCount === 1) return '719.177' // T2-CTRL-ESK1
    if (eDrainCount === 1 && eSinkCount === 1) return '719.178' // T2-CTRL-EDR1-ESK1
    if (eDrainCount === 2 && eSinkCount === 0) return '719.179' // T2-CTRL-EDR2
    if (eDrainCount === 0 && eSinkCount === 2) return '719.180' // T2-CTRL-ESK2
    if (eDrainCount === 3 && eSinkCount === 0) return '719.181' // T2-CTRL-EDR3
    if (eDrainCount === 0 && eSinkCount === 3) return '719.182' // T2-CTRL-ESK3
    if (eDrainCount === 1 && eSinkCount === 2) return '719.183' // T2-CTRL-EDR1-ESK2
    if (eDrainCount === 2 && eSinkCount === 1) return '719.184' // T2-CTRL-EDR2-ESK1

    return null
  }

  private getFaucetComponents(faucet: any): Array<{ assemblyCode: string, quantity: number, assemblyName: string }> {
    const components: Array<{ assemblyCode: string, quantity: number, assemblyName: string }> = []

    // Faucet type
    let faucetCode: string | null = null
    switch (faucet.type) {
      case '10" WRIST BLADE SWING SPOUT WALL MOUNTED FAUCET KIT':
        faucetCode = '706.58' // T2-OA-STD-FAUCET-WB-KIT
        break
      case 'PRE-RINSE OVERHEAD SPRAY UNIT KIT':
        faucetCode = '706.59' // T2-OA-PRE-RINSE-FAUCET-KIT
        break
      case 'GOOSENECK TREATED WATER FAUCET KIT PVC':
        faucetCode = '706.60' // T2-OA-DI-GOOSENECK-FAUCET-KIT
        break
    }

    if (faucetCode) {
      components.push({ 
        assemblyCode: faucetCode, 
        quantity: faucet.quantity,
        assemblyName: this.getAssemblyName(faucetCode)
      })
    }

    // Sprayer components
    if (faucet.hasSprayer && faucet.sprayerType) {
      let sprayerCode: string | null = null
      switch (faucet.sprayerType) {
        case 'DI WATER GUN KIT & TURRET':
          sprayerCode = '706.61' // T2-OA-WATERGUN-TURRET-KIT
          break
        case 'DI WATER GUN KIT & ROSETTE':
          sprayerCode = '706.62' // T2-OA-WATERGUN-ROSETTE-KIT
          break
        case 'AIR GUN KIT & TURRET':
          sprayerCode = '706.63' // T2-OA-AIRGUN-TURRET-KIT
          break
        case 'AIR GUN KIT & ROSETTE':
          sprayerCode = '706.64' // T2-OA-AIRGUN-ROSETTE-KIT
          break
      }

      if (sprayerCode) {
        components.push({ 
          assemblyCode: sprayerCode, 
          quantity: faucet.sprayerQuantity || 1,
          assemblyName: this.getAssemblyName(sprayerCode)
        })
      }
    }

    return components
  }

  private getAssemblyName(assemblyCode: string): string {
    const assembly = this.assemblies.get(assemblyCode)
    return assembly?.name || `Assembly ${assemblyCode}`
  }
}