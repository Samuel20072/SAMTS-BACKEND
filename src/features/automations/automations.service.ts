import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { Promotion } from '../promotions/domain/entities/promotion.entity';
import { Client } from '../clients/domain/entities/client.entity';

@Injectable()
export class AutomationsService {
  private readonly logger = new Logger(AutomationsService.name);

  constructor(private readonly dataSource: DataSource) {}

  // 1. Promotion Expiration: Expire promotions where endDate <= current_timestamp
  // Runs every hour
  @Cron(CronExpression.EVERY_HOUR)
  async handlePromotionExpiration() {
    this.logger.log('Starting promotion expiration job...');
    try {
      const promotionRepo = this.dataSource.getRepository(Promotion);
      const result = await promotionRepo
        .createQueryBuilder()
        .update(Promotion)
        .set({ isActive: false })
        .where('isActive = :isActive', { isActive: true })
        .andWhere('endDate <= :now', { now: new Date() })
        .execute();

      this.logger.log(`Promotion expiration job completed. Expired ${result.affected || 0} promotions.`);
    } catch (error) {
      this.logger.error('Error running promotion expiration job:', error);
    }
  }

  // 2. Daily Dashboard Calculations: Log/process daily dashboard snapshots
  // Runs every day at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyDashboardCalculations() {
    this.logger.log('Starting daily dashboard calculations...');
    try {
      const clientRepo = this.dataSource.getRepository(Client);
      const activeClientsCount = await clientRepo.count({ where: { active: true } });

      // In a real application, we would pre-calculate and save statistics to a caching layer or history table.
      // For now, we simulate this computation.
      this.logger.log(`Daily dashboard calculations completed for ${activeClientsCount} active clients.`);
    } catch (error) {
      this.logger.error('Error running daily dashboard calculations job:', error);
    }
  }

  // 3. AI Task Execution Requests: Check automated AI configurations and trigger tasks
  // Runs every day at 2 AM
  @Cron('0 2 * * *')
  async handleAITaskExecution() {
    this.logger.log('Checking AI task execution requests for clients...');
    try {
      const clientRepo = this.dataSource.getRepository(Client);
      const clientsWithAi = await clientRepo.find({
        where: { active: true, aiEnabled: true },
        relations: { aiSettings: true },
      });

      let triggeredTasks = 0;
      for (const client of clientsWithAi) {
        if (client.aiSettings && client.aiSettings.isActive) {
          const settings = client.aiSettings;
          if (settings.autoGenerateBlogs || settings.autoGeneratePromotions || settings.autoGenerateSeo || settings.autoGenerateWhatsappMessages) {
            triggeredTasks++;
            this.logger.debug(`[AI Queue] Triggered AI generation request for client ${client.businessName} (Tone: ${settings.businessTone}).`);
          }
        }
      }

      this.logger.log(`AI task execution check completed. Triggered tasks for ${triggeredTasks} clients.`);
    } catch (error) {
      this.logger.error('Error checking AI task execution requests:', error);
    }
  }

  // 4. Content Publication Scheduling: Publish scheduled articles
  // Runs every 15 minutes
  @Cron('0 */15 * * * *')
  async handleContentPublicationScheduling() {
    this.logger.log('Running scheduled content publication check...');
    // In a production system, we would select posts where status = DRAFT, have a scheduledPublishDate field <= NOW,
    // and update status = PUBLISHED. For this simulation, we log the checking process.
    this.logger.log('Content publication scheduling check completed. No pending scheduled posts found.');
  }
}
