import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Venda } from '../types/database';
import { VendaRepository } from '../repositories/VendaRepository';
import { ClienteRepository } from '../repositories/ClienteRepository';
import { Cliente } from '../types/database';

interface VendaWithCliente extends Venda {
  cliente_nome: string;
}

const vendaRepo = new VendaRepository();
const clienteRepo = new ClienteRepository();

export function Sales() {
  const navigate = useNavigate();
  const [vendas, setVendas] = useState<VendaWithCliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadVendas();
  }, []);

  const loadVendas = async () => {
    try {
      setLoading(true);
      const [vendasData, clientesData] = await Promise.all([
        vendaRepo.listVendas(),
        clienteRepo.list()
      ]);

      const clienteMap = new Map<number, string>();
      for (const c of clientesData as Cliente[]) {
        clienteMap.set(c.id, c.nome);
      }

      const vendasComCliente: VendaWithCliente[] = vendasData.map(v => ({
        ...v,
        cliente_nome: clienteMap.get(v.cliente_id) || 'Desconhecido'
      }));

      setVendas(vendasComCliente);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar vendas');
    } finally {
      setLoading(false);
    }
  };

  if (loading && vendas.length === 0) return <p>Carregando vendas...</p>;

  return (
    <div>
      <div className="page-header">
        <h2>Histórico de Vendas</h2>
        <button onClick={() => navigate('/sales/new')} className="btn-primary">
          + Nova Venda (PDV)
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Data</th>
            <th>Cliente</th>
            <th>Valor Total (R$)</th>
            <th>Valor Pago (R$)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {vendas.map(v => (
            <tr key={v.id}>
              <td>{v.id}</td>
              <td>{new Date(v.data).toLocaleString('pt-BR')}</td>
              <td>{v.cliente_nome}</td>
              <td>{v.valor_total.toFixed(2)}</td>
              <td>{v.valor_pago.toFixed(2)}</td>
              <td>
                <span className={v.pago ? 'status-active' : 'status-pending'}>
                  {v.pago ? 'Pago' : 'Pendente'}
                </span>
              </td>
            </tr>
          ))}
          {vendas.length === 0 && (
            <tr className="empty-row">
              <td colSpan={6}>Nenhuma venda registrada.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
