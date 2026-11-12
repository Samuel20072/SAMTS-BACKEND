import { UsersController } from './users.controller';
import { ROLES_KEY } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../../shared/enums/user-role.enum';

/**
 * Pruebas de regresión de seguridad (Fase 3.2).
 *
 * El endpoint /api/users quedó expuesto sin autenticación durante la
 * implementación inicial, permitiendo crear usuarios con rol SUPER_ADMIN
 * de forma anónima. Estas pruebas garantizan que el controlador mantenga
 * los guards y la restricción de rol a nivel de clase.
 */
describe('UsersController — seguridad de autorización', () => {
  it('declara guards (JwtAuthGuard y RolesGuard) a nivel de controlador', () => {
    const guards = Reflect.getMetadata('__guards__', UsersController);
    expect(Array.isArray(guards)).toBe(true);
    expect(guards.length).toBeGreaterThanOrEqual(2);
  });

  it('restringe todo el controlador al rol SUPER_ADMIN', () => {
    const roles = Reflect.getMetadata(ROLES_KEY, UsersController);
    expect(roles).toEqual([UserRole.SUPER_ADMIN]);
  });
});
