import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { SalesController } from './sales.controller';
import { UserRole } from '../../../../shared/enums/user-role.enum';

/**
 * Pruebas de regresión (Fase 3.3).
 *
 * El endpoint POST /api/sales utilizaba el identificador ficticio
 * 'super-admin-global' como clientId. Estas pruebas garantizan que:
 *  - Nunca se envíe un identificador ficticio al servicio.
 *  - SUPER_ADMIN deba indicar un clientId real (no existe venta global).
 *  - Los usuarios de tenant no puedan operar sobre otro tenant.
 */
describe('SalesController — resolución segura del tenant en create', () => {
  const service = { create: jest.fn() };
  let controller: SalesController;

  const CLIENT_A = '11111111-1111-4111-8111-111111111111';
  const CLIENT_B = '22222222-2222-4222-8222-222222222222';

  const baseDto = () =>
    ({
      customerName: 'Carlos Mendoza',
      customerEmail: 'carlos@example.com',
      customerPhone: '+1234567890',
      details: [],
    }) as any;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new SalesController(service as any);
  });

  it('SUPER_ADMIN sin clientId → BadRequest y no llama al servicio', async () => {
    await expect(
      controller.create(baseDto(), { role: UserRole.SUPER_ADMIN, clientId: null }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(service.create).not.toHaveBeenCalled();
  });

  it('SUPER_ADMIN con clientId real → se propaga ese clientId', async () => {
    service.create.mockResolvedValue({ id: 'sale-1' });

    await controller.create(
      { ...baseDto(), clientId: CLIENT_A },
      { role: UserRole.SUPER_ADMIN, clientId: null },
    );

    expect(service.create).toHaveBeenCalledWith(CLIENT_A, expect.objectContaining({ clientId: CLIENT_A }));
  });

  it('nunca envía el literal "super-admin-global" ni un valor no-UUID', async () => {
    service.create.mockResolvedValue({ id: 'sale-2' });

    await controller.create(
      { ...baseDto(), clientId: CLIENT_A },
      { role: UserRole.SUPER_ADMIN, clientId: null },
    );

    const passedClientId = service.create.mock.calls[0][0];
    expect(passedClientId).not.toBe('super-admin-global');
    expect(passedClientId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('CLIENT_ADMIN usa exclusivamente el clientId de su token', async () => {
    service.create.mockResolvedValue({ id: 'sale-3' });

    await controller.create(baseDto(), { role: UserRole.CLIENT_ADMIN, clientId: CLIENT_A });

    expect(service.create).toHaveBeenCalledWith(CLIENT_A, expect.anything());
  });

  it('CLIENT_ADMIN que intenta crear una venta para otro tenant → Forbidden', async () => {
    await expect(
      controller.create(
        { ...baseDto(), clientId: CLIENT_B },
        { role: UserRole.CLIENT_ADMIN, clientId: CLIENT_A },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(service.create).not.toHaveBeenCalled();
  });

  it('empleado sin clientId asociado → Forbidden', async () => {
    await expect(
      controller.create(baseDto(), { role: UserRole.EMPLOYEE, clientId: null }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(service.create).not.toHaveBeenCalled();
  });
});
