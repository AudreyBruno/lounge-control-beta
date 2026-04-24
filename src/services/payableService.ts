import { FinanceRepository } from '../repositories/FinanceRepository';
import { ContasPagar } from '../types/database';

const repository = new FinanceRepository();

export const payableService = {
  async list(): Promise<ContasPagar[]> {
    return await repository.listContasPagar();
  },

  async create(conta: Omit<ContasPagar, 'id'>): Promise<number> {
    if (!conta.descricao.trim()) throw new Error('A descrição é obrigatória');
    if (conta.valor <= 0) throw new Error('O valor deve ser maior que zero');
    if (!conta.data_vencimento) throw new Error('A data de vencimento é obrigatória');

    return await repository.createContaPagar(conta);
  },

  async update(id: number, conta: Partial<ContasPagar>): Promise<void> {
    if (conta.descricao !== undefined && !conta.descricao.trim()) {
      throw new Error('A descrição não pode ser vazia');
    }
    if (conta.valor !== undefined && conta.valor <= 0) {
      throw new Error('O valor deve ser maior que zero');
    }
    await repository.updateContaPagar(id, conta);
  },

  async delete(id: number): Promise<void> {
    await repository.deleteContaPagar(id);
  }
};
