import { PrismaClient, Prisma } from '@prisma/client';
declare global {
  var NEW_GLOBAL: string;
}
// add prisma to the NodeJS global type
interface CustomNodeJsGlobal extends Global {
  prisma: PrismaClient
}

// Prevent multiple instances of Prisma Client in development
declare const global: CustomNodeJsGlobal

const client = global.prisma || new PrismaClient()

if (process.env.NODE_ENV === 'development') global.prisma = client
export { client, Prisma };
