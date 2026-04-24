import { ClienteRepository } from '../repositories/ClienteRepository';
import { Cliente } from '../types/database';

const repository = new ClienteRepository();

export const clientService = {
  async list(): Promise<Cliente[]> {
    return await repository.list();
  },

  async create(cliente: Omit<Cliente, 'id'>): Promise<Cliente> {
    if (!cliente.nome.trim()) throw new Error('Nome do cliente é obrigatório');
    
    const id = await repository.create(cliente);
    return { ...cliente, id };
  },

  async update(id: number, cliente: Partial<Cliente>): Promise<void> {
    if (cliente.nome !== undefined && !cliente.nome.trim()) {
      throw new Error('Nome do cliente é obrigatório');
    }
    await repository.update(id, cliente);
  },

  async toggleStatus(id: number, currentStatus: boolean): Promise<void> {
    await repository.update(id, { status: !currentStatus });
  }
};
