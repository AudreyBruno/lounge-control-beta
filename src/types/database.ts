export interface User {
  id: number;
  name: string;
  username: string;
  password?: string;
  is_admin: boolean;
}

export interface Cliente {
  id: number;
  nome: string;
  numero: string | null;
  status: boolean;
  permite_venda_prazo: boolean;
}

export interface Categoria {
  id: number;
  nome: string;
  status: boolean;
}

export interface Produto {
  id: number;
  categoria_id: number;
  descricao: string;
  estoque: number;
  valor: number;
  movimenta_estoque: boolean;
}

export interface Venda {
  id: number;
  cliente_id: number;
  valor_total: number;
  valor_pago: number;
  pago: boolean;
  data: string; // ISO DateTime
}

export interface VendaItem {
  id: number;
  venda_id: number;
  produto_id: number;
  valor_unitario: number;
  valor_total: number;
  quantidade: number;
}

export interface UsoInterno {
  id: number;
  valor_total: number;
  data: string;
}

export interface UsoInternoItem {
  id: number;
  uso_interno_id: number;
  produto_id: number;
  valor_unitario: number;
  valor_total: number;
  quantidade: number;
}

export interface ContasPagar {
  id: number;
  data_cadastro: string;
  data_vencimento: string;
  valor: number;
  descricao: string;
}

export interface ContasReceber {
  id: number;
  venda_id: number;
  data_cadastro: string;
  data_vencimento: string;
  valor: number;
  descricao: string;
  pago: boolean;
}
