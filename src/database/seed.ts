import { PrismaClient } from '@prisma/client';
import Bcrypt from '../utils/Bcrypt';

async function seed() {
  const database = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  const bcrypt = new Bcrypt();
  const password = await bcrypt.genHash('12345678')

  await database.user.createMany({
    data: [
      { name: 'Asafe Dainez', email: 'asafe@test.com', password, cpf: '12345678901' },
      { name: 'test test', email: 'test@test.com', password, cpf: '12345678902' },
    ]
  });
}

seed();