import { VendaRepository } from '../repositories/VendaRepository';
import { ProdutoRepository } from '../repositories/ProdutoRepository';
import { FinanceRepository } from '../repositories/FinanceRepository';
import { ClienteRepository } from '../repositories/ClienteRepository';

export interface VendaPayloadItem {
  produto_id: number;
  quantidade: number;
  valor_unitario: number;
}

export interface VendaPayload {
  cliente_id: number;
  produtos: VendaPayloadItem[];
  valor_pago: number;
}

const vendaRepo = new VendaRepository();
const produtoRepo = new ProdutoRepository();
const financeRepo = new FinanceRepository();
const clientRepo = new ClienteRepository();

export const saleService = {
  async registerSale(payload: VendaPayload): Promise<number> {
    if (payload.produtos.length === 0) {
      throw new Error('A venda deve conter pelo menos um produto');
    }

    const cliente = await clientRepo.findById(payload.cliente_id);
    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }

    // Calcula total
    let valorTotal = 0;
    for (const p of payload.produtos) {
      valorTotal += (p.quantidade * p.valor_unitario);
    }

    // Verifica regras de fiado
    const pago = payload.valor_pago >= valorTotal;
    if (!pago && !cliente.permite_venda_prazo) {
      throw new Error('Este cliente não possui permissão para compra a prazo / fiado.');
    }

    // Cria a Venda
    const vendaId = await vendaRepo.createVenda({
      cliente_id: payload.cliente_id,
      valor_total: valorTotal,
      valor_pago: payload.valor_pago,
      pago,
    });

    // Registra Itens e abate estoque se necessário
    for (const item of payload.produtos) {
      const valorItemTotal = item.quantidade * item.valor_unitario;
      
      await vendaRepo.createVendaItem({
        venda_id: vendaId,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
        valor_total: valorItemTotal
      });

      // Retira estoque
      await produtoRepo.updateEstoque(item.produto_id, -item.quantidade);
    }

    // Gera o Contas a Receber referenciando a venda
    // Data de vencimento default pode ser D+30 se não for pago
    const dataAtual = new Date();
    const vencimento = new Date();
    vencimento.setDate(vencimento.getDate() + 30); // 30 dias de prazo se fiado

    await financeRepo.createContaReceber({
      venda_id: vendaId,
      data_cadastro: dataAtual.toISOString(),
      data_vencimento: vencimento.toISOString(),
      valor: valorTotal,
      descricao: `Referente à Venda #${vendaId} - Cliente ${cliente.nome}`,
      pago,
    });

    return vendaId;
  }
};
