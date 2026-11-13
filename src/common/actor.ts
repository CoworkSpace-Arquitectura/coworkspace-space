import { createParamDecorator, ForbiddenException, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export type Role = 'MEMBER' | 'MANAGER' | 'OWNER';

/** Quién hace la petición. Lo escribe el Gateway después de validar el JWT. */
export interface Actor {
  id?: string;
  role: Role;
}

const ROLES: readonly Role[] = ['MEMBER', 'MANAGER', 'OWNER'];

export function actorFromHeaders(headers: Request['headers']): Actor {
  const id = headers['x-member-id'];
  const role = headers['x-member-role'];
  return {
    id: typeof id === 'string' && id ? id : undefined,
    role: typeof role === 'string' && ROLES.includes(role as Role) ? (role as Role) : 'MEMBER',
  };
}

/** Uso: metodo(@CurrentActor() actor: Actor) */
export const CurrentActor = createParamDecorator((_data: unknown, ctx: ExecutionContext) =>
  actorFromHeaders(ctx.switchToHttp().getRequest<Request>().headers),
);

/** Gerente o jefe. Un socio normal no puede modificar sedes ni espacios. */
export function assertStaff(actor: Actor): asserts actor is Actor & { id: string } {
  if (!actor.id || actor.role === 'MEMBER') {
    throw new ForbiddenException('Solo un gerente o el jefe pueden hacer esto');
  }
}

export function assertOwner(actor: Actor): asserts actor is Actor & { id: string } {
  if (!actor.id || actor.role !== 'OWNER') {
    throw new ForbiddenException('Solo el jefe puede hacer esto');
  }
}
