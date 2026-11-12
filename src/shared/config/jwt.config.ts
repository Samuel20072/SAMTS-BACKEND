/**
 * Resolución y validación del secreto JWT (Fase 3.3).
 *
 * Reglas:
 *  - JWT_SECRET es OBLIGATORIO: el backend falla al iniciar si no está definido.
 *  - No existe un secreto por defecto en el código (se eliminó el antiguo
 *    fallback público 'super-secret-key-change-in-production').
 *  - En entornos que no sean explícitamente `development` o `test` se exige un
 *    secreto largo (>= 32 caracteres) y distinto de los valores inseguros conocidos.
 *  - El mensaje de error NUNCA incluye el valor del secreto.
 */

import type { StringValue } from 'ms';

/** Valores por defecto conocidos/públicos que nunca deben usarse como secreto real. */
const INSECURE_SECRETS = new Set<string>([
  'super-secret-key-change-in-production',
  'changeme',
  'change-me',
  'secret',
  'jwt-secret',
]);

/** Longitud mínima exigida fuera de development/test. */
export const MIN_JWT_SECRET_LENGTH = 32;

/** Duración por defecto del token de acceso. */
export const DEFAULT_JWT_EXPIRES_IN: StringValue = '1d';

function isDevLike(nodeEnv: string): boolean {
  return nodeEnv === 'development' || nodeEnv === 'test';
}

/**
 * Devuelve el secreto JWT validado o lanza un Error si la configuración es insegura.
 */
export function resolveJwtSecret(env: NodeJS.ProcessEnv = process.env): string {
  const nodeEnv = (env.NODE_ENV ?? '').trim().toLowerCase();
  const secret = (env.JWT_SECRET ?? '').trim();

  if (!secret) {
    throw new Error(
      'Configuración insegura: la variable de entorno JWT_SECRET no está definida. ' +
        'Defina un secreto aleatorio y largo antes de iniciar el backend.',
    );
  }

  // Fuera de development/test se aplican las reglas estrictas de producción.
  if (!isDevLike(nodeEnv)) {
    if (INSECURE_SECRETS.has(secret)) {
      throw new Error(
        'Configuración insegura: JWT_SECRET usa un valor por defecto conocido. ' +
          'Defina un secreto único y aleatorio antes de iniciar el backend.',
      );
    }

    if (secret.length < MIN_JWT_SECRET_LENGTH) {
      throw new Error(
        `Configuración insegura: JWT_SECRET debe tener al menos ${MIN_JWT_SECRET_LENGTH} caracteres.`,
      );
    }
  }

  return secret;
}

/** Duración del token de acceso, configurable mediante JWT_EXPIRES_IN. */
export function resolveJwtExpiresIn(env: NodeJS.ProcessEnv = process.env): StringValue {
  const value = (env.JWT_EXPIRES_IN ?? '').trim();
  return value.length > 0 ? (value as StringValue) : DEFAULT_JWT_EXPIRES_IN;
}
