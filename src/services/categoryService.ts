import { CategoriaRepository } from '../repositories/CategoriaRepository';
import { Categoria } from '../types/database';

const repository = new CategoriaRepository();

export const categoryService = {
  async list(): Promise<Categoria[]> {
    return await repository.list();
  },

  async create(nome: string): Promise<Categoria> {
    if (!nome.trim()) throw new Error('Nome da categoria é obrigatório');
    const id = await repository.create({ nome, status: true });
    return { id, nome, status: true };
  },

  async update(id: number, nome: string): Promise<void> {
    if (!nome.trim()) throw new Error('Nome da categoria é obrigatório');
    await repository.update(id, { nome });
  },

  async toggleStatus(id: number, currentStatus: boolean): Promise<void> {
    await repository.update(id, { status: !currentStatus });
  }
};
