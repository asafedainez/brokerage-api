import request from 'supertest';
import app from '../app';
import { StatusCodes } from 'http-status-codes';

describe('Verificando conta', () => {
  let userToken: string;

  test('Verifica se é possível receber o sado da conta sem passar o token na requisição ', async () => {
    const reqAccount = await request(app).get('/account');

    expect(reqAccount.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(reqAccount.body.message).toBe('Token not found');
  });

  test('Verifica se caso não tenha nenhuma movimentação na conta o valor inicial é de 0 ', async () => {
    const reqNewUser = await request(app).post('/user').send({
      name: 'test',
      email: 'test2@test.com',
      password: '12345678',
      cpf: '12345678903',
    });

    userToken = reqNewUser.body.token;

    const reqAccount = await request(app)
      .get('/account')
      .set('Authorization', `Bearer ${userToken}`);

    expect(reqAccount.status).toBe(StatusCodes.OK);
    expect(reqAccount.body).toBeInstanceOf(Object);
    expect(reqAccount.body).toHaveProperty('balance');
    expect(reqAccount.body.balance).toBe(0);
  });

  test('Verifica se é possível fazer um depósito na conta sem passar o token na requisição', async () => {
    const reqDeposit = await request(app).post('/account/deposit').send({
      value: 100,
    });

    expect(reqDeposit.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(reqDeposit.body.message).toBe('Token not found');
  });

  test('Verifica se é possível fazer um depósito sem passar o valor na requisição', async () => {
    const reqDeposit = await request(app)
      .post('/account/deposit')
      .send({})
      .set('Authorization', `Bearer ${userToken}`);

    expect(reqDeposit.status).toBe(StatusCodes.BAD_REQUEST);
    expect(reqDeposit.body.message).toBe('"value" is required');
  });

  test('Verifica se é possível fazer um saque sem passar o valor na requisição', async () => {
    const reqWithdraw = await request(app)
      .post('/account/withdraw')
      .send({})
      .set('Authorization', `Bearer ${userToken}`);

    expect(reqWithdraw.status).toBe(StatusCodes.BAD_REQUEST);
    expect(reqWithdraw.body.message).toBe('"value" is required');
  });

  test('Verifica se é possível fazer um depósito com o valor igual ou menor que zero', async () => {
    const reqDepositZero = await request(app)
      .post('/account/deposit')
      .send({
        value: 0,
      })
      .set('Authorization', `Bearer ${userToken}`);

    const reqDepositNegative = await request(app)
      .post('/account/deposit')
      .send({
        value: -1,
      })
      .set('Authorization', `Bearer ${userToken}`);

    expect(reqDepositZero.status).toBe(StatusCodes.BAD_REQUEST);
    expect(reqDepositZero.body.message).toBe('"value" must be greater than 0');
    expect(reqDepositNegative.status).toBe(StatusCodes.BAD_REQUEST);
    expect(reqDepositNegative.body.message).toBe(
      '"value" must be greater than 0'
    );
  });

  test('Verifica se é possível sacar um valor maior que tem na conta', async () => {
    const reqWithDraw = await request(app)
      .post('/account/withdraw')
      .send({
        value: 100,
      })
      .set('Authorization', `Bearer ${userToken}`);

    expect(reqWithDraw.status).toBe(StatusCodes.BAD_REQUEST);
    expect(reqWithDraw.body.message).toBe('Insufficient funds');
  });

  test('Verifica se é possível depositar um valor na conta', async () => {
    const reqDeposit = await request(app)
      .post('/account/deposit')
      .send({
        value: 1000,
      })
      .set('Authorization', `Bearer ${userToken}`);

    expect(reqDeposit.status).toBe(StatusCodes.OK);
    expect(reqDeposit.body).toBeInstanceOf(Object);
    expect(reqDeposit.body).toHaveProperty('id');
    expect(reqDeposit.body).toHaveProperty('idUser');
    expect(reqDeposit.body).toHaveProperty('value');
    expect(reqDeposit.body).toHaveProperty('createdAt');
    expect(reqDeposit.body.value).toBe(1000);
    expect(reqDeposit.body.operation).toBe('DEPOSIT');
  });

  test('Verifica se é possível sacar da conta o valor igual ou menor que zero', async () => {
    const reqWithdrawZero = await request(app)
      .post('/account/withdraw')
      .send({
        value: 0,
      })
      .set('Authorization', `Bearer ${userToken}`);

    const reqWithdrawNegative = await request(app)
      .post('/account/withdraw')
      .send({
        value: -1,
      })
      .set('Authorization', `Bearer ${userToken}`);

    expect(reqWithdrawZero.status).toBe(StatusCodes.BAD_REQUEST);
    expect(reqWithdrawZero.body.message).toBe('"value" must be greater than 0');
    expect(reqWithdrawNegative.status).toBe(StatusCodes.BAD_REQUEST);
    expect(reqWithdrawNegative.body.message).toBe(
      '"value" must be greater than 0'
    );
  });

  test('Verifica se é possível sacar um valor na conta', async () => {
    const reqWithDraw = await request(app)
      .post('/account/withdraw')
      .send({
        value: 500,
      })
      .set('Authorization', `Bearer ${userToken}`);

    expect(reqWithDraw.status).toBe(StatusCodes.OK);
    expect(reqWithDraw.body).toBeInstanceOf(Object);
    expect(reqWithDraw.body).toHaveProperty('id');
    expect(reqWithDraw.body).toHaveProperty('idUser');
    expect(reqWithDraw.body).toHaveProperty('value');
    expect(reqWithDraw.body).toHaveProperty('createdAt');
    expect(reqWithDraw.body.value).toBe(500);
    expect(reqWithDraw.body.operation).toBe('WITHDRAW');
  });

  test('Verifica se é possível pegar o saldo da conta corretamente', async () => {
    const reqAccount = await request(app)
      .get('/account')
      .set('Authorization', `Bearer ${userToken}`);

    expect(reqAccount.status).toBe(StatusCodes.OK);
    expect(reqAccount.body).toBeInstanceOf(Object);
    expect(reqAccount.body).toHaveProperty('balance');
    expect(reqAccount.body.balance).toBe(500);
  });
});
