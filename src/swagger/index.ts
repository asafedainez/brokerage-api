export default {
  openapi: '3.0.3',
  info: {
    title: 'Brokerage API',
    description:
      'Esse projeto é uma api de corretagem onde se pode comprar e vender ativos. A corretora contém uma lista de ativos com o preço e a quantidade disponível. Os usuários tem um cadastro e uma conta onde se pode depositar e sacar seus fundos. Todas as movimentações são salvas no banco de dados, sendo elas de ativos (compra e venda) ou na conta de usuários (compra e venda de ativos, depósitos e saques).',
    version: '1.0.0',
    contact: {
      name: 'Asafe Dainez',
      url: 'https://github.com/asafedainez',
    },
  },
  servers: [
    {
      url: 'https://brokerageapi.herokuapp.com',
      description: 'Deployed API',
    },
    {
      url: 'http://localhost:3000/',
      description: 'Localhost API',
    },
  ],
  paths: {
    '/user': {
      post: {
        summary: 'Cria um novo usuário',
        tags: ['User'],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/User',
              },
              examples: {
                user: {
                  value: {
                    name: 'test',
                    email: 'test@test.com',
                    password: '12345678',
                    cpf: '12345678903',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Usuário criado com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/JWT',
                },
              },
            },
          },
          '400': {
            description: 'Erro ao criar usuário',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                  },
                },
                example: {
                  message: '"name" is required',
                },
              },
            },
          },
          '500': {
            description: 'Erro ao criar usuário com o cpf já cadastrado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                  },
                },
                example: {
                  message: 'Unique constraint failed on the fields: (`cpf`)',
                },
              },
            },
          },
        },
      },
    },
    '/user/assets': {
      get: {
        summary: 'Lista todos os ativos do usuário',
        description:
          'Lista todos os ativos do usuário que ele tem quantidade maior que zero',
        tags: ['Asset', 'User'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Lista de ativos',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Asset',
                  },
                },
              },
            },
          },
          '401': {
            description: 'Erro de não passar o token de autenticação',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                  },
                },
                example: {
                  message: 'Token not found',
                },
              },
            },
          },
        },
      },
    },
    '/login': {
      post: {
        summary: 'Login do usuário já cadastrado',
        description:
          'Faz o login do usuário já cadastrado e retorna um token de autenticação',
        tags: ['Login'],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Login',
              },
              examples: {
                login: {
                  value: {
                    cpf: '12345678903',
                    password: '12345678',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login realizado com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/JWT',
                },
              },
            },
          },
          '401': {
            description: 'Erro ao fazer login',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                  },
                },
                example: {
                  message: 'CPF or password is incorrect',
                },
              },
            },
          },
        },
      },
    },
    '/assets': {
      get: {
        summary: 'Lista todos os ativos',
        description:
          'Lista todos os ativos da corretora inclusive quantos já foram vendidos',
        tags: ['Asset'],
        responses: {
          '200': {
            description: 'Lista de ativos',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Assets',
                  },
                },
              },
            },
          },
        },
      },
    },
    '/asset/{id}': {
      get: {
        summary: 'Lista ativo por id',
        tags: ['Asset'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: 'ID do ativo',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Lista o ativo',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Asset',
                },
              },
            },
          },
          '404': {
            description: 'Ativo não encontrado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                  },
                },
                example: {
                  message: 'Asset not found',
                },
              },
            },
          },
        },
      },
    },
    '/asset/buy': {
      post: {
        summary: 'Comprar um ativo',
        description:
          'Compra um ativo da corretora e retorna os dados da compra',
        tags: ['Asset'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/OperationAsset',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Dados da compra',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/OperationAssetData',
                },
              },
            },
          },
          '400': {
            description:
              'Erro ao comprar ativo por passar uma quantidade maior do que o disponível',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                  },
                },
                example: {
                  message: 'Not enough assets to buy',
                },
              },
            },
          },
          '401': {
            description:
              'Erro ao comprar um ativo sem passar o token de autenticação',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                  },
                },
                example: {
                  message: 'Token not found',
                },
              },
            },
          },
          '404': {
            description:
              'Erro ao passar um id de ativo que não existe na corretora',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                  },
                },
                example: {
                  message: 'Asset not found',
                },
              },
            },
          },
        },
      },
    },
    '/asset/sell': {
      post: {
        summary: 'Vender um ativo',
        description:
          'Vende um ativo para a corretora e retorna os dados da venda',
        tags: ['Asset'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/OperationAsset',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Dados da venda',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/OperationAssetData',
                },
              },
            },
          },
          '400': {
            description:
              'Erro ao vender ativo por passar uma quantidade maior do que o disponível',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                  },
                },
                example: {
                  message: 'Not enough assets to sell',
                },
              },
            },
          },
          '401': {
            description:
              'Erro ao comprar um ativo sem passar o token de autenticação',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                  },
                },
                example: {
                  message: 'Token not found',
                },
              },
            },
          },
          '404': {
            description:
              'Erro ao passar um id de ativo que não existe na carteira',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                  },
                },
                example: {
                  message: 'Asset not found in wallet',
                },
              },
            },
          },
        },
      },
    },
    '/account': {
      get: {
        summary: 'Retorna o saldo da conta do cliente',
        tags: ['Account'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Saldo da conta',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Account',
                },
              },
            },
          },
          '401': {
            description: 'Erro de não passar o token de autenticação',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                  },
                },
                example: {
                  message: 'Token not found',
                },
              },
            },
          },
        },
      },
    },
    '/account/deposit': {
      post: {
        summary: 'Depositar um valor na conta',
        tags: ['Account'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                properties: {
                  value: {
                    type: 'number',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Retorna os dados do depósito',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AccountMovement',
                },
              },
            },
          },
          '400': {
            description: 'Erro ao passar um valor menor ou igual a zero',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                  },
                },
                example: {
                  message: '"value" must be greater than 0',
                },
              },
            },
          },
          '401': {
            description: 'Erro de não passar o token de autenticação',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                  },
                },
                example: {
                  message: 'Token not found',
                },
              },
            },
          },
        },
      },
    },
    '/account/withdraw': {
      post: {
        summary: 'Sacar um valor na conta',
        tags: ['Account'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                properties: {
                  value: {
                    type: 'number',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Retorna os dados do saque',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AccountMovement',
                },
              },
            },
          },
          '400': {
            description: 'Erro ao passar um valor menor ou igual a zero',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                  },
                },
                example: {
                  message: '"value" must be greater than 0',
                },
              },
            },
          },
          '401': {
            description: 'Erro de não passar o token de autenticação',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                  },
                },
                example: {
                  message: 'Token not found',
                },
              },
            },
          },
        },
      },
    },
  },

  components: {
    schemas: {
      Asset: {
        type: 'object',
        properties: {
          idAsset: {
            type: 'string',
          },
          assetName: {
            type: 'string',
          },
          value: {
            type: 'number',
          },
          quantity: {
            type: 'number',
          },
        },
      },
      Assets: {
        type: 'object',
        properties: {
          idAsset: {
            type: 'string',
          },
          assetName: {
            type: 'string',
          },
          value: {
            type: 'number',
          },
          quantity: {
            type: 'number',
          },
          sold: {
            type: 'number',
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
          email: {
            type: 'string',
          },
          password: {
            type: 'string',
          },
          cpf: {
            type: 'string',
          },
        },
      },
      JWT: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
          },
        },
      },
      Login: {
        type: 'object',
        properties: {
          cpf: {
            type: 'string',
          },
          password: {
            type: 'string',
          },
        },
      },
      OperationAsset: {
        type: 'object',
        properties: {
          idAsset: {
            type: 'string',
          },
          quantity: {
            type: 'number',
          },
        },
      },
      OperationAssetData: {
        type: 'object',
        properties: {
          idUser: {
            type: 'string',
          },
          idAsset: {
            type: 'string',
          },
          quantity: {
            type: 'number',
          },
          purchasePrice: {
            type: 'number',
          },
          type: {
            type: 'string',
          },
        },
      },
      Account: {
        type: 'object',
        properties: {
          balance: {
            type: 'number',
          },
        },
      },
      AccountMovement: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          idUser: {
            type: 'string',
          },
          operation: {
            type: 'string',
          },
          value: {
            type: 'number',
          },
          createdAt: {
            type: 'string',
          },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};
