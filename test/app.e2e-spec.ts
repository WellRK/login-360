// Precisa do Postgres no ar e das migrations aplicadas (npm run db:up && npm run migration:run).
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module.js';

describe('Auth + Users (e2e)', () => {
  let app: INestApplication<App>;
  const email = `e2e-${Date.now()}@teste.com`;
  let token: string;

  beforeAll(async () => {
    process.loadEnvFile('.env');
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.get(DataSource).query('DELETE FROM users WHERE email = $1', [email]);
    await app.close();
  });

  it('health é público', () =>
    request(app.getHttpServer()).get('/api/health').expect(200).expect((r) => expect(r.body.success).toBe(true)));

  it('rota protegida sem token = 401', () => request(app.getHttpServer()).get('/api/users/me').expect(401));

  it('cadastro valida o corpo', () =>
    request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: 'X', email: 'nao-e-email', password: '123' })
      .expect(400)
      .expect((r) => expect(r.body.errors.length).toBeGreaterThan(0)));

  it('cadastro + login + me', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: 'Teste E2E', email, password: 'Senha1234' })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: 'Senha1234' })
      .expect(200);
    token = login.body.data.accessToken;

    const me = await request(app.getHttpServer()).get('/api/users/me').set('Authorization', `Bearer ${token}`).expect(200);
    expect(me.body.data.email).toBe(email);
    expect(me.body.data.password).toBeUndefined();
  });

  it('email duplicado = 409', () =>
    request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: 'Outro', email: email.toUpperCase(), password: 'Senha1234' })
      .expect(409));

  it('usuário comum não lista usuários (403)', () =>
    request(app.getHttpServer()).get('/api/users').set('Authorization', `Bearer ${token}`).expect(403));
});
