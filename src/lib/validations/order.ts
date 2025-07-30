import { z } from 'zod'

export const customerInfoSchema = z.object({
  poNumber: z.string().min(3, 'PO Number must be at least 3 characters'),
  customerName: z.string().min(3, 'Customer Name must be at least 3 characters'),
  projectName: z.string().min(3, 'Project Name must be at least 3 characters').optional().or(z.literal('')),
  salesPerson: z.string().min(3, 'Sales Person must be at least 3 characters'),
  wantDate: z.date({
    required_error: 'Desired delivery date is required',
  }).refine(date => date > new Date(), 'Delivery date must be in the future'),
  notes: z.string().optional(),
  language: z.enum(['EN', 'FR']).default('EN'),
  // File upload will be handled separately
})

export const sinkSelectionSchema = z.object({
  sinkFamily: z.enum(['MDRD', 'Endoscope', 'InstroSink']),
  configurations: z.array(z.object({
    buildNumber: z.string().min(1, 'Build number is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
  })).min(1, 'At least one sink configuration is required'),
})

export const sinkConfigSchema = z.object({
  buildNumber: z.string(),
  sinkModel: z.enum(['T2-B1', 'T2-B2', 'T2-B3']),
  sinkWidth: z.number().min(1, 'Width is required'),
  sinkLength: z.number().min(1, 'Length is required'),
  legType: z.enum(['DL27', 'DL14', 'LC1']),
  legHeightType: z.enum(['Height Adjustable', 'Fixed Height']),
  feetType: z.enum(['Lock & Leveling Casters', 'S.S Adjustable Seismic Feet']),
  workflowDirection: z.enum(['Left to Right', 'Right to Left']),
  hasPegboard: z.boolean(),
  pegboardType: z.enum(['Colorsafe+', 'Perforated', 'Solid']).optional(),
  pegboardColor: z.enum(['Green', 'Black', 'Yellow', 'Grey', 'Red', 'Blue', 'Orange', 'White']).optional(),
  pegboardSize: z.enum(['Same as Sink Length', 'Custom Size']).optional(),
  pegboardWidth: z.number().optional(),
  pegboardLength: z.number().optional(),
})

export const basinConfigSchema = z.object({
  buildNumber: z.string(),
  basins: z.array(z.object({
    type: z.enum(['E-Sink', 'E-Sink DI', 'E-Drain']),
    size: z.enum(['20X20X8', '24X20X8', '24X20X10', '30X20X8', '30X20X10', 'Custom']),
    customSize: z.object({
      width: z.number(),
      length: z.number(),
      depth: z.number(),
    }).optional(),
    hasPTrap: z.boolean().optional(),
    hasBasinLight: z.boolean().optional(),
  })),
  faucets: z.array(z.object({
    type: z.enum(['10" WRIST BLADE SWING SPOUT WALL MOUNTED FAUCET KIT', 'PRE-RINSE OVERHEAD SPRAY UNIT KIT', 'GOOSENECK TREATED WATER FAUCET KIT PVC']),
    quantity: z.number().min(1).max(3),
    placement: z.enum(['Center', 'Between Basins']).optional(),
    hasSprayer: z.boolean().optional(),
    sprayerType: z.enum(['DI WATER GUN KIT & TURRET', 'DI WATER GUN KIT & ROSETTE', 'AIR GUN KIT & TURRET', 'AIR GUN KIT & ROSETTE']).optional(),
    sprayerQuantity: z.number().min(1).max(2).optional(),
    sprayerLocation: z.enum(['Left Side', 'Right Side']).optional(),
  })),
})

export const accessoriesSchema = z.object({
  buildNumber: z.string(),
  accessories: z.array(z.object({
    assemblyCode: z.string(),
    quantity: z.number().min(1),
  })),
})

export type CustomerInfoData = z.infer<typeof customerInfoSchema>
export type SinkSelectionData = z.infer<typeof sinkSelectionSchema>
export type SinkConfigData = z.infer<typeof sinkConfigSchema>
export type BasinConfigData = z.infer<typeof basinConfigSchema>
export type AccessoriesData = z.infer<typeof accessoriesSchema>