import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../shared/entities/BaseEntity';
import { Client } from '../../../clients/domain/entities/client.entity';

export enum AiContentType {
  BLOG = 'BLOG',
  PROMOTION = 'PROMOTION',
  WHATSAPP = 'WHATSAPP',
  BANNER = 'BANNER',
}

@Entity('ai_generations')
export class AiGeneration extends BaseEntity {
  @Column({ type: 'uuid', nullable: true })
  clientId: string | null;

  @ManyToOne(() => Client, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'clientId' })
  client: Client | null;

  @Column({
    type: 'varchar',
    enum: AiContentType,
  })
  contentType: AiContentType;

  /**
   * Contexto del negocio serializado (JSON) que se usó como "prompt".
   * Permite auditar y reproducir generaciones.
   */
  @Column({ type: 'text' })
  prompt: string;

  /**
   * Resultado generado (JSON serializado).
   * Estructura varía según contentType: BlogResult | PromotionResult | WhatsappResult | BannerResult
   */
  @Column({ type: 'jsonb' })
  result: Record<string, unknown>;

  /**
   * Nombre del motor que generó el contenido.
   * Valores: 'template-engine' | 'openai' | 'gemini' | 'claude'
   */
  @Column({ default: 'template-engine' })
  generatedBy: string;
}
