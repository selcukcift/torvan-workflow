import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Read JSON files
  const categoriesData = JSON.parse(readFileSync(join(process.cwd(), '../categories.json'), 'utf-8'))
  const assembliesData = JSON.parse(readFileSync(join(process.cwd(), '../assemblies.json'), 'utf-8'))
  const partsData = JSON.parse(readFileSync(join(process.cwd(), '../parts.json'), 'utf-8'))

  // Create demo users
  console.log('👥 Creating demo users...')
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const users = [
    {
      email: 'admin@torvan.com',
      name: 'System Admin',
      password: hashedPassword,
      role: 'ADMIN'
    },
    {
      email: 'production@torvan.com',
      name: 'Production Coordinator',
      password: await bcrypt.hash('prod123', 10),
      role: 'PRODUCTION_COORDINATOR'
    },
    {
      email: 'procurement@torvan.com',
      name: 'Procurement Specialist',
      password: await bcrypt.hash('proc123', 10),
      role: 'PROCUREMENT_SPECIALIST'
    },
    {
      email: 'qc@torvan.com',
      name: 'QC Specialist',
      password: await bcrypt.hash('qc123', 10),
      role: 'QC_SPECIALIST'
    },
    {
      email: 'assembler@torvan.com',
      name: 'Assembly Technician',
      password: await bcrypt.hash('asm123', 10),
      role: 'ASSEMBLER'
    },
    {
      email: 'service@torvan.com',
      name: 'Service Department',
      password: await bcrypt.hash('service123', 10),
      role: 'SERVICE_DEPARTMENT'
    }
  ]

  for (const userData of users) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData as any
    })
  }

  // Create categories and subcategories
  console.log('📂 Creating categories and subcategories...')
  for (const [categoryCode, categoryInfo] of Object.entries(categoriesData.categories)) {
    const category = await prisma.category.upsert({
      where: { categoryCode },
      update: {},
      create: {
        categoryCode,
        name: (categoryInfo as any).name,
        description: (categoryInfo as any).description
      }
    })

    // Create subcategories
    if ((categoryInfo as any).subcategories) {
      for (const [subcategoryCode, subcategoryInfo] of Object.entries((categoryInfo as any).subcategories)) {
        await prisma.subcategory.upsert({
          where: { subcategoryCode },
          update: {},
          create: {
            subcategoryCode,
            name: (subcategoryInfo as any).name,
            description: (subcategoryInfo as any).description,
            categoryId: category.id
          }
        })
      }
    }
  }

  // Create parts
  console.log('🔧 Creating parts...')
  for (const [partNumber, partInfo] of Object.entries(partsData.parts)) {
    await prisma.part.upsert({
      where: { partNumber },
      update: {},
      create: {
        partNumber,
        name: (partInfo as any).name,
        manufacturerPartNumber: (partInfo as any).manufacturer_part_number,
        manufacturerInfo: (partInfo as any).manufacturer_info,
        type: (partInfo as any).type || 'COMPONENT',
        status: (partInfo as any).status || 'ACTIVE'
      }
    })
  }

  // Create assemblies
  console.log('🏗️ Creating assemblies...')
  for (const [assemblyCode, assemblyInfo] of Object.entries(assembliesData.assemblies)) {
    // Find category and subcategory
    const categoryCode = (assemblyInfo as any).category_code
    const subcategoryCode = (assemblyInfo as any).subcategory_code

    const category = await prisma.category.findUnique({
      where: { categoryCode }
    })

    const subcategory = subcategoryCode ? await prisma.subcategory.findUnique({
      where: { subcategoryCode }
    }) : null

    if (!category) {
      console.warn(`Category ${categoryCode} not found for assembly ${assemblyCode}`)
      continue
    }

    const assembly = await prisma.assembly.upsert({
      where: { assemblyCode },
      update: {},
      create: {
        assemblyCode,
        name: (assemblyInfo as any).name,
        type: (assemblyInfo as any).type,
        categoryId: category.id,
        subcategoryId: subcategory?.id,
        canOrder: (assemblyInfo as any).can_order ?? true,
        isKit: (assemblyInfo as any).is_kit ?? false,
        status: (assemblyInfo as any).status || 'ACTIVE'
      }
    })

    // Create assembly components
    if ((assemblyInfo as any).components) {
      for (const component of (assemblyInfo as any).components) {
        const part = await prisma.part.findUnique({
          where: { partNumber: component.part_id }
        })

        if (part) {
          await prisma.assemblyComponent.upsert({
            where: {
              assemblyId_partId: {
                assemblyId: assembly.id,
                partId: part.id
              }
            },
            update: { quantity: component.quantity },
            create: {
              assemblyId: assembly.id,
              partId: part.id,
              quantity: component.quantity
            }
          })
        } else {
          console.warn(`Part ${component.part_id} not found for assembly ${assemblyCode}`)
        }
      }
    }
  }

  console.log('✅ Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })