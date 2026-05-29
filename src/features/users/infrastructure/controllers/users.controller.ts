import { Controller, Get, Post, Body, Param, ParseUUIDPipe, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { FindUserByIdUseCase } from '../../application/use-cases/find-user-by-id.use-case';
import { FindAllUsersUseCase } from '../../application/use-cases/find-all-users.use-case';
import { CreateUserDto } from '../../application/dtos/create-user.dto';
import { UserResponseDto } from '../../application/dtos/user-response.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly findAllUsersUseCase: FindAllUsersUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The user has been successfully created.',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User email already exists.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed.',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.createUserUseCase.execute(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all registered users.',
    type: [UserResponseDto],
  })
  async findAll(): Promise<UserResponseDto[]> {
    return this.findAllUsersUseCase.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User UUID', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return user details by ID.',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found.',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    return this.findUserByIdUseCase.execute(id);
  }
}
