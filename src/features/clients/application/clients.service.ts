import { Injectable, NotFoundException } from '@nestjs/common';
import { IClientRepository } from '../domain/repositories/client.repository.interface';
import { CreateClientDto } from './dtos/create-client.dto';
import { UpdateClientDto } from './dtos/update-client.dto';
import { ClientResponseDto } from './dtos/client-response.dto';
import { Client } from '../domain/entities/client.entity';

@Injectable()
export class ClientsService {
  constructor(private readonly clientRepository: IClientRepository) {}

  async create(createClientDto: CreateClientDto): Promise<ClientResponseDto> {
    const client = new Client();
    Object.assign(client, createClientDto);
    const saved = await this.clientRepository.save(client);
    return ClientResponseDto.fromEntity(saved);
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<ClientResponseDto> {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    Object.assign(client, updateClientDto);
    const saved = await this.clientRepository.save(client);
    return ClientResponseDto.fromEntity(saved);
  }

  async toggleAi(id: string, enabled: boolean): Promise<ClientResponseDto> {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    client.aiEnabled = enabled;
    const saved = await this.clientRepository.save(client);
    return ClientResponseDto.fromEntity(saved);
  }

  async changePlan(id: string, plan: string): Promise<ClientResponseDto> {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    client.plan = plan;
    const saved = await this.clientRepository.save(client);
    return ClientResponseDto.fromEntity(saved);
  }

  async toggleActive(id: string, active: boolean): Promise<ClientResponseDto> {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    client.active = active;
    const saved = await this.clientRepository.save(client);
    return ClientResponseDto.fromEntity(saved);
  }

  async findById(id: string): Promise<ClientResponseDto> {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return ClientResponseDto.fromEntity(client);
  }

  async findAll(): Promise<ClientResponseDto[]> {
    const clients = await this.clientRepository.findAll();
    return clients.map((client) => ClientResponseDto.fromEntity(client));
  }
}
