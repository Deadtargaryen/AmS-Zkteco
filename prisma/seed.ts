import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  await prisma.$connect()

  const hashedPassword = await bcrypt.hash('adminpassword', 10)

  // Create an admin user
  const adminUser = await prisma.user.create({
    data: {
      name: 'admin',
      password: hashedPassword,
      role: Role.ADMIN,
      lastActiveAt: new Date(),
    }
  })
  console.log('Admin User:', adminUser)

  // Create a Zone
  const zone = await prisma.zone.create({
    data: {
      name: 'Zone A'
    }
  })
  console.log('Zone:', zone)

  // Create a Member
  const member = await prisma.member.create({
    data: {
      firstname: 'Jane',
      middlename: 'K.',
      lastname: 'Doe',
      cardNo: 1001,
      address: '456 Main St',
      contactNo: '08012345678',
      gender: 'FEMALE',
      placeOfBirth: 'Townsville',
      occupation: 'Doctor',
      maritalStatus: 'SINGLE',
      zoneId: zone.id,
      status: 'ACTIVE'
    }
  })
  console.log('Member:', member)

  const allUsers = await prisma.user.findMany()
  console.log('All Users:', allUsers)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async e => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
