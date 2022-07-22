import request from 'supertest';
import app from '../app';
import { prismaMock } from './prismaMock';
import AssetsService from '../services/Assets.service';
import IAsset from '../interfaces/Asset';
import { StatusCodes } from 'http-status-codes';

describe('Verifica venda de ativos', () => {
  let tokenUser: string;
  let allAssets: IAsset[];

  beforeAll(async () => {
    const reqToken = await request(app).post('/login').send({
      cpf: '12345678902',
      password: '12345678',
    });

    const reqAllAssets = await request(app).get('/asset');

    allAssets = reqAllAssets.body;

    tokenUser = reqToken.body.token;
  });

  test('Verifica se é possível comprar um ativo sem saldo na conta do usuário', async () => {
    const reqBuy = await request(app)
      .post('/asset/buy')
      .send({
        idAsset: allAssets[0].idAsset,
        quantity: 15,
      })
      .set('Authorization', `Bearer ${tokenUser}`);

    expect(reqBuy.status).toBe(StatusCodes.BAD_REQUEST);
    expect(reqBuy.body.message).toBe(
      'Not enough funds to buy this quantity of assets'
    );
  });

  test('Verifica se é possível comprar um ativo que não existe', async () => {
    const reqBuy = await request(app)
      .post('/asset/buy')
      .send({
        idAsset: 'xablau',
        quantity: 15,
      })
      .set('Authorization', `Bearer ${tokenUser}`);

    expect(reqBuy.status).toBe(StatusCodes.NOT_FOUND);
    expect(reqBuy.body.message).toBe('Asset not found');
  });

  test('Verifica se é possível comprar mais ativos que a corretora tem disponível', async () => {
    const reqBuy = await request(app)
      .post('/asset/buy')
      .send({
        idAsset: allAssets[1].idAsset,
        quantity: allAssets[1].quantity + 1,
      })
      .set('Authorization', `Bearer ${tokenUser}`);

    expect(reqBuy.status).toBe(StatusCodes.BAD_REQUEST);
    expect(reqBuy.body.message).toBe('Not enough assets to buy');
  });

  test('Verifica se é possível comprar um ativo sem passar o id do ativo na requisição ', async () => {
    const reqBuy = await request(app)
      .post('/asset/buy')
      .send({
        quantity: 1,
      })
      .set('Authorization', `Bearer ${tokenUser}`);

    expect(reqBuy.status).toBe(StatusCodes.BAD_REQUEST);
    expect(reqBuy.body.message).toBe('"idAsset" is required');
  });

  test('Verifica se é possível comprar um ativo sem passar a quantidade na requisição ', async () => {
    const reqBuy = await request(app)
      .post('/asset/buy')
      .send({
        idAsset: allAssets[1].idAsset,
      })
      .set('Authorization', `Bearer ${tokenUser}`);

    expect(reqBuy.status).toBe(StatusCodes.BAD_REQUEST);
    expect(reqBuy.body.message).toBe('"quantity" is required');
  });

});
