import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/** Payload enviado al Catalog para emitir una invitación. */
export interface IssueInvitationPayload {
  email: string;
  externalLeadId: string;
  campaign: string;
  businessName?: string;
}

/** Resultado de emitir/reenviar una invitación en el Catalog. */
export interface CatalogInvitationResult {
  invitationId: string;
  status: string;
  expiresAt: string | null;
  emailSent: boolean;
  reused?: boolean;
}

/** Estado de una invitación consultado al Catalog. */
export interface CatalogInvitationStatus {
  exists: boolean;
  campaign: string;
  externalLeadId: string;
  invitationId?: string;
  status?: string;
  emailMasked?: string;
  issuedAt?: string;
  sentAt?: string;
  usedAt?: string;
  expiresAt?: string;
  revokedAt?: string;
  lastError?: string | null;
  trialDays?: number;
}

/**
 * Cliente servicio-a-servicio (S2S) hacia el contrato de invitaciones de SAMTS Catalog.
 *
 * Usa el `fetch` nativo de Node con timeout vía AbortController. El secreto de
 * servicio viaja en la cabecera `X-Service-Key` y NUNCA se registra en logs ni se
 * expone en los mensajes de error.
 */
@Injectable()
export class CatalogInvitationsClient {
  private readonly logger = new Logger(CatalogInvitationsClient.name);
  private static readonly REQUEST_TIMEOUT_MS = 5000;
  private static readonly SERVICE_KEY_HEADER = 'X-Service-Key';

  constructor(private readonly config: ConfigService) {}

  /** POST {base}/api/v1/invitations — emite o reutiliza la invitación del lead. */
  async issueInvitation(payload: IssueInvitationPayload): Promise<CatalogInvitationResult> {
    return this.request<CatalogInvitationResult>('POST', '/api/v1/invitations', payload);
  }

  /** POST {base}/api/v1/invitations/{id}/resend — reenvía la misma invitación. */
  async resendInvitation(invitationId: string): Promise<CatalogInvitationResult> {
    return this.request<CatalogInvitationResult>(
      'POST',
      `/api/v1/invitations/${encodeURIComponent(invitationId)}/resend`,
    );
  }

  /** GET {base}/api/v1/invitations/{externalLeadId}?campaign={campaign}. */
  async getInvitationStatus(
    externalLeadId: string,
    campaign: string,
  ): Promise<CatalogInvitationStatus> {
    const path = `/api/v1/invitations/${encodeURIComponent(externalLeadId)}?campaign=${encodeURIComponent(campaign)}`;
    return this.request<CatalogInvitationStatus>('GET', path);
  }

  private resolveBaseUrl(): string {
    const baseUrl = (this.config.get<string>('SAMTS_CATALOG_API_URL') || '')
      .trim()
      .replace(/\/+$/, '');
    if (!baseUrl) {
      throw new ServiceUnavailableException(
        'La integración con SAMTS Catalog no está configurada (SAMTS_CATALOG_API_URL).',
      );
    }
    return baseUrl;
  }

  private resolveServiceKey(): string {
    const key = (this.config.get<string>('SAMTS_CATALOG_SERVICE_KEY') || '').trim();
    if (!key) {
      throw new ServiceUnavailableException(
        'La integración con SAMTS Catalog no está configurada (SAMTS_CATALOG_SERVICE_KEY).',
      );
    }
    return key;
  }

  private async request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
    const url = `${this.resolveBaseUrl()}${path}`;
    const serviceKey = this.resolveServiceKey();

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      CatalogInvitationsClient.REQUEST_TIMEOUT_MS,
    );

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          [CatalogInvitationsClient.SERVICE_KEY_HEADER]: serviceKey,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const rawText = await response.text();
      if (!response.ok) {
        this.logger.error(
          `[CATALOG S2S] ${method} ${path} respondió HTTP ${response.status}: ${rawText.slice(0, 300)}`,
        );
        throw new ServiceUnavailableException(
          `SAMTS Catalog rechazó la solicitud (HTTP ${response.status}).`,
        );
      }

      let parsed: unknown;
      try {
        parsed = rawText ? JSON.parse(rawText) : {};
      } catch {
        throw new ServiceUnavailableException('SAMTS Catalog devolvió una respuesta no válida.');
      }

      return this.unwrap<T>(parsed);
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;

      const isAbort = error instanceof Error && error.name === 'AbortError';
      this.logger.error(
        `[CATALOG S2S] ${method} ${path} falló: ${isAbort ? 'timeout' : (error as Error)?.message}`,
      );
      throw new ServiceUnavailableException(
        isAbort
          ? 'SAMTS Catalog no respondió a tiempo.'
          : 'No fue posible comunicarse con SAMTS Catalog.',
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Tolera tanto el payload directo como el envuelto por el interceptor del
   * Catalog (`{ data: <payload> }`, opcionalmente con `meta`).
   */
  private unwrap<T>(payload: unknown): T {
    if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
      return (payload as { data: T }).data;
    }
    return payload as T;
  }
}
