import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { payableService, receivableService } from '../services/payableService';
import { ContasPagar, ContasReceber } from '../types/database';

type Tab = 'receber' | 'pagar';

export function Finance() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('receber');

  const [receivables, setReceivables] = useState<ContasReceber[]>([]);
  const [payables, setPayables] = useState<ContasPagar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Filtros - Receber
  const [searchReceber, setSearchReceber] = useState('');
  const [statusReceber, setStatusReceber] = useState<'all' | 'paid' | 'pending'>('all');

  // Filtros - Pagar
  const [searchPagar, setSearchPagar] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [recv, pay] = await Promise.all([
        receivableService.listAll(),
        payableService.list(),
      ]);
      setReceivables(recv);
      setPayables(pay);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar financeiro');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePago = async (item: ContasReceber) => {
    setTogglingId(item.id);
    try {
      if (item.pago) {
        await receivableService.markAsPending(item.id);
      } else {
        await receivableService.markAsPaid(item.id);
      }
      await loadAll();
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeletePayable = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja remover esta despesa?')) return;
    try {
      await payableService.delete(id);
      await loadAll();
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir despesa');
    }
  };

  const totalReceber = receivables.filter(r => !r.pago).reduce((s, r) => s + r.valor, 0);
  const totalRecebido = receivables.filter(r => r.pago).reduce((s, r) => s + r.valor, 0);
  const totalPagar = payables.reduce((s, p) => s + p.valor, 0);

  const filteredReceivables = useMemo(() => {
    return receivables.filter(r => {
      const matchSearch = !searchReceber || r.descricao.toLowerCase().includes(searchReceber.toLowerCase());
      const matchStatus =
        statusReceber === 'all' ||
        (statusReceber === 'paid' && r.pago) ||
        (statusReceber === 'pending' && !r.pago);
      return matchSearch && matchStatus;
    });
  }, [receivables, searchReceber, statusReceber]);

  const filteredPayables = useMemo(() => {
    return payables.filter(p =>
      !searchPagar || p.descricao.toLowerCase().includes(searchPagar.toLowerCase())
    );
  }, [payables, searchPagar]);

  if (loading && receivables.length === 0 && payables.length === 0) {
    return <p>Carregando financeiro...</p>;
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>💰 Financeiro</h2>
          <p className="page-subtitle">Acompanhe as receitas das vendas e as despesas do Lounge.</p>
        </div>
        {activeTab === 'pagar' && (
          <button className="btn-primary" onClick={() => navigate('/finance/new')}>
            + Nova Despesa
          </button>
        )}
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* Resumo cards */}
      <div className="flex-row" style={{ gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div className="card-metric">
          <p className="card-metric-label">⏳ A Receber (pendente)</p>
          <p className="card-metric-value" style={{ color: 'var(--accent-warning)' }}>
            R$ {totalReceber.toFixed(2)}
          </p>
        </div>
        <div className="card-metric">
          <p className="card-metric-label">✅ Recebido</p>
          <p className="card-metric-value" style={{ color: 'var(--accent-success)' }}>
            R$ {totalRecebido.toFixed(2)}
          </p>
        </div>
        <div className="card-metric">
          <p className="card-metric-label">📤 Despesas</p>
          <p className="card-metric-value" style={{ color: 'var(--accent-danger)' }}>
            R$ {totalPagar.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '0', borderBottom: '2px solid var(--surface-border)' }}>
        <button
          onClick={() => setActiveTab('receber')}
          style={{
            padding: '10px 22px',
            background: 'none',
            border: 'none',
            boxShadow: 'none',
            borderBottom: activeTab === 'receber' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            marginBottom: '-2px',
            color: activeTab === 'receber' ? 'var(--accent-primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'receber' ? 700 : 400,
            cursor: 'pointer',
            fontSize: '0.95rem',
            transition: 'all 0.2s',
            borderRadius: 0,
          }}
        >
          📥 Vendas / A Receber ({receivables.length})
        </button>
        <button
          onClick={() => setActiveTab('pagar')}
          style={{
            padding: '10px 22px',
            background: 'none',
            border: 'none',
            boxShadow: 'none',
            borderBottom: activeTab === 'pagar' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            marginBottom: '-2px',
            color: activeTab === 'pagar' ? 'var(--accent-primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'pagar' ? 700 : 400,
            cursor: 'pointer',
            fontSize: '0.95rem',
            transition: 'all 0.2s',
            borderRadius: 0,
          }}
        >
          📤 Despesas ({payables.length})
        </button>
      </div>

      {/* Contas a Receber (Vendas) */}
      {activeTab === 'receber' && (
        <>
          <div className="filter-bar" style={{ borderRadius: 0, borderTop: 'none' }}>
            <div className="filter-search-wrap">
              <span className="filter-search-icon">🔍</span>
              <input
                className="filter-search"
                type="text"
                placeholder="Buscar por descrição..."
                value={searchReceber}
                onChange={e => setSearchReceber(e.target.value)}
              />
              {searchReceber && (
                <button className="filter-clear-btn" onClick={() => setSearchReceber('')} title="Limpar">✕</button>
              )}
            </div>
            <select
              className="filter-select"
              value={statusReceber}
              onChange={e => setStatusReceber(e.target.value as any)}
            >
              <option value="all">Todos os status</option>
              <option value="paid">Recebido</option>
              <option value="pending">A Receber</option>
            </select>
            <span className="filter-count">{filteredReceivables.length} resultado{filteredReceivables.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '0 0 var(--radius-md) var(--radius-md)', borderTop: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Vencimento</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceivables.map(r => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.descricao}</td>
                    <td>R$ {r.valor.toFixed(2)}</td>
                    <td>{new Date(r.data_vencimento).toLocaleDateString('pt-BR')}</td>
                    <td>
                      {r.pago ? (
                        <span className="status-active">✅ Recebido</span>
                      ) : (
                        <span className="status-pending">⏳ A Receber</span>
                      )}
                    </td>
                    <td>
                      <button
                        className={r.pago ? 'btn-warning' : 'btn-success'}
                        disabled={togglingId === r.id}
                        onClick={() => handleTogglePago(r)}
                        style={{ minWidth: '140px' }}
                      >
                        {togglingId === r.id
                          ? 'Aguarde...'
                          : r.pago
                          ? 'Marcar Pendente'
                          : 'Marcar Recebido'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredReceivables.length === 0 && (
                  <tr className="empty-row">
                    <td colSpan={6}>Nenhum registro encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Contas a Pagar */}
      {activeTab === 'pagar' && (
        <>
          <div className="filter-bar" style={{ borderRadius: 0, borderTop: 'none' }}>
            <div className="filter-search-wrap">
              <span className="filter-search-icon">🔍</span>
              <input
                className="filter-search"
                type="text"
                placeholder="Buscar por descrição..."
                value={searchPagar}
                onChange={e => setSearchPagar(e.target.value)}
              />
              {searchPagar && (
                <button className="filter-clear-btn" onClick={() => setSearchPagar('')} title="Limpar">✕</button>
              )}
            </div>
            <span className="filter-count">{filteredPayables.length} resultado{filteredPayables.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '0 0 var(--radius-md) var(--radius-md)', borderTop: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Vencimento</th>
                  <th>Cadastro</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayables.map(p => (
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
                        <button className="btn-danger" onClick={() => handleDeletePayable(p.id)}>
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPayables.length === 0 && (
                  <tr className="empty-row">
                    <td colSpan={6}>Nenhuma despesa encontrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
