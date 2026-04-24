import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { payableService } from '../services/payableService';
import { ContasPagar } from '../types/database';

export function Finance() {
  const navigate = useNavigate();
  const [payables, setPayables] = useState<ContasPagar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPayables();
  }, []);

  const loadPayables = async () => {
    try {
      setLoading(true);
      const data = await payableService.list();
      setPayables(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar financeiro');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja remover esta conta a pagar?')) return;
    try {
      await payableService.delete(id);
      await loadPayables();
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir conta');
    }
  };

  if (loading && payables.length === 0) return <p>Carregando financeiro...</p>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>💰 Financeiro — Contas a Pagar</h2>
          <p className="page-subtitle">Registre as despesas manuais do Lounge.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/finance/new')}>
          + Nova Despesa
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Vencimento</th>
              <th>Cadastro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {payables.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.descricao}</td>
                <td>R$ {p.valor.toFixed(2)}</td>
                <td>{new Date(p.data_vencimento).toLocaleDateString('pt-BR')}</td>
                <td>{new Date(p.data_cadastro).toLocaleDateString('pt-BR')}</td>
                <td>
                  <div className="flex-row" style={{ gap: '8px' }}>
                    <button className="btn-warning" onClick={() => navigate(`/finance/edit/${p.id}`)}>
                      Editar
                    </button>
                    <button className="btn-danger" onClick={() => handleDelete(p.id)}>
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {payables.length === 0 && (
              <tr className="empty-row">
                <td colSpan={6}>Nenhuma conta a pagar cadastrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
