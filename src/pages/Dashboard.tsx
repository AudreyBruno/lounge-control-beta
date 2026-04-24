import { useState, useEffect } from 'react';
import { dashboardService, DashboardData } from '../services/dashboardService';

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const summary = await dashboardService.getSummary();
      setData(summary);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar o dashboard.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Carregando dashboard...</p>;
  if (error) return <div className="alert-error">{error}</div>;
  if (!data) return null;

  return (
    <div>
      <h2>Dashboard</h2>
      <p className="page-subtitle">
        Resumo do dia: {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      {/* Metric Cards */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
        <div className="card-metric" style={{ borderLeft: '4px solid var(--accent-success)' }}>
          <p className="card-metric-label">Vendas Hoje</p>
          <p className="card-metric-value" style={{ color: 'var(--accent-success)' }}>
            R$ {data.salesToday.toFixed(2)}
          </p>
        </div>

        <div className="card-metric" style={{ borderLeft: '4px solid var(--accent-warning)' }}>
          <p className="card-metric-label">A Receber (Pendente)</p>
          <p className="card-metric-value" style={{ color: 'var(--accent-warning)' }}>
            R$ {data.pendingReceivables.toFixed(2)}
          </p>
        </div>

        <div className="card-metric" style={{ borderLeft: '4px solid var(--accent-danger)' }}>
          <p className="card-metric-label">A Pagar (Futuros/Atuais)</p>
          <p className="card-metric-value" style={{ color: 'var(--accent-danger)' }}>
            R$ {data.upcomingPayables.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Low Stock Alert */}
      <div className="card">
        <h3 className="mt-0">
          ⚠️ Alerta de Estoque Baixo
          {data.lowStockProducts.length > 0 && (
            <span style={{ 
              marginLeft: '10px', fontSize: '0.8em', backgroundColor: 'var(--accent-danger)', 
              color: '#fff', padding: '2px 8px', borderRadius: '12px' 
            }}>
              {data.lowStockProducts.length}
            </span>
          )}
        </h3>

        {data.lowStockProducts.length === 0 ? (
          <p className="status-active">✅ Todos os produtos estão com estoque adequado.</p>
        ) : (
          <table className="data-table warning-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Estoque Atual</th>
              </tr>
            </thead>
            <tbody>
              {data.lowStockProducts.map(p => (
                <tr key={p.id}>
                  <td>{p.descricao}</td>
                  <td>
                    <span className="status-inactive" style={{ color: p.estoque === 0 ? 'var(--accent-danger)' : 'var(--accent-warning)' }}>
                      {p.estoque} unidades
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
