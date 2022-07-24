import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import app from '../app';
import IAsset from '../interfaces/Asset';

describe('Verifica métodos GET de ativos', () => {
  test('Verifica se é possível pegar todos os ativos com a quantidade vendida de cada ativo', async () => {
    const reqAllAssets = await request(app).get('/assets');

    expect(reqAllAssets.status).toBe(StatusCodes.OK);
    expect(reqAllAssets.body).toBeInstanceOf(Array);
    expect(reqAllAssets.body[0]).toBeInstanceOf(Object);
    expect(reqAllAssets.body[0]).toHaveProperty('idAsset');
    expect(reqAllAssets.body[0]).toHaveProperty('assetName');
    expect(reqAllAssets.body[0]).toHaveProperty('value');
    expect(reqAllAssets.body[0]).toHaveProperty('quantity');
    expect(reqAllAssets.body[0]).toHaveProperty('sold');
  });

  test('Verifica se é possível pegar um ativo pelo id', async () => {
    const reqAllAssets = await request(app).get('/assets');

    const reqAssetById = await request(app).get(
      `/asset/${reqAllAssets.body[0].idAsset}`
    );

    expect(reqAssetById.status).toBe(StatusCodes.OK);
    expect(reqAssetById.body).toBeInstanceOf(Object);
    expect(reqAssetById.body).toHaveProperty('idAsset');
    expect(reqAssetById.body).toHaveProperty('assetName');
    expect(reqAssetById.body).toHaveProperty('value');
    expect(reqAssetById.body).toHaveProperty('quantity');
  });

  test('Verifica se é possível pegar um ativo pelo id que não existe', async () => {
    const reqAssetById = await request(app).get('/asset/xablau');

    expect(reqAssetById.status).toBe(StatusCodes.NOT_FOUND);
    expect(reqAssetById.body.message).toBe('Asset not found');
  });
});

describe('Verifica lista de ativos na carteira do cliente', () => {
  test('Verifica se retorna uma array vazio caso não tenha nenhum ativo', async () => {
    const reqToken = await request(app).post('/login').send({
      cpf: '12345678902',
      password: '12345678',
    });

    const tokenUser = reqToken.body.token;

    const reqAssets = await request(app)
      .get('/user/assets')
      .set('Authorization', `Bearer ${tokenUser}`);

    expect(reqAssets.status).toBe(StatusCodes.OK);
    expect(reqAssets.body).toBeInstanceOf(Array);
    expect(reqAssets.body.length).toBe(0);
  });
});

describe('Verifica compra de ativos', () => {
  let tokenUser: string;
  let allAssets: IAsset[];

  beforeAll(async () => {
    const reqToken = await request(app).post('/login').send({
      cpf: '12345678902',
      password: '12345678',
    });

    const reqAllAssets = await request(app).get('/assets');

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

  test('Verifica se é possível fazer uma compra de ativos sem passar o token do usuário na requisição', async () => {
    const reqBuy = await request(app).post('/asset/buy').send({
      idAsset: allAssets[1].idAsset,
      quantity: 1,
    });

    expect(reqBuy.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(reqBuy.body.message).toBe('Token not found');
  });

  test('Verifica se é possível comprar ativos e se retorna os dados da compra', async () => {
    await request(app)
      .post('/account/deposit')
      .send({
        value: 1000,
      })
      .set('Authorization', `Bearer ${tokenUser}`);

    const reqBuy = await request(app)
      .post('/asset/buy')
      .send({
        idAsset: allAssets[1].idAsset,
        quantity: 1,
      })
      .set('Authorization', `Bearer ${tokenUser}`);

    expect(reqBuy.status).toBe(StatusCodes.OK);
    expect(reqBuy.body).toHaveProperty('id');
    expect(reqBuy.body).toHaveProperty('idUser');
    expect(reqBuy.body).toHaveProperty('idAsset');
    expect(reqBuy.body).toHaveProperty('createdAt');
    expect(reqBuy.body).toHaveProperty('quantity');
    expect(reqBuy.body).toHaveProperty('purchasePrice');
    expect(reqBuy.body).toHaveProperty('type');
  });
});

describe('Verifica venda de ativos', () => {
  let tokenUser: string;
  let allAssets: IAsset[];

  beforeAll(async () => {
    const reqToken = await request(app).post('/login').send({
      cpf: '12345678902',
      password: '12345678',
    });

    const reqAllAssets = await request(app).get('/assets');

    allAssets = reqAllAssets.body;

    tokenUser = reqToken.body.token;
  });

  test('Verifica se é possível vender um ativo sem tê-lo comprado anteriormente', async () => {
    const reqSell = await request(app)
      .post('/asset/sell')
      .send({
        idAsset: allAssets[0].idAsset,
        quantity: 15,
      })
      .set('Authorization', `Bearer ${tokenUser}`);

    expect(reqSell.status).toBe(StatusCodes.NOT_FOUND);
    expect(reqSell.body.message).toBe('Asset not found in wallet');
  });

  test('Verifica se é possível vender um ativo que não existe', async () => {
    const reqSell = await request(app)
      .post('/asset/sell')
      .send({
        idAsset: 'xablau',
        quantity: 15,
      })
      .set('Authorization', `Bearer ${tokenUser}`);

    expect(reqSell.status).toBe(StatusCodes.NOT_FOUND);
    expect(reqSell.body.message).toBe('Asset not found in wallet');
  });

  test('Verifica se é possível vender mais ativos que tem disponível na carteira', async () => {
    await request(app)
      .post('/account/deposit')
      .send({
        value: 10000,
      })
      .set('Authorization', `Bearer ${tokenUser}`);

    await request(app)
      .post('/asset/buy')
      .send({
        idAsset: allAssets[1].idAsset,
        quantity: 10,
      })
      .set('Authorization', `Bearer ${tokenUser}`);

    const reqSell = await request(app)
      .post('/asset/sell')
      .send({
        idAsset: allAssets[1].idAsset,
        quantity: 11,
      })
      .set('Authorization', `Bearer ${tokenUser}`);

    expect(reqSell.status).toBe(StatusCodes.BAD_REQUEST);
    expect(reqSell.body.message).toBe('Not enough assets to sell');
  });

  test('Verifica se é possível vender um ativo sem passar o id do ativo na requisição ', async () => {
    const reqSell = await request(app)
      .post('/asset/sell')
      .send({
        quantity: 1,
      })
      .set('Authorization', `Bearer ${tokenUser}`);

    expect(reqSell.status).toBe(StatusCodes.BAD_REQUEST);
    expect(reqSell.body.message).toBe('"idAsset" is required');
  });

  test('Verifica se é possível vender um ativo sem passar a quantidade na requisição ', async () => {
    const reqSell = await request(app)
      .post('/asset/sell')
      .send({
        idAsset: allAssets[1].idAsset,
      })
      .set('Authorization', `Bearer ${tokenUser}`);

    expect(reqSell.status).toBe(StatusCodes.BAD_REQUEST);
    expect(reqSell.body.message).toBe('"quantity" is required');
  });

  test('Verifica se é possível fazer uma venda de ativos sem passar o token do usuário na requisição', async () => {
    const reqSell = await request(app).post('/asset/sell').send({
      idAsset: allAssets[1].idAsset,
      quantity: 1,
    });

    expect(reqSell.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(reqSell.body.message).toBe('Token not found');
  });

  test('Verifica se é possível vender ativos e se retorna os dados da venda', async () => {
    await request(app)
      .post('/account/deposit')
      .send({
        value: 10000,
      })
      .set('Authorization', `Bearer ${tokenUser}`);

    await request(app)
      .post('/asset/buy')
      .send({
        idAsset: allAssets[1].idAsset,
        quantity: 10,
      })
      .set('Authorization', `Bearer ${tokenUser}`);

    const reqSell = await request(app)
      .post('/asset/sell')
      .send({
        idAsset: allAssets[1].idAsset,
        quantity: 1,
      })
      .set('Authorization', `Bearer ${tokenUser}`);

    expect(reqSell.status).toBe(StatusCodes.OK);
    expect(reqSell.body).toHaveProperty('id');
    expect(reqSell.body).toHaveProperty('idUser');
    expect(reqSell.body).toHaveProperty('idAsset');
    expect(reqSell.body).toHaveProperty('createdAt');
    expect(reqSell.body).toHaveProperty('quantity');
    expect(reqSell.body).toHaveProperty('purchasePrice');
    expect(reqSell.body).toHaveProperty('type');
  });
});

describe('Verifica lista de ativos na carteira do cliente', () => {
  test('Verifica se retorna todos os ativos que contém quantidade', async () => {
    const reqToken = await request(app).post('/login').send({
      cpf: '12345678902',
      password: '12345678',
    });

    const tokenUser = reqToken.body.token;

    const reqAssets = await request(app)
      .get('/user/assets')
      .set('Authorization', `Bearer ${tokenUser}`);

    expect(reqAssets.status).toBe(StatusCodes.OK);
    expect(reqAssets.body).toBeInstanceOf(Array);
    expect(reqAssets.body.length).toBe(2);
    expect(reqAssets.body[0]).toHaveProperty('idAsset');
    expect(reqAssets.body[0]).toHaveProperty('assetName');
    expect(reqAssets.body[0]).toHaveProperty('value');
    expect(reqAssets.body[0]).toHaveProperty('quantity');
    expect(reqAssets.body[0].assetName).toBe('PETZ3');
    expect(reqAssets.body[0].quantity).toBe(1);
    expect(reqAssets.body[1].assetName).toBe('ABEV3');
    expect(reqAssets.body[1].quantity).toBe(19);
  });
});
