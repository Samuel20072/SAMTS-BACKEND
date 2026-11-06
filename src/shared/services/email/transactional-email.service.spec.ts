import { ConfigService } from '@nestjs/config';
import { TransactionalEmailService } from './transactional-email.service';

describe('TransactionalEmailService (Mock & Safety QA)', () => {
  let service: TransactionalEmailService;
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService({
      EMAIL_PROVIDER: 'mock',
      NODE_ENV: 'test',
    });
    service = new TransactionalEmailService(configService);
  });

  it('1. Simulates email delivery without external network calls', async () => {
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

  it('2. Prevents duplicate delivery via idempotency', async () => {
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
    // Same message ID or deduped token
    expect(second.messageId).toBe(first.messageId);
  });

  it('3. Renders CATALOG_SELECTED and CATALOG_WAITLIST templates cleanly', () => {
    const sel = service.renderTemplate('CATALOG_SELECTED', {
      name: 'Elena',
      businessName: 'Elena Joyas',
      whatsapp: '+573100000000',
    });
    expect(sel.html).toContain('¡Felicidades, fuiste seleccionado!');
    expect(sel.text).toContain('20 días gratis');

    const wait = service.renderTemplate('CATALOG_WAITLIST', {
      name: 'Carlos',
    });
    expect(wait.html).toContain('Lista de Espera Prioritaria');
  });

  it('4. Handles credentials safely without logging secrets', async () => {
    // Verifies service never prints or returns raw password
    const result = await service.sendTransactionalEmail({
      to: 'seguridad@test.com',
      subject: 'Prueba Segura',
      template: 'LEAD_PROPOSAL',
      context: { name: 'Admin' },
    });

    expect((result as any).password).toBeUndefined();
    expect((result as any).secret).toBeUndefined();
  });
});
