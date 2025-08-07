import { PrismaClient } from '@prisma/client'
import { hashPassword } from 'better-auth/crypto'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Hash the password using better-auth
  const hashedPassword = await hashPassword('password')

  // Generate consistent user ID
  const userId = crypto.randomUUID()

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@fm.com' },
    update: {},
    create: {
      id: userId,
      name: 'Admin User',
      email: 'admin@fm.com',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      accounts: {
        create: {
          id: crypto.randomUUID(),
          accountId: 'admin@fm.com',
          providerId: 'credential',
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      }
    },
  })

  console.log('✅ Admin user created:', adminUser.email)

  // Create material types
  const plaType = await prisma.materialType.upsert({
    where: { name: 'PLA' },
    update: {},
    create: {
      id: crypto.randomUUID(),
      name: 'PLA'
    }
  })

  const petgType = await prisma.materialType.upsert({
    where: { name: 'PETG' },
    update: {},
    create: {
      id: crypto.randomUUID(),
      name: 'PETG'
    }
  })

  const absType = await prisma.materialType.upsert({
    where: { name: 'ABS' },
    update: {},
    create: {
      id: crypto.randomUUID(),
      name: 'ABS'
    }
  })

  console.log('✅ Material types created')

  // Create model categories
  const miniatureCategory = await prisma.modelCategory.upsert({
    where: { name: 'Miniatures' },
    update: {},
    create: {
      id: crypto.randomUUID(),
      name: 'Miniatures'
    }
  })

  const terrainCategory = await prisma.modelCategory.upsert({
    where: { name: 'Terrain' },
    update: {},
    create: {
      id: crypto.randomUUID(),
      name: 'Terrain'
    }
  })

  const vehicleCategory = await prisma.modelCategory.upsert({
    where: { name: 'Vehicles' },
    update: {},
    create: {
      id: crypto.randomUUID(),
      name: 'Vehicles'
    }
  })

  console.log('✅ Model categories created')

  // Create models
  const dragonModel = await prisma.model.upsert({
    where: { name: 'Ancient Dragon' },
    update: {},
    create: {
      id: crypto.randomUUID(),
      name: 'Ancient Dragon',
      modelCategoryId: miniatureCategory.id
    }
  })

  const castleModel = await prisma.model.upsert({
    where: { name: 'Medieval Castle' },
    update: {},
    create: {
      id: crypto.randomUUID(),
      name: 'Medieval Castle',
      modelCategoryId: terrainCategory.id
    }
  })

  const tankModel = await prisma.model.upsert({
    where: { name: 'Battle Tank' },
    update: {},
    create: {
      id: crypto.randomUUID(),
      name: 'Battle Tank',
      modelCategoryId: vehicleCategory.id
    }
  })

  console.log('✅ Models created')

  // Create filaments with model associations
  const redPlaFilament = await prisma.filament.create({
    data: {
      id: crypto.randomUUID(),
      color: 'Red',
      materialTypeId: plaType.id,
      models: {
        connect: [{ id: dragonModel.id }]
      }
    }
  })

  const grayPetgFilament = await prisma.filament.create({
    data: {
      id: crypto.randomUUID(),
      color: 'Gray',
      materialTypeId: petgType.id,
      models: {
        connect: [{ id: castleModel.id }]
      }
    }
  })

  const greenAbsFilament = await prisma.filament.create({
    data: {
      id: crypto.randomUUID(),
      color: 'Green',
      materialTypeId: absType.id,
      models: {
        connect: [{ id: tankModel.id }]
      }
    }
  })

  // Multi-purpose filament that works with multiple models
  const bluePlaFilament = await prisma.filament.create({
    data: {
      id: crypto.randomUUID(),
      color: 'Blue',
      materialTypeId: plaType.id,
      models: {
        connect: [{ id: dragonModel.id }, { id: castleModel.id }]
      }
    }
  })

  // Unassociated filament
  const whitePlaFilament = await prisma.filament.create({
    data: {
      id: crypto.randomUUID(),
      color: 'White',
      materialTypeId: plaType.id
    }
  })

  console.log('✅ Filaments created')
  console.log('🎉 Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })