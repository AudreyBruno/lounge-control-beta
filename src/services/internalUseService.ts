import { UsoInternoRepository } from '../repositories/UsoInternoRepository';
import { ProdutoRepository } from '../repositories/ProdutoRepository';

export interface UsoInternoPayloadItem {
  produto_id: number;
  quantidade: number;
  valor_unitario: number;
}

export interface UsoInternoPayload {
  produtos: UsoInternoPayloadItem[];
}

const usoInternoRepo = new UsoInternoRepository();
const produtoRepo = new ProdutoRepository();

export const internalUseService = {
  async registerInternalUse(payload: UsoInternoPayload): Promise<number> {
    if (payload.produtos.length === 0) {
      throw new Error('O uso interno deve conter pelo menos um produto');
    }

    // Calcula custo total (baseado no valor unitário na hora do uso)
    let valorTotal = 0;
    for (const p of payload.produtos) {
      valorTotal += (p.quantidade * p.valor_unitario);
    }

    // Cria o registro principal
    const usoId = await usoInternoRepo.createUsoInterno({
      valor_total: valorTotal
    });

    // Registra Itens e abate estoque se o produto movimentar estoque
    for (const item of payload.produtos) {
      const valorItemTotal = item.quantidade * item.valor_unitario;

      await usoInternoRepo.createUsoInternoItem({
        uso_interno_id: usoId,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
        valor_total: valorItemTotal
      });

      // Retira estoque
      await produtoRepo.updateEstoque(item.produto_id, -item.quantidade);
    }

    return usoId;
  }
};
