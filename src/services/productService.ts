import { ProdutoRepository } from '../repositories/ProdutoRepository';
import { CategoriaRepository } from '../repositories/CategoriaRepository';
import { Produto } from '../types/database';

export interface ProdutoWithDetails extends Produto {
  categoria_nome?: string;
}

const prodRepo = new ProdutoRepository();
const catRepo = new CategoriaRepository();

export const productService = {
  async listFull(): Promise<ProdutoWithDetails[]> {
    const products = await prodRepo.list();
    const categories = await catRepo.list();
    
    // Create a map for fast lookup
    const catMap = new Map<number, string>();
    for (const cat of categories) {
      catMap.set(cat.id, cat.nome);
    }
    
    return products.map(p => ({
      ...p,
      categoria_nome: catMap.get(p.categoria_id) || 'Desconhecida'
    }));
  },

  async create(produto: Omit<Produto, 'id'>): Promise<number> {
    if (!produto.descricao.trim()) throw new Error('Descrição é obrigatória');
    if (produto.valor <= 0) throw new Error('Valor deve ser maior que zero');
    if (produto.categoria_id <= 0) throw new Error('Selecione uma categoria');
    
    return await prodRepo.create(produto);
  },

  async update(id: number, produto: Partial<Produto>): Promise<void> {
    if (produto.descricao !== undefined && !produto.descricao.trim()) {
      throw new Error('Descrição é obrigatória');
    }
    if (produto.valor !== undefined && produto.valor <= 0) {
      throw new Error('Valor deve ser maior que zero');
    }
    if (produto.categoria_id !== undefined && produto.categoria_id <= 0) {
      throw new Error('Selecione uma categoria');
    }

    await prodRepo.update(id, produto);
  },

  async delete(id: number): Promise<void> {
    await prodRepo.delete(id);
  }
};
