import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { resolveJwtSecret, resolveJwtExpiresIn } from '../../shared/config/jwt.config';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        // Falla al iniciar si JWT_SECRET no está definido o es inseguro.
        secret: resolveJwtSecret(),
        signOptions: { expiresIn: resolveJwtExpiresIn() },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesGuard],
  exports: [AuthService, JwtStrategy, RolesGuard, PassportModule, JwtModule],
})
export class AuthModule {}
