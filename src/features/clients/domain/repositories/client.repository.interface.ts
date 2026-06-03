import { Client } from '../entities/client.entity';

export abstract class IClientRepository {
  abstract save(client: Client): Promise<Client>;
  abstract findById(id: string): Promise<Client | null>;
  abstract findAll(): Promise<Client[]>;
  abstract delete(id: string): Promise<void>;
}
