import { DashboardService } from './dashboard.service';
import { DataSource } from 'typeorm';
import { LeadStatus } from '../../../shared/enums/lead-status.enum';

describe('DashboardService — Centro de Operaciones Comerciales SAMTS', () => {
  let service: DashboardService;
  let mockDataSource: any;

  const mockLeads = [
    {
      id: 'lead-1',
      name: 'Carlos Mendoza',
      email: 'carlos@empresa.com',
      status: LeadStatus.NEW,
      estimatedValue: 2500000,
      createdAt: new Date(),
      followUpDate: new Date(Date.now() - 3600000), // Vencido hace 1 hora
    },
    {
      id: 'lead-2',
      name: 'Laura Restrepo',
      email: 'laura@clinica.com',
      status: LeadStatus.QUALIFIED,
      estimatedValue: 4500000,
      createdAt: new Date(),
      followUpDate: new Date(Date.now() + 86400000), // Mañana
    },
    {
      id: 'lead-3',
      name: 'Andrés Gómez',
      email: 'andres@restaurante.com',
      status: LeadStatus.WON,
      estimatedValue: 3200000,
      createdAt: new Date(),
    },
    {
      id: 'lead-4',
      name: 'Pedro Duarte',
      email: 'pedro@taller.com',
      status: LeadStatus.LOST,
      estimatedValue: 1800000,
      createdAt: new Date(),
    },
  ];

  beforeEach(() => {
    mockDataSource = {
      getRepository: jest.fn((entity) => {
        const name = entity?.name || '';
        if (name === 'LeadMagnetLead') {
          return {
            find: jest.fn().mockResolvedValue(mockLeads),
          };
        }
        if (name === 'Product') {
          return { count: jest.fn().mockResolvedValue(6) };
        }
        if (name === 'BlogPost') {
          return { count: jest.fn().mockResolvedValue(8) };
        }
        if (name === 'Promotion') {
          return { count: jest.fn().mockResolvedValue(2) };
        }
        if (name === 'Sale') {
          return {
            count: jest.fn().mockResolvedValue(0),
            find: jest.fn().mockResolvedValue([]),
            createQueryBuilder: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getRawOne: jest.fn().mockResolvedValue({ sum: 0 }),
              getRawMany: jest.fn().mockResolvedValue([]),
            }),
          };
        }
        if (name === 'SaleDetail') {
          return {
            createQueryBuilder: jest.fn().mockReturnValue({
              innerJoin: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              addGroupBy: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              getRawMany: jest.fn().mockResolvedValue([]),
            }),
          };
        }
        return {
          count: jest.fn().mockResolvedValue(0),
          find: jest.fn().mockResolvedValue([]),
          createQueryBuilder: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            addSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            groupBy: jest.fn().mockReturnThis(),
            addGroupBy: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            getRawOne: jest.fn().mockResolvedValue({ sum: 0 }),
            getRawMany: jest.fn().mockResolvedValue([]),
          }),
        };
      }),
    };

    service = new DashboardService(mockDataSource as unknown as DataSource);
  });

  it('debe calcular métricas comerciales 100% reales basadas en los leads', async () => {
    const stats = await service.getStats(null); // null = Modo SAMTS Global

    expect(stats.totalLeads).toBe(4);
    expect(stats.newLeads).toBe(1);
    expect(stats.qualifiedLeads).toBe(1);
    expect(stats.wonLeads).toBe(1);
    expect(stats.lostLeads).toBe(1);

    // Tasa de conversión: 1 ganado de 4 totales = 25.0%
    expect(stats.conversionRate).toBe(25.0);

    // Pipeline abierto: NEW (2.5M) + QUALIFIED (4.5M) = 7.0M
    expect(stats.estimatedPipelineValue).toBe(7000000);

    // Ingresos ganados: WON (3.2M)
    expect(stats.wonRevenue).toBe(3200000);

    // Seguimientos vencidos: lead-1 (vencido hace 1 hora y en estado abierto NEW)
    expect(stats.pendingFollowUps).toBe(1);

    // NO debe existir ningún cálculo simulado o multiplicador artificial
    expect((stats as any).aiGeneratedContentCount).toBeUndefined();
  });

  it('debe listar los leads recientes en orden con valores reales', async () => {
    const stats = await service.getStats(null);

    expect(stats.recentLeads.length).toBe(4);
    expect(stats.recentLeads[0].name).toBe('Carlos Mendoza');
    expect(stats.recentLeads[0].estimatedValue).toBe(2500000);
  });

  it('debe aislar estrictamente los leads cuando un tenant consulta su propio dashboard', async () => {
    const tenantStats = await service.getStats('tenant-uuid-1234');

    // Un tenant NO debe ver los leads comerciales de SAMTS
    expect(tenantStats.totalLeads).toBe(0);
    expect(tenantStats.newLeads).toBe(0);
    expect(tenantStats.openOpportunities).toBe(0);
    expect(tenantStats.estimatedPipelineValue).toBe(0);
    expect(tenantStats.recentLeads).toEqual([]);
    expect(tenantStats.leadsByStatus).toEqual({});
  });
});
