import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { setupMetrics } from './metrics.js';
import { setupSwagger } from './swagger.js';

/** Configuración común de la app: la usan main.ts y las pruebas de integración. */
export function configureApp(app: NestExpressApplication) {
  setupMetrics(app, 'space');
  // Las fotos subidas llegan en base64 dentro del JSON: se sube el límite (por defecto 100 KB).
  app.useBodyParser('json', { limit: '5mb' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  setupSwagger(app);
  return app;
}
