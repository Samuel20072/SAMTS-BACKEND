import { PromotionsService } from './promotions.service';
import { IPromotionRepository } from '../domain/repositories/promotion.repository.interface';
import { Promotion } from '../domain/entities/promotion.entity';
import { ForbiddenException } from '@nestjs/common';

describe('PromotionsService — Recursos SAMTS y Aislamiento Multitenant', () => {
  let service: PromotionsService;
  let mockRepository: jest.Mocked<IPromotionRepository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn().mockImplementation((p: Promotion) => Promise.resolve({ ...p, id: 'promo-123', createdAt: new Date() })),
      findById: jest.fn(),
      findAndCount: jest.fn(),
      delete: jest.fn(),
    };

    service = new PromotionsService(mockRepository);
  });

  it('debe permitir crear una promoción propia de SAMTS con clientId null', async () => {
    const dto = {
      title: 'Descuento Lanzamiento SAMTS',
      description: '20% off en desarrollo web',
      code: 'SAMTS20',
      discountPercent: 20,
      startDate: '2026-11-01T00:00:00Z',
      endDate: '2026-11-30T23:59:59Z',
    };

    const result = await service.create(null, dto);

    expect(result.title).toBe(dto.title);
    expect(result.code).toBe('SAMTS20');
    expect(result.discountPercent).toBe(20);
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: null,
        code: 'SAMTS20',
        discountPercent: 20,
      }),
    );
  });

  it('debe impedir que un tenant acceda o modifique la promoción de otro tenant', async () => {
    const promoTenantA = new Promotion();
    promoTenantA.id = 'promo-tenant-a';
    promoTenantA.clientId = 'tenant-uuid-aaa';
    promoTenantA.title = 'Promo Privada Tenant A';

    mockRepository.findById.mockResolvedValue(promoTenantA);

    // Tenant B intenta modificar la promo de Tenant A
    await expect(
      service.update('promo-tenant-a', 'tenant-uuid-bbb', { title: 'Hack' }),
    ).rejects.toThrow(ForbiddenException);

    // Tenant B intenta eliminar la promo de Tenant A
    await expect(
      service.delete('promo-tenant-a', 'tenant-uuid-bbb'),
    ).rejects.toThrow(ForbiddenException);
  });
});
