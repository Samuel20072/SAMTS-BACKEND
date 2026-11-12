import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { SalesService } from './sales.service';
import { Client } from '../../clients/domain/entities/client.entity';
import { Product } from '../../products/domain/entities/product.entity';
import { Sale } from '../domain/entities/sale.entity';
import { SaleDetail } from '../domain/entities/sale-detail.entity';
import { Notification } from '../../notifications/domain/entities/notification.entity';

/**
 * Pruebas de regresión (Fase 3.3) del servicio de ventas.
 *
 * Verifican que la creación de una venta valide contra la base de datos que el
 * cliente (tenant) existe realmente, impidiendo identificadores ficticios o de
 * otro tenant, y que la transacción se revierta de forma segura al fallar.
 */
describe('SalesService.create — validación de tenant real', () => {
  const CLIENT_A = '11111111-1111-4111-8111-111111111111';
  const CLIENT_B = '22222222-2222-4222-8222-222222222222';
  const PRODUCT_ID = '33333333-3333-4333-8333-333333333333';

  let clientRepo: { findOne: jest.Mock };
  let productRepo: { findOne: jest.Mock; save: jest.Mock };
  let saleRepo: { save: jest.Mock };
  let notificationRepo: { save: jest.Mock };
  let manager: { getRepository: jest.Mock };
  let queryRunner: {
    connect: jest.Mock;
    startTransaction: jest.Mock;
    commitTransaction: jest.Mock;
    rollbackTransaction: jest.Mock;
    release: jest.Mock;
    manager: typeof manager;
  };
  let dataSource: { createQueryRunner: jest.Mock };
  let saleRepository: { findById: jest.Mock };

  const dto = () =>
    ({
      customerName: 'Carlos Mendoza',
      customerEmail: 'carlos@example.com',
      customerPhone: '+1234567890',
      details: [{ productId: PRODUCT_ID, quantity: 1 }],
    }) as any;

  beforeEach(() => {
    jest.clearAllMocks();

    clientRepo = { findOne: jest.fn() };
    productRepo = { findOne: jest.fn(), save: jest.fn() };
    saleRepo = { save: jest.fn() };
    notificationRepo = { save: jest.fn() };

    const repos = new Map<any, any>([
      [Client, clientRepo],
      [Product, productRepo],
      [Sale, saleRepo],
      [SaleDetail, {}],
      [Notification, notificationRepo],
    ]);

    manager = { getRepository: jest.fn((entity: any) => repos.get(entity)) };

    queryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      manager,
    };

    dataSource = { createQueryRunner: jest.fn(() => queryRunner) };
    saleRepository = { findById: jest.fn() };
  });

  const buildService = () =>
    new SalesService(saleRepository as any, dataSource as any);

  it('rechaza la venta si el cliente no existe y revierte la transacción', async () => {
    clientRepo.findOne.mockResolvedValue(null);

    const service = buildService();

    await expect(service.create(CLIENT_A, dto())).rejects.toBeInstanceOf(BadRequestException);
    expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
    expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
    expect(saleRepo.save).not.toHaveBeenCalled();
    expect(queryRunner.release).toHaveBeenCalledTimes(1);
  });

  it('rechaza un clientId ficticio no-UUID proveniente del controlador', async () => {
    // El servicio siempre recibe el clientId ya resuelto; si llegase un valor
    // ficticio, la búsqueda del cliente no lo encontraría y se rechaza.
    clientRepo.findOne.mockResolvedValue(null);

    const service = buildService();

    await expect(
      service.create('super-admin-global' as any, dto()),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(saleRepo.save).not.toHaveBeenCalled();
  });

  it('rechaza un producto que no pertenece al tenant indicado', async () => {
    clientRepo.findOne.mockResolvedValue({ id: CLIENT_A } as Client);
    productRepo.findOne.mockResolvedValue({
      id: PRODUCT_ID,
      name: 'Servicio Ajeno',
      clientId: CLIENT_B,
      isActive: true,
      stock: 10,
      price: 100,
    } as any);

    const service = buildService();

    await expect(service.create(CLIENT_A, dto())).rejects.toBeInstanceOf(ForbiddenException);
    expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
    expect(productRepo.save).not.toHaveBeenCalled();
  });

  it('crea la venta cuando el cliente existe y el producto pertenece al tenant', async () => {
    clientRepo.findOne.mockResolvedValue({ id: CLIENT_A } as Client);
    productRepo.findOne.mockResolvedValue({
      id: PRODUCT_ID,
      name: 'Servicio Propio',
      clientId: CLIENT_A,
      isActive: true,
      stock: 10,
      price: 250000,
    } as any);
    productRepo.save.mockResolvedValue(undefined);
    saleRepo.save.mockResolvedValue({ id: 'sale-99' });
    notificationRepo.save.mockResolvedValue(undefined);
    saleRepository.findById.mockResolvedValue({
      id: 'sale-99',
      clientId: CLIENT_A,
      total: 250000,
      details: [],
    } as any);

    const service = buildService();
    const result = await service.create(CLIENT_A, dto());

    expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(1);
    expect(queryRunner.rollbackTransaction).not.toHaveBeenCalled();
    expect(saleRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ clientId: CLIENT_A }),
    );
    expect(result).toBeDefined();
  });
});
