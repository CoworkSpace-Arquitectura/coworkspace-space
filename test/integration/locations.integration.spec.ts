import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { AppModule } from '../../src/app.module.js';
import { configureApp } from '../../src/setup-app.js';

/**
 * Integración: endpoint HTTP + reglas de negocio (roles y propiedad) + base de datos PostgreSQL real.
 * En GitHub Actions corre contra una base de prueba creada por el pipeline.
 */
describe('Sedes (integración con la base de datos)', () => {
  let app: NestExpressApplication;
  const gerente = { 'x-member-id': randomUUID(), 'x-member-role': 'MANAGER' };
  const otroGerente = { 'x-member-id': randomUUID(), 'x-member-role': 'MANAGER' };
  const jefe = { 'x-member-id': randomUUID(), 'x-member-role': 'OWNER' };
  let locationId = '';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configureApp(moduleRef.createNestApplication<NestExpressApplication>());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('un gerente crea una sede, queda a su cargo y se guarda con la zona horaria de su país', async () => {
    const created = await request(app.getHttpServer())
      .post('/locations')
      .set(gerente)
      .send({ name: 'Sede de prueba', city: 'Madrid', address: 'Calle del Pez 12', country: 'ES', currency: 'EUR' })
      .expect(201);
    locationId = created.body.id as string;

    expect(created.body.managerId).toBe(gerente['x-member-id']);
    expect(created.body.timeZone).toBe('Europe/Madrid');

    // Se consulta de nuevo: los datos salen de la base de datos
    const found = await request(app.getHttpServer()).get(`/locations/${locationId}`).expect(200);
    expect(found.body).toMatchObject({ name: 'Sede de prueba', city: 'Madrid', photos: [], rooms: [] });
  });

  it('otro gerente no puede modificarla y un socio no puede crear sedes', async () => {
    await request(app.getHttpServer()).patch(`/locations/${locationId}`).set(otroGerente).send({ name: 'X' }).expect(403);
    await request(app.getHttpServer())
      .post('/locations')
      .set({ 'x-member-id': randomUUID(), 'x-member-role': 'MEMBER' })
      .send({ name: 'No', city: 'Montería', address: 'Calle 1' })
      .expect(403);
  });

  it('solo el jefe la elimina, y después ya no existe', async () => {
    await request(app.getHttpServer()).delete(`/locations/${locationId}`).set(gerente).expect(403);
    await request(app.getHttpServer()).delete(`/locations/${locationId}`).set(jefe).expect(200);
    await request(app.getHttpServer()).get(`/locations/${locationId}`).expect(404);
  });
});
