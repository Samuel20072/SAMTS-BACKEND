import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SendEmailOptions {
  to: string;
  subject: string;
  template: 'LEAD_PROPOSAL' | 'CATALOG_SELECTED' | 'CATALOG_WAITLIST' | 'LEAD_MAGNET_GUIDE';
  context: Record<string, any>;
  idempotencyKey?: string;
}

export interface EmailDeliveryResult {
  success: boolean;
  messageId?: string;
  attempts: number;
  provider: string;
  error?: string;
  timestamp: Date;
}

@Injectable()
export class TransactionalEmailService {
  private readonly logger = new Logger(TransactionalEmailService.name);
  private readonly sentIdempotencyKeys = new Set<string>();
  private readonly deliveryHistory: Map<string, EmailDeliveryResult> = new Map();

  constructor(private readonly config: ConfigService) {}

  /**
   * Safe email sender.
   * If EMAIL_PROVIDER is 'mock' or unset in dev/test, simulates delivery without hitting external servers.
   */
  async sendTransactionalEmail(options: SendEmailOptions): Promise<EmailDeliveryResult> {
    const provider = this.config.get<string>('EMAIL_PROVIDER', 'mock').toLowerCase();
    const idempotencyKey = options.idempotencyKey || `${options.to}:${options.template}`;

    // 1. Prevent duplicate delivery
    if (this.sentIdempotencyKeys.has(idempotencyKey)) {
      this.logger.warn(`[EMAIL IDEMPOTENCY] Correo duplicado omitido para clave: ${idempotencyKey}`);
      return (
        this.deliveryHistory.get(idempotencyKey) || {
          success: true,
          messageId: 'mock_deduped_' + idempotencyKey,
          attempts: 1,
          provider,
          timestamp: new Date(),
        }
      );
    }

    // 2. Render Template
    const { html, text } = this.renderTemplate(options.template, options.context);

    // 3. Execution with attempt logging and error management
    let attempts = 0;
    const maxAttempts = 3;
    let lastError: Error | undefined;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        if (provider === 'mock' || process.env.NODE_ENV !== 'production') {
          // Simulated transactional provider
          const result: EmailDeliveryResult = {
            success: true,
            messageId: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            attempts,
            provider: 'simulated_mock',
            timestamp: new Date(),
          };

          this.sentIdempotencyKeys.add(idempotencyKey);
          this.deliveryHistory.set(idempotencyKey, result);

          this.logger.log(
            `[EMAIL SIMULADO] Destino: ${options.to} | Plantilla: ${options.template} | Intentos: ${attempts}`,
          );

          return result;
        }

        // Live Provider (Resend / SMTP) placeholder when authorized
        throw new Error('Proveedor en vivo no configurado. Configure SMTP_* o RESEND_API_KEY.');
      } catch (err: any) {
        lastError = err;
        this.logger.warn(
          `[EMAIL INTENTO FALLIDO] Intento ${attempts}/${maxAttempts} para ${options.to}: ${err.message}`,
        );
      }
    }

    const failedResult: EmailDeliveryResult = {
      success: false,
      attempts,
      provider,
      error: lastError?.message || 'Fallo desconocido en envío de correo',
      timestamp: new Date(),
    };

    return failedResult;
  }

  /**
   * Renders responsive, branded templates for SAMTS
   */
  renderTemplate(
    template: SendEmailOptions['template'],
    context: Record<string, any>,
  ): { html: string; text: string } {
    const brandColor = '#315EFB';
    const darkColor = '#111318';

    switch (template) {
      case 'CATALOG_SELECTED':
        return {
          text: `Hola ${context.name},\n\n¡Felicidades! Tu negocio "${context.businessName || 'tu empresa'}" ha sido seleccionado para uno de los 5 cupos con 20 días gratis de SAMTS Catalog.\n\nPronto te contactaremos a tu WhatsApp (${context.whatsapp}) para activar tu catálogo personalizado.\n\nEquipo SAMTS\nhttps://samts.app`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E8E9ED; border-radius: 12px; background: #ffffff;">
              <h1 style="color: ${darkColor}; font-size: 24px; margin-bottom: 12px;">¡Felicidades, fuiste seleccionado!</h1>
              <p style="color: #444955; line-height: 1.6;">Hola <strong>${context.name}</strong>,</p>
              <p style="color: #444955; line-height: 1.6;">Tu negocio <strong>"${context.businessName || 'tu empresa'}"</strong> obtuvo uno de los <strong>5 cupos exclusivos</strong> para disfrutar de <strong>20 días gratis</strong> de SAMTS Catalog.</p>
              <div style="background: #F4F7FF; border-left: 4px solid ${brandColor}; padding: 16px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; color: #111318; font-weight: 600;">Estado: CUPÓ SELECCIONADO (1 de 5)</p>
                <p style="margin: 4px 0 0 0; color: #666B75; font-size: 13px;">Canal de activación: WhatsApp (${context.whatsapp})</p>
              </div>
              <p style="color: #666B75; font-size: 12px; margin-top: 32px; border-top: 1px solid #E8E9ED; padding-top: 16px;">
                © 2026 SAMTS — Software e Inteligencia Artificial
              </p>
            </div>
          `,
        };

      case 'CATALOG_WAITLIST':
        return {
          text: `Hola ${context.name},\n\nGracias por postularte a SAMTS Catalog. Los primeros 5 cupos ya fueron asignados, pero has quedado en el puesto de lista de espera prioritaria.\n\nSi se libera un cupo o abrimos una nueva ronda, te notificaremos de inmediato.\n\nEquipo SAMTS`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E8E9ED; border-radius: 12px; background: #ffffff;">
              <h2 style="color: ${darkColor};">Estás en Lista de Espera Prioritaria</h2>
              <p style="color: #444955;">Hola <strong>${context.name}</strong>,</p>
              <p style="color: #444955;">Los primeros 5 cupos gratuitos han sido completados, pero tu solicitud quedó registrada con prioridad en nuestra lista de espera.</p>
            </div>
          `,
        };

      case 'LEAD_PROPOSAL':
      default:
        return {
          text: `Hola ${context.name},\n\nHemos recibido tu solicitud para ${context.solutionInterest || 'tu proyecto de software'}. Nuestro equipo técnico está evaluando los requerimientos y te contactará en menos de 24 horas.\n\nEquipo SAMTS`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E8E9ED; border-radius: 12px; background: #ffffff;">
              <h2 style="color: ${darkColor};">Hemos recibido tu propuesta</h2>
              <p style="color: #444955;">Hola <strong>${context.name}</strong>,</p>
              <p style="color: #444955;">Recibimos tu solicitud para <strong>${context.solutionInterest || 'tu proyecto de software'}</strong>. Te contactaremos pronto.</p>
            </div>
          `,
        };
    }
  }

  getDeliveryHistory(idempotencyKey: string): EmailDeliveryResult | undefined {
    return this.deliveryHistory.get(idempotencyKey);
  }
}
