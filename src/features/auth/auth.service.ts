import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { RegisterClientDto } from './dtos/register-client.dto';
import { User } from '../users/domain/entities/user.entity';
import { Client } from '../clients/domain/entities/client.entity';
import { AISettings } from '../ai-settings/domain/entities/ai-settings.entity';
import { UserRole } from '../../shared/enums/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const userRepository = this.dataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { email: loginDto.email, isActive: true },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        clientId: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      clientId: user.clientId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async registerClient(registerClientDto: RegisterClientDto): Promise<{ accessToken: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userRepo = queryRunner.manager.getRepository(User);
      const clientRepo = queryRunner.manager.getRepository(Client);
      const aiSettingsRepo = queryRunner.manager.getRepository(AISettings);

      // Check if user email already exists
      const existingUser = await userRepo.findOne({
        where: { email: registerClientDto.adminEmail },
      });
      if (existingUser) {
        throw new ConflictException(`User with email ${registerClientDto.adminEmail} already exists`);
      }

      // 1. Create client business
      const client = new Client();
      client.businessName = registerClientDto.businessName;
      client.businessType = registerClientDto.businessType;
      client.email = registerClientDto.businessEmail;
      client.whatsappNumber = registerClientDto.whatsappNumber;
      client.aiEnabled = false;
      client.plan = 'FREE';
      client.active = true;

      const savedClient = await clientRepo.save(client);

      // 2. Create AI Settings for client
      const aiSettings = new AISettings();
      aiSettings.clientId = savedClient.id;
      aiSettings.businessTone = 'Professional';
      aiSettings.targetAudience = 'General Public';
      aiSettings.businessObjective = 'Growth';
      aiSettings.postingFrequency = 'WEEKLY';
      aiSettings.isActive = true;

      await aiSettingsRepo.save(aiSettings);

      // 3. Create CLIENT_ADMIN user
      const hashedPassword = await bcrypt.hash(registerClientDto.adminPassword, 10);
      const user = new User();
      user.name = registerClientDto.adminName;
      user.email = registerClientDto.adminEmail;
      user.password = hashedPassword;
      user.role = UserRole.CLIENT_ADMIN;
      user.isActive = true;
      user.clientId = savedClient.id;

      const savedUser = await userRepo.save(user);

      await queryRunner.commitTransaction();

      // Sign token for the registered user
      const payload = {
        sub: savedUser.id,
        email: savedUser.email,
        role: savedUser.role,
        clientId: savedUser.clientId,
      };

      return {
        accessToken: this.jwtService.sign(payload),
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
