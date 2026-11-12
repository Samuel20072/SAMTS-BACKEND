import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * Endpoint de salud para Dokploy / orquestadores (Fase 3.3).
 *
 * - Responde 200 cuando el servicio y su dependencia obligatoria (PostgreSQL)
 *   están operativos.
 * - Responde 503 cuando PostgreSQL no responde.
 * - No requiere autenticación para la comprobación básica.
 * - No expone credenciales ni detalles internos del error.
 * - La verificación es una consulta mínima (`SELECT 1`).
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  @ApiOperation({ summary: 'Comprobación de salud del servicio (liveness + readiness)' })
  @ApiResponse({ status: 200, description: 'Servicio saludable' })
  @ApiResponse({ status: 503, description: 'Dependencia obligatoria no disponible' })
  async check(): Promise<{
    status: 'ok';
    checks: { database: 'up' };
    timestamp: string;
  }> {
    const databaseUp = await this.checkDatabase();

    if (!databaseUp) {
      throw new ServiceUnavailableException({
        status: 'error',
        checks: { database: 'down' },
        timestamp: new Date().toISOString(),
      });
    }

    return {
      status: 'ok',
      checks: { database: 'up' },
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch {
      // No se registran detalles internos ni credenciales.
      return false;
    }
  }
}
