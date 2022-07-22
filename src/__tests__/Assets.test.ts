import request from 'supertest';
import app from '../app';
import { prismaMock } from './prismaMock';
import AssetsService from '../services/Assets.service';

describe('Verifica venda de ativos', () => {
  test('Verifica se é possível comprar um ativo sem saldo na conta do usuário', async () => {
    const reqToken = await request(app).post('/login').send({
      cpf: '12345678902',
      password: '12345678',
    });

    const reqAllAssets = await request(app).get('/asset');

    const allAssets = reqAllAssets.body;

    const tokenUser = reqToken.body.token;

    const reqBuy = await request(app)
      .post('/asset/buy')
      .send({
        idAsset: allAssets[0].idAsset,
        quantity: 15,
      })
      .set('Authorization', `Bearer ${tokenUser}`);

    expect(reqBuy.status).toBe(400);
    expect(reqBuy.body.message).toBe(
      'Not enough funds to buy this quantity of assets'
    );
  });
});
