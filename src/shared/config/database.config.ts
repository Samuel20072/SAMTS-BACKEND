/**
 * Configuración y validación de TypeORM (Fase 3.3).
 *
 * Problema detectado en la auditoría: la configuración anterior
 * (`synchronize: process.env.NODE_ENV !== 'production'`) era "fail-open":
 * si `NODE_ENV` no estaba definido, `synchronize` quedaba activo y TypeORM podía
 * alterar el esquema de la base de datos de forma silenciosa.
 *
 * Reglas aplicadas:
 *  - `synchronize` SOLO se habilita si `NODE_ENV` es exactamente `development`
 *    o `test`. Cualquier otro valor (incluido `production`, `staging` o la
 *    ausencia de `NODE_ENV`) lo mantiene desactivado (fail-safe).
 *  - En entornos de producción se exige el uso de migraciones versionadas.
 *  - La configuración se valida antes de inicializar TypeORM.
 */

const DEV_LIKE_ENVS = new Set<string>(['development', 'test']);
const PRODUCTION_LIKE_ENVS = new Set<string>(['production', 'prod', 'staging']);

/** Normaliza `NODE_ENV` a minúsculas y sin espacios. */
export function normalizeNodeEnv(nodeEnv?: string): string {
  return (nodeEnv ?? '').trim().toLowerCase();
}

/** `true` solo para entornos explícitamente de desarrollo o prueba. */
export function isDevLikeEnvironment(nodeEnv?: string): boolean {
  return DEV_LIKE_ENVS.has(normalizeNodeEnv(nodeEnv));
}

/** `true` para entornos que deben tratarse como producción. */
export function isProductionLikeEnvironment(nodeEnv?: string): boolean {
  return PRODUCTION_LIKE_ENVS.has(normalizeNodeEnv(nodeEnv));
}

/**
 * Determina si TypeORM debe sincronizar el esquema.
 *
 * Fail-safe: solo devuelve `true` en `development`/`test`. En cualquier otro
 * caso (producción, staging o `NODE_ENV` ausente) devuelve `false`.
 */
export function resolveSynchronize(env: NodeJS.ProcessEnv = process.env): boolean {
  return isDevLikeEnvironment(env.NODE_ENV);
}

/**
 * Valida la configuración de TypeORM antes de inicializar la conexión.
 * Lanza un Error explícito si la configuración es insegura o incompleta.
 */
export function validateTypeOrmConfig(env: NodeJS.ProcessEnv = process.env): void {
  const nodeEnv = normalizeNodeEnv(env.NODE_ENV);

  // Invariante crítica: TypeORM nunca debe alterar el esquema en producción.
  if (isProductionLikeEnvironment(nodeEnv) && resolveSynchronize(env)) {
    throw new Error(
      'Configuración insegura: synchronize no puede estar activo en un entorno de producción. ' +
        'Aplique migraciones versionadas.',
    );
  }

  // La conexión a PostgreSQL es obligatoria.
  if (!(env.DATABASE_URL ?? '').trim()) {
    throw new Error('Configuración inválida: la variable de entorno DATABASE_URL no está definida.');
  }
}
