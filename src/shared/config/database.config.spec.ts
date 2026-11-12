import {
  isDevLikeEnvironment,
  isProductionLikeEnvironment,
  normalizeNodeEnv,
  resolveSynchronize,
  validateTypeOrmConfig,
} from './database.config';

const DB_URL = 'postgresql://user:pass@localhost:5432/db';

describe('database.config (Fase 3.3 - synchronize fail-safe)', () => {
  describe('resolveSynchronize', () => {
    it('activa synchronize en development', () => {
      expect(resolveSynchronize({ NODE_ENV: 'development' } as NodeJS.ProcessEnv)).toBe(true);
    });

    it('activa synchronize en test', () => {
      expect(resolveSynchronize({ NODE_ENV: 'test' } as NodeJS.ProcessEnv)).toBe(true);
    });

    it('desactiva synchronize en production', () => {
      expect(resolveSynchronize({ NODE_ENV: 'production' } as NodeJS.ProcessEnv)).toBe(false);
    });

    it('desactiva synchronize en staging', () => {
      expect(resolveSynchronize({ NODE_ENV: 'staging' } as NodeJS.ProcessEnv)).toBe(false);
    });

    it('desactiva synchronize cuando NODE_ENV no está definido (fail-safe)', () => {
      expect(resolveSynchronize({} as NodeJS.ProcessEnv)).toBe(false);
    });

    it('normaliza mayúsculas y espacios', () => {
      expect(resolveSynchronize({ NODE_ENV: '  Production  ' } as NodeJS.ProcessEnv)).toBe(false);
      expect(resolveSynchronize({ NODE_ENV: 'DEVELOPMENT' } as NodeJS.ProcessEnv)).toBe(true);
    });
  });

  describe('helpers de entorno', () => {
    it('normalizeNodeEnv recorta y baja a minúsculas', () => {
      expect(normalizeNodeEnv('  PROD ')).toBe('prod');
      expect(normalizeNodeEnv(undefined)).toBe('');
    });

    it('isDevLikeEnvironment', () => {
      expect(isDevLikeEnvironment('development')).toBe(true);
      expect(isDevLikeEnvironment('test')).toBe(true);
      expect(isDevLikeEnvironment('production')).toBe(false);
    });

    it('isProductionLikeEnvironment', () => {
      expect(isProductionLikeEnvironment('production')).toBe(true);
      expect(isProductionLikeEnvironment('prod')).toBe(true);
      expect(isProductionLikeEnvironment('staging')).toBe(true);
      expect(isProductionLikeEnvironment('development')).toBe(false);
    });
  });

  describe('validateTypeOrmConfig', () => {
    it('no lanza error en development con DATABASE_URL presente', () => {
      expect(() =>
        validateTypeOrmConfig({ NODE_ENV: 'development', DATABASE_URL: DB_URL } as NodeJS.ProcessEnv),
      ).not.toThrow();
    });

    it('no lanza error en production (synchronize queda desactivado)', () => {
      expect(() =>
        validateTypeOrmConfig({ NODE_ENV: 'production', DATABASE_URL: DB_URL } as NodeJS.ProcessEnv),
      ).not.toThrow();
    });

    it('lanza error cuando DATABASE_URL no está definida', () => {
      expect(() => validateTypeOrmConfig({ NODE_ENV: 'production' } as NodeJS.ProcessEnv)).toThrow(
        /DATABASE_URL no está definida/,
      );
    });
  });
});
