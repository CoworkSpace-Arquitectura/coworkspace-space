# CoworkSpace · Space Service

![CI-CD](https://github.com/CoworkSpace-Arquitectura/coworkspace-space/actions/workflows/deploy.yml/badge.svg)

Microservicio de sedes, salas y puestos: fotos, ubicación en el mapa, servicios incluidos, zona horaria y gerente asignado a cada sede. Solo gerentes (en sus sedes) y el jefe modifican el catálogo.

- **Despliegue:** https://coworkspace-space.onrender.com
- **Documentación de la API (Swagger):** https://coworkspace-space.onrender.com/docs

## Tecnologías

TypeScript, NestJS 12 y Node.js 24, Prisma 6 y PostgreSQL, Vitest y Supertest para pruebas, prom-client para métricas y @nestjs/swagger para la documentación. Se empaqueta con Docker.

## Instalación y ejecución local

```bash
npm install
cp .env.example .env        # en Windows: copy .env.example .env
npx prisma migrate dev          # crea las tablas en tu base local
npm run start:dev           # http://localhost:3001
```

Producción: `npm run build` y `node dist/main.js` (o la imagen Docker del `Dockerfile`).

## Variables de entorno

Están en `.env.example`. El archivo `.env` real no se sube al repositorio (está en `.gitignore`); en Render se configuran como variables de entorno y en GitHub Actions como *secrets*.

| Variable | Para qué sirve | Ejemplo |
| --- | --- | --- |
| `DATABASE_URL` | Base de datos PostgreSQL del servicio (en producción: Neon) | `postgresql://postgres:postgres@localhost:5432/coworkspace_space` |
| `PORT` | Puerto HTTP | `3001` |

## Base de datos

- PostgreSQL propio del servicio (en producción, una base en Neon). Ningún otro servicio accede a ella.
- Esquema en `prisma/schema.prisma` y 4 migraciones versionadas en `prisma/migrations/`.
- Las migraciones se aplican solas al arrancar el contenedor (`npx prisma migrate deploy`); en local: `npx prisma migrate dev`.
- Datos de ejemplo: las peticiones de `requests.http` (extensión REST Client de VS Code) crean datos de prueba.
- Respaldo: Neon permite restaurar la base a un punto anterior desde su panel.

## Endpoints

| Método | Ruta |
| --- | --- |
| POST | `/desks` |
| GET | `/desks` |
| GET | `/desks/:id` |
| PATCH | `/desks/:id` |
| DELETE | `/desks/:id` |
| POST | `/locations` |
| GET | `/locations` |
| GET | `/locations/:id` |
| PATCH | `/locations/:id` |
| PATCH | `/locations/:id/manager` |
| DELETE | `/locations/:id` |
| POST | `/locations/:locationId/photos` |
| GET | `/locations/:locationId/photos/:photoId/file` |
| DELETE | `/locations/:locationId/photos/:photoId` |
| POST | `/rooms` |
| GET | `/rooms` |
| GET | `/rooms/:id` |
| PATCH | `/rooms/:id` |
| DELETE | `/rooms/:id` |
| GET | `/metrics` (métricas para Prometheus) |
| GET | `/docs` (Swagger UI) |

## Pruebas

Pruebas unitarias en `src/**/*.spec.ts` (con mocks de la base, de otros servicios y de las APIs externas) y una prueba de integración en `test/integration/` contra un PostgreSQL y un Redis reales.

```bash
npx vitest run --exclude "test/**"   # solo unitarias, sin base de datos
npm test                              # unitarias + integración (requiere DATABASE_URL)
npm run test:cov                      # con reporte de cobertura (carpeta coverage/)
```

En GitHub Actions las pruebas corren contra PostgreSQL 16 y Redis 7 reales, y el reporte de cobertura queda como artefacto `cobertura-space`.

## CI/CD

`.github/workflows/deploy.yml` se ejecuta en cada push y pull request a `main` y llama al workflow reutilizable de [coworkspace-pipelines](https://github.com/CoworkSpace-Arquitectura/coworkspace-pipelines): lint, build, pruebas con cobertura → imagen Docker en GHCR → despliegue en Render. Si una prueba falla, no se construye la imagen ni se despliega. Los pull requests solo corren las pruebas.

## Monitoreo

`GET /metrics` expone métricas para Prometheus (peticiones por ruta y código, histograma de tiempos de respuesta y métricas del proceso). La configuración de Prometheus y el dashboard de Grafana están en `coworkspace-pipelines/monitoring`.
