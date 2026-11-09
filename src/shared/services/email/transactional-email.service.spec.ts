import { ConfigService } from '@nestjs/config';
import { TransactionalEmailService } from './transactional-email.service';

describe('TransactionalEmailService (Resend & Mock QA)', () => {
  let service: TransactionalEmailService;
  let configService: ConfigService;

  describe('1. Mock Mode (EMAIL_PROVIDER=mock or test)', () => {
    beforeEach(() => {
      configService = new ConfigService({
        EMAIL_PROVIDER: 'mock',
        NODE_ENV: 'test',
      });
      service = new TransactionalEmailService(configService);
    });

    it('simulates email delivery without external network calls', async () => {
      const result = await service.sendTransactionalEmail({
        to: 'cliente@test.com',
        subject: '¡Bienvenido a SAMTS!',
        template: 'LEAD_PROPOSAL',
        context: { name: 'Juan Pérez', solutionInterest: 'Tienda Virtual' },
      });

      expect(result.success).toBe(true);
      expect(result.provider).toBe('simulated_mock');
      expect(result.messageId).toContain('sim_');
      expect(result.attempts).toBe(1);
    });

    it('prevents duplicate delivery via idempotency', async () => {
      const opts = {
        to: 'duplicado@test.com',
        subject: 'Confirmación',
        template: 'CATALOG_SELECTED' as const,
        context: { name: 'Sofía', businessName: 'Boutique' },
        idempotencyKey: 'catalog_sel_123',
      };

      const first = await service.sendTransactionalEmail(opts);
      const second = await service.sendTransactionalEmail(opts);

      expect(first.success).toBe(true);
      expect(second.success).toBe(true);
      expect(second.messageId).toBe(first.messageId);
    });
  });

  describe('2. Resend Provider Configuration Guard', () => {
    it('fails fast with attempts=1 if EMAIL_PROVIDER=resend but RESEND_API_KEY is missing', async () => {
      const conf = new ConfigService({
        EMAIL_PROVIDER: 'resend',
        RESEND_API_KEY: '',
        NODE_ENV: 'production',
      });
      const s = new TransactionalEmailService(conf);

      const result = await s.sendTransactionalEmail({
        to: 'alerta@test.com',
        subject: 'Prueba Resend',
        template: 'LEAD_PROPOSAL',
        context: { name: 'Admin' },
      });

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(1); // No retries on configuration error
      expect(result.error).toContain('RESEND_API_KEY no configurada');
      expect(result.provider).toBe('resend');
    });
  });

  describe('3. Resend Provider with Mocked Client', () => {
    let mockResend: any;

    beforeEach(() => {
      mockResend = {
        emails: {
          send: jest.fn(),
        },
      };
      configService = new ConfigService({
        EMAIL_PROVIDER: 'resend',
        RESEND_API_KEY: 're_test_dummy_key_12345',
        EMAIL_FROM: 'SAMTS <contacto@samts.app>',
        NODE_ENV: 'production',
      });
      service = new TransactionalEmailService(configService, mockResend);
    });

    it('successfully sends email via Resend and registers messageId', async () => {
      mockResend.emails.send.mockResolvedValueOnce({
        data: { id: 'msg_resend_99999' },
        error: null,
      });

      const result = await service.sendTransactionalEmail({
        to: 'lead@empresa.com',
        subject: 'Cupo SAMTS Catalog',
        template: 'CATALOG_SELECTED',
        context: { name: 'Marcos', businessName: 'TechStore', whatsapp: '3101234567' },
        idempotencyKey: 'unique_catalog_key_1',
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('msg_resend_99999');
      expect(result.provider).toBe('resend');
      expect(mockResend.emails.send).toHaveBeenCalledTimes(1);
      expect(mockResend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'SAMTS <contacto@samts.app>',
          to: ['lead@empresa.com'],
          subject: 'Cupo SAMTS Catalog',
        }),
        { idempotencyKey: 'unique_catalog_key_1' },
      );
    });

    it('classifies permanent error (validation_error) and does not waste retries', async () => {
      mockResend.emails.send.mockResolvedValueOnce({
        data: null,
        error: {
          name: 'validation_error',
          message: 'The email address is invalid',
        },
      });

      const result = await service.sendTransactionalEmail({
        to: 'invalido@',
        subject: 'Fallo permanente',
        template: 'LEAD_PROPOSAL',
        context: { name: 'Test' },
      });

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(1); // Permanent error must exit on first attempt
      expect(result.error).toContain('validation_error');
      expect(mockResend.emails.send).toHaveBeenCalledTimes(1);
    });

    it('retries temporary errors up to maxAttempts', async () => {
      mockResend.emails.send
        .mockResolvedValueOnce({
          data: null,
          error: { name: 'rate_limit_exceeded', message: 'Too many requests' },
        })
        .mockResolvedValueOnce({
          data: { id: 'msg_resend_recovered' },
          error: null,
        });

      const result = await service.sendTransactionalEmail({
        to: 'recuperado@empresa.com',
        subject: 'Recuperado',
        template: 'CATALOG_WAITLIST',
        context: { name: 'Andrea' },
      });

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(2);
      expect(result.messageId).toBe('msg_resend_recovered');
      expect(mockResend.emails.send).toHaveBeenCalledTimes(2);
    });
  });

  describe('4. Templates and Security Verification', () => {
    beforeEach(() => {
      configService = new ConfigService({ EMAIL_PROVIDER: 'mock', NODE_ENV: 'test' });
      service = new TransactionalEmailService(configService);
    });

    it('renders all four templates cleanly (SELECTED, WAITLIST, GUIDE, PROPOSAL)', () => {
      const sel = service.renderTemplate('CATALOG_SELECTED', {
        name: 'Elena',
        businessName: 'Elena Joyas',
        whatsapp: '+573100000000',
      });
      expect(sel.html).toContain('¡Felicidades, fuiste seleccionado!');
      expect(sel.text).toContain('20 días gratis');

      const wait = service.renderTemplate('CATALOG_WAITLIST', { name: 'Carlos' });
      expect(wait.html).toContain('Lista de Espera Prioritaria');

      const guide = service.renderTemplate('LEAD_MAGNET_GUIDE', { name: 'Mariana' });
      expect(guide.html).toContain('Tu Guía de Crecimiento Digital');

      const prop = service.renderTemplate('LEAD_PROPOSAL', { name: 'David' });
      expect(prop.html).toContain('Hemos recibido tu propuesta');
    });

    it('handles credentials safely without exposing secrets in results or errors', async () => {
      const result = await service.sendTransactionalEmail({
        to: 'seguridad@test.com',
        subject: 'Prueba Segura',
        template: 'LEAD_PROPOSAL',
        context: { name: 'Admin' },
      });

      expect((result as any).password).toBeUndefined();
      expect((result as any).secret).toBeUndefined();
      expect((result as any).apiKey).toBeUndefined();
    });
  });
});
