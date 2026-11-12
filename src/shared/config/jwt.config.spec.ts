import {
  DEFAULT_JWT_EXPIRES_IN,
  MIN_JWT_SECRET_LENGTH,
  resolveJwtExpiresIn,
  resolveJwtSecret,
} from './jwt.config';

const VALID_SECRET = 'a'.repeat(MIN_JWT_SECRET_LENGTH + 8);

describe('jwt.config (Fase 3.3 - hardening JWT_SECRET)', () => {
  describe('resolveJwtSecret', () => {
    it('lanza un error explícito cuando JWT_SECRET no está definido', () => {
      expect(() => resolveJwtSecret({ NODE_ENV: 'production' } as NodeJS.ProcessEnv)).toThrow(
        /JWT_SECRET no está definida/,
      );
    });

    it('lanza un error cuando JWT_SECRET está vacío', () => {
      expect(() =>
        resolveJwtSecret({ NODE_ENV: 'production', JWT_SECRET: '   ' } as NodeJS.ProcessEnv),
      ).toThrow(/JWT_SECRET no está definida/);
    });

    it('nunca incluye el valor del secreto en el mensaje de error', () => {
      const insecure = 'super-secret-key-change-in-production';
      let message = '';
      try {
        resolveJwtSecret({ NODE_ENV: 'production', JWT_SECRET: insecure } as NodeJS.ProcessEnv);
      } catch (error) {
        message = (error as Error).message;
      }
      expect(message).not.toContain(insecure);
    });

    it('rechaza los secretos por defecto conocidos en producción', () => {
      const insecureValues = [
        'super-secret-key-change-in-production',
        'changeme',
        'change-me',
        'secret',
        'jwt-secret',
      ];

      for (const value of insecureValues) {
        expect(() =>
          resolveJwtSecret({ NODE_ENV: 'production', JWT_SECRET: value } as NodeJS.ProcessEnv),
        ).toThrow(/valor por defecto conocido/);
      }
    });

    it('rechaza secretos demasiado cortos fuera de development/test', () => {
      expect(() =>
        resolveJwtSecret({ NODE_ENV: 'production', JWT_SECRET: 'short-value' } as NodeJS.ProcessEnv),
      ).toThrow(new RegExp(`al menos ${MIN_JWT_SECRET_LENGTH} caracteres`));
    });

    it('acepta un secreto válido y largo en producción', () => {
      expect(resolveJwtSecret({ NODE_ENV: 'production', JWT_SECRET: VALID_SECRET } as NodeJS.ProcessEnv)).toBe(
        VALID_SECRET,
      );
    });

    it('permite secretos cortos únicamente en development/test', () => {
      expect(resolveJwtSecret({ NODE_ENV: 'development', JWT_SECRET: 'dev' } as NodeJS.ProcessEnv)).toBe('dev');
      expect(resolveJwtSecret({ NODE_ENV: 'test', JWT_SECRET: 'dev' } as NodeJS.ProcessEnv)).toBe('dev');
    });

    it('aplica las reglas estrictas cuando NODE_ENV no está definido', () => {
      expect(() =>
        resolveJwtSecret({ JWT_SECRET: 'super-secret-key-change-in-production' } as NodeJS.ProcessEnv),
      ).toThrow(/valor por defecto conocido/);
      expect(() => resolveJwtSecret({ JWT_SECRET: 'short' } as NodeJS.ProcessEnv)).toThrow(
        /al menos 32 caracteres/,
      );
    });
  });

  describe('resolveJwtExpiresIn', () => {
    it('devuelve el valor por defecto cuando JWT_EXPIRES_IN no está definido', () => {
      expect(resolveJwtExpiresIn({} as NodeJS.ProcessEnv)).toBe(DEFAULT_JWT_EXPIRES_IN);
    });

    it('devuelve el valor configurado cuando existe', () => {
      expect(resolveJwtExpiresIn({ JWT_EXPIRES_IN: '2h' } as NodeJS.ProcessEnv)).toBe('2h');
    });
  });
});
