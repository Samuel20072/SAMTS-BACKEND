export interface BusinessContext {
  businessType: string;
  businessName: string;
  city: string;
  marketingGoal: string;
  tone: string;
  activePromotion?: string;
  featuredProducts?: string;
}

export interface BlogResult {
  title: string;
  excerpt: string;
  content: string;
  metaDescription: string;
  slug: string;
}

export interface PromotionResult {
  title: string;
  description: string;
  discountPercent: number;
  cta: string;
}

export interface WhatsappResult {
  promotionalMessage: string;
  informativeMessage: string;
  recoveryMessage: string;
}

export interface BannerResult {
  title: string;
  subtitle: string;
  cta: string;
}

/**
 * Contrato del motor de IA.
 * Implementaciones actuales: TemplateEngineService (MVP sin proveedores externos)
 * Implementaciones futuras: OpenAiEngineService, GeminiEngineService, ClaudeEngineService
 */
export abstract class IAiEngine {
  abstract generateBlog(ctx: BusinessContext): Promise<BlogResult>;
  abstract generatePromotion(ctx: BusinessContext): Promise<PromotionResult>;
  abstract generateWhatsapp(ctx: BusinessContext): Promise<WhatsappResult>;
  abstract generateBanner(ctx: BusinessContext): Promise<BannerResult>;
  abstract readonly engineName: string;
}
