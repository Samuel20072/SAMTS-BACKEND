import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterClientDto } from './dtos/register-client.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user and return JWT' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully authenticated.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new client business and its admin user' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Successfully registered client and admin.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email already exists.' })
  async register(@Body() registerClientDto: RegisterClientDto) {
    return this.authService.registerClient(registerClientDto);
  }
}
