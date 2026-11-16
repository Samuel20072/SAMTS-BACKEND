import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, timingSafeEqual } from 'crypto';

/**
 * Guard de autenticación servicio-a-servicio (S2S).
 *
 * Valida la cabecera `X-Service-Key` contra `SAMTS_CATALOG_SERVICE_KEY` usando
 * una comparación en tiempo constante. Si el secreto no está configurado:
 *  - En producción se rechaza la petición (ServiceUnavailableException).
 *  - En entornos no productivos se permite continuar (facilita pruebas locales).
 *
 * El valor del secreto NUNCA se registra en logs ni se incluye en los errores.
 */
@Injectable()
export class ServiceKeyGuard implements CanActivate {
  private static readonly HEADER = 'x-service-key';

  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = (this.config.get<string>('SAMTS_CATALOG_SERVICE_KEY') || '').trim();
    const isProduction =
      (this.config.get<string>('NODE_ENV') || '').trim().toLowerCase() === 'production';

    if (!expected) {
      if (isProduction) {
        throw new ServiceUnavailableException(
          'El secreto de servicio no está configurado (SAMTS_CATALOG_SERVICE_KEY).',
        );
      }
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const headerValue = request?.headers?.[ServiceKeyGuard.HEADER];
    const provided = Array.isArray(headerValue) ? headerValue[0] : headerValue;

    if (typeof provided !== 'string' || !this.safeCompare(provided, expected)) {
      throw new UnauthorizedException('Clave de servicio inválida.');
    }

    return true;
  }

  /** Comparación en tiempo constante (hash SHA-256 para igualar longitudes). */
  private safeCompare(provided: string, expected: string): boolean {
    const providedHash = createHash('sha256').update(provided).digest();
    const expectedHash = createHash('sha256').update(expected).digest();
    return timingSafeEqual(providedHash, expectedHash);
  }
}
