import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  // log: ['query', 'info', 'warn', 'error'],
});

export default prisma;

// async function main() {
//   // ... you will write your Prisma Client queries here
// }

// main()
//   .catch((e) => {
//     throw e;
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
