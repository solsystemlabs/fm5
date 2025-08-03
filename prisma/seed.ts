import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Hash the password
  const hashedPassword = await bcrypt.hash('password', 12)

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