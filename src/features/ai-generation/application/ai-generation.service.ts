import { Injectable, NotFoundException } from '@nestjs/common';
import { IAiEngine, BusinessContext } from '../domain/interfaces/ai-engine.interface';
import { IAiGenerationRepository } from '../domain/repositories/ai-generation.repository.interface';
import { IClientRepository } from '../../clients/domain/repositories/client.repository.interface';
import { IProductRepository } from '../../products/domain/repositories/product.repository.interface';
import { IPromotionRepository } from '../../promotions/domain/repositories/promotion.repository.interface';
import { IBlogPostRepository } from '../../blog-posts/domain/repositories/blog-post.repository.interface';
import { AiGeneration, AiContentType } from '../domain/entities/ai-generation.entity';
import { GenerateContentDto } from './dtos/generate-content.dto';
import {
  BlogResultDto,
  PromotionResultDto,
  WhatsappResultDto,
  BannerResultDto,
} from './dtos/generation-result.dto';
import { BlogPost } from '../../blog-posts/domain/entities/blog-post.entity';
import { Promotion } from '../../promotions/domain/entities/promotion.entity';
import { BlogStatus } from '../../../shared/enums/blog-status.enum';

@Injectable()
export class AiGenerationService {
  constructor(
    private readonly aiEngine: IAiEngine,
    private readonly aiGenerationRepository: IAiGenerationRepository,
    private readonly clientRepository: IClientRepository,
    private readonly productRepository: IProductRepository,
    private readonly promotionRepository: IPromotionRepository,
    private readonly blogPostRepository: IBlogPostRepository,
  ) {}

  async generateBlog(clientId: string | null, dto: GenerateContentDto): Promise<BlogResultDto> {
    // 1. Generate content using engine
    const blogResult = await this.aiEngine.generateBlog(dto);

    // 2. Save generation history log
    const aiGen = new AiGeneration();
    aiGen.clientId = clientId;
    aiGen.contentType = AiContentType.BLOG;
    aiGen.prompt = JSON.stringify(dto);
    aiGen.result = blogResult as unknown as Record<string, unknown>;
    aiGen.generatedBy = this.aiEngine.engineName;

    await this.aiGenerationRepository.save(aiGen);

    return blogResult;
  }

  async generatePromotion(clientId: string | null, dto: GenerateContentDto): Promise<PromotionResultDto> {
    const promoResult = await this.aiEngine.generatePromotion(dto);

    const aiGen = new AiGeneration();
    aiGen.clientId = clientId;
    aiGen.contentType = AiContentType.PROMOTION;
    aiGen.prompt = JSON.stringify(dto);
    aiGen.result = promoResult as unknown as Record<string, unknown>;
    aiGen.generatedBy = this.aiEngine.engineName;

    await this.aiGenerationRepository.save(aiGen);

    return promoResult;
  }

  async generateWhatsapp(clientId: string | null, dto: GenerateContentDto): Promise<WhatsappResultDto> {
    const whatsappResult = await this.aiEngine.generateWhatsapp(dto);

    const aiGen = new AiGeneration();
    aiGen.clientId = clientId;
    aiGen.contentType = AiContentType.WHATSAPP;
    aiGen.prompt = JSON.stringify(dto);
    aiGen.result = whatsappResult as unknown as Record<string, unknown>;
    aiGen.generatedBy = this.aiEngine.engineName;

    await this.aiGenerationRepository.save(aiGen);

    return whatsappResult;
  }

  async generateBanner(clientId: string | null, dto: GenerateContentDto): Promise<BannerResultDto> {
    const bannerResult = await this.aiEngine.generateBanner(dto);

    const aiGen = new AiGeneration();
    aiGen.clientId = clientId;
    aiGen.contentType = AiContentType.BANNER;
    aiGen.prompt = JSON.stringify(dto);
    aiGen.result = bannerResult as unknown as Record<string, unknown>;
    aiGen.generatedBy = this.aiEngine.engineName;

    await this.aiGenerationRepository.save(aiGen);

    return bannerResult;
  }

  async getHistory(
    clientId: string | null,
    options: { page?: number; limit?: number },
  ): Promise<{ data: AiGeneration[]; total: number }> {
    const skip = (options.page || 0) * (options.limit || 10);
    const take = options.limit || 10;
    const [data, total] = await this.aiGenerationRepository.findAndCount(clientId, { skip, take });
    return { data, total };
  }

  /**
   * Orchestrates the automatic execution of AI tasks for a client.
   * Invoked by Automations cron job.
   */
  async generateForClient(clientId: string): Promise<void> {
    const client = await this.clientRepository.findById(clientId);
    if (!client || !client.aiEnabled || !client.aiSettings || !client.aiSettings.isActive) {
      return;
    }

    const settings = client.aiSettings;

    // Load extra context from client products and promotions
    const [products] = await this.productRepository.findAndCount(clientId, {
      featured: true,
      activeOnly: true,
      take: 5,
    });
    const [promotions] = await this.promotionRepository.findAndCount(clientId, {
      activeOnly: true,
      take: 3,
    });

    const featuredProducts = products.map((p) => p.name).join(', ') || undefined;
    const activePromotion = promotions.map((p) => `${p.title}: ${p.description}`).join(' | ') || undefined;

    const ctx: BusinessContext = {
      businessName: client.businessName,
      businessType: client.businessType,
      city: 'Tu Ciudad', // Default fallback
      tone: settings.businessTone || 'Profesional',
      marketingGoal: settings.businessObjective || 'Fidelizar clientes',
      featuredProducts,
      activePromotion,
    };

    if (settings.autoGenerateBlogs) {
      const blog = await this.generateBlog(clientId, ctx);

      // Create a draft Blog Post
      const blogPost = new BlogPost();
      blogPost.clientId = clientId;
      blogPost.title = blog.title;
      blogPost.content = blog.content;
      blogPost.slug = blog.slug;
      blogPost.status = BlogStatus.DRAFT;

      await this.blogPostRepository.save(blogPost);
    }

    if (settings.autoGeneratePromotions) {
      const promo = await this.generatePromotion(clientId, ctx);

      // Create a real active promotion
      const promotion = new Promotion();
      promotion.clientId = clientId;
      promotion.title = promo.title;
      promotion.description = promo.description;
      promotion.isActive = true;
      promotion.startDate = new Date();

      // End date in 7 days
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      promotion.endDate = endDate;

      await this.promotionRepository.save(promotion);
    }

    if (settings.autoGenerateWhatsappMessages) {
      await this.generateWhatsapp(clientId, ctx);
    }
  }
}
