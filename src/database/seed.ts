import { PrismaClient } from '@prisma/client';
import Bcrypt from '../utils/Bcrypt';

async function seed() {
  const database = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  const bcrypt = new Bcrypt();
  const password = await bcrypt.genHash('12345678');

  await database.user.createMany({
    data: [
      {
        name: 'Asafe Dainez',
        email: 'asafe@test.com',
        password,
        cpf: '12345678901',
      },
      {
        name: 'test test',
        email: 'test@test.com',
        password,
        cpf: '12345678902',
      },
    ],
  });

  const user = await database.user.findUnique({
    where: {
      cpf: '12345678901',
    },
  });

  if (!user) {
    throw new Error('User not found.');
  }

  await database.accountMovement.createMany({
    data: [
      {
        idUser: user.id,
        operation: 'DEPOSIT',
        value: 15000.0,
      },
      {
        idUser: user.id,
        operation: 'WITHDRAW',
        value: 5000.0,
      },
      {
        idUser: user.id,
        operation: 'DEPOSIT',
        value: 1000.0,
      },
      {
        idUser: user.id,
        operation: 'DEPOSIT',
        value: 5000.0,
      },
    ],
  });

  await database.asset.createMany({
    data: [
      {
        assetName: 'VALE3',
        quantity: 500,
        value: 68.88,
      },
      {
        assetName: 'PETZ3',
        quantity: 100,
        value: 9.75,
      },
      {
        assetName: 'ABEV3',
        quantity: 200,
        value: 14.48,
      },
      {
        assetName: 'MODL3',
        quantity: 100,
        value: 2.9,
      },
      {
        assetName: 'ASAI3',
        quantity: 900,
        value: 15.49,
      },
      {
        assetName: 'NFLX34',
        quantity: 249,
        value: 23.03,
      },
      {
        assetName: 'PETR4',
        quantity: 100,
        value: 29.18,
      },
      {
        assetName: 'SEQL3',
        quantity: 15,
        value: 4.86,
      },
    ],
  });

  const VALE3 = await database.asset.findUnique({
    where: {
      assetName: 'VALE3',
    },
  });

  if (!VALE3) {
    throw new Error('VALE3 not found.');
  }

  const PETR4 = await database.asset.findUnique({
    where: {
      assetName: 'PETR4',
    },
  });

  if (!PETR4) {
    throw new Error('PETR4 not found.');
  }

  const ASAI3 = await database.asset.findUnique({
    where: {
      assetName: 'ASAI3',
    },
  });

  if (!ASAI3) {
    throw new Error('ASAI3 not found.');
  }

  await database.operations.createMany({
    data: [
      {
        idAsset: VALE3.id,
        idUser: user.id,
        purchasePrice: VALE3.value,
        quantity: 100,
        type: 'BUY',
      },
      {
        idAsset: PETR4.id,
        idUser: user.id,
        purchasePrice: PETR4.value,
        quantity: 15,
        type: 'BUY',
      },
      {
        idAsset: ASAI3.id,
        idUser: user.id,
        purchasePrice: ASAI3.value,
        quantity: 2,
        type: 'BUY',
      },
      {
        idAsset: ASAI3.id,
        idUser: user.id,
        purchasePrice: ASAI3.value,
        quantity: 2,
        type: 'SELL',
      },
      {
        idAsset: PETR4.id,
        idUser: user.id,
        purchasePrice: PETR4.value,
        quantity: 10,
        type: 'BUY',
      },
    ],
  });

  await database.accountMovement.createMany({
    data: [
      {
        idUser: user.id,
        operation: 'BUY_ASSET',
        value: 100 * 68.88,
      },
      {
        idUser: user.id,
        operation: 'BUY_ASSET',
        value: 15 * 29.18,
      },
      {
        idUser: user.id,
        operation: 'BUY_ASSET',
        value: 2 * 15.49,
      },
      {
        idUser: user.id,
        operation: 'SELL_ASSET',
        value: 2 * 15.49,
      },
      {
        idUser: user.id,
        operation: 'BUY_ASSET',
        value: 10 * 29.18,
      },
    ],
  });
}

seed();
