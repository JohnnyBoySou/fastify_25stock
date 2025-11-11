import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import Fastify from 'fastify'

import { dbPlugin } from '../../plugins/prisma'
import { AuthRoutes } from '../../features/(core)/auth/auth.routes'
import { ProductRoutes } from '../../features/(erp)/product/product.routes'
import { CategoryRoutes } from '../../features/(erp)/category/category.routes'

/*
TESTES DE INTEGRAÇÃO

[x] Autenticação
[ ] Listagem de produtos
[ ] Criação de produto
[ ] Atualização de produto
[ ] Exclusão de produto
[ ] Forçar exclusão de produto
[ ] Listagem de produtos ativos
[ ] Estatísticas de produtos
[ ] Busca de produtos
[ ] Filtragem de produtos
[ ] Ordenação de produtos
[ ] Paginação de produtos
*/

let app: any
let token: string

beforeAll(async () => {
  app = Fastify({ logger: false })
  await app.register(dbPlugin)
  await app.register(AuthRoutes, { prefix: '/auth' })
  await app.register(CategoryRoutes, { prefix: '/categories' })
  await app.register(ProductRoutes, { prefix: '/products' })
  await app.ready()
})

function expectPaginatedResponse(body: any) {
  expect(body).toHaveProperty('items')
  expect(body).toHaveProperty('pagination')
  expect(Array.isArray(body.items)).toBe(true)
  expect(typeof body.pagination.total).toBe('number')
}

describe('🔐 Autenticação e fluxo completo', () => {
  it('deve fazer login e retornar um token JWT válido', async () => {
    const loginResponse = await request(app.server).post('/auth/signin').send({
      email: process.env.TEST_USER_EMAIL,
      password: process.env.TEST_USER_PASSWORD,
    })

    expect(loginResponse.status).toBe(200)
    expect(loginResponse.body).toHaveProperty('token')

    token = loginResponse.body.token
  })

  it('deve listar categorias do usuário autenticado', async () => {
    const response = await request(app.server)
      .get('/categories')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expectPaginatedResponse(response.body)
  })

  /*
    it("deve listar produtos do usuário autenticado", async () => {
      const response = await request(app.server)
        .get("/products")
        .set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  */
})
