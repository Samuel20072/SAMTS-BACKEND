import { ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { HealthController } from './health.controller';

describe('HealthController (Fase 3.3)', () => {
  let controller: HealthController;
  const query = jest.fn();

  beforeEach(async () => {
    query.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: getDataSourceToken(), useValue: { query } }],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('devuelve status ok cuando PostgreSQL responde', async () => {
    query.mockResolvedValue([{ '?column?': 1 }]);

    const result = await controller.check();

    expect(result.status).toBe('ok');
    expect(result.checks).toEqual({ database: 'up' });
    expect(typeof result.timestamp).toBe('string');
    expect(query).toHaveBeenCalledWith('SELECT 1');
  });

  it('lanza ServiceUnavailableException (503) cuando PostgreSQL falla', async () => {
    query.mockRejectedValue(new Error('connection refused'));

    await expect(controller.check()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('no expone detalles internos del error en la respuesta 503', async () => {
    query.mockRejectedValue(new Error('password authentication failed for user "postgres"'));

    try {
      await controller.check();
      fail('Se esperaba una excepción');
    } catch (error) {
      const response = (error as ServiceUnavailableException).getResponse() as Record<string, unknown>;
      const serialized = JSON.stringify(response);

      expect(response).toMatchObject({ status: 'error', checks: { database: 'down' } });
      expect(serialized).not.toContain('password');
      expect(serialized).not.toContain('postgres');
      expect(serialized).not.toContain('connection refused');
    }
  });
});
