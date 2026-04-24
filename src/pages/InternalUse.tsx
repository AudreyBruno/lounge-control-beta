import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UsoInterno } from '../types/database';
import { UsoInternoRepository } from '../repositories/UsoInternoRepository';

const usoInternoRepo = new UsoInternoRepository();

export function InternalUse() {
  const navigate = useNavigate();
  const [usos, setUsos] = useState<UsoInterno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsos();
  }, []);

  const loadUsos = async () => {
    try {
      setLoading(true);
      const data = await usoInternoRepo.listUsosInternos();
      setUsos(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar usos internos');
    } finally {
      setLoading(false);
    }
  };

  if (loading && usos.length === 0) return <p>Carregando usos internos...</p>;

  return (
    <div>
      <div className="page-header">
        <h2>🔧 Histórico de Uso Interno</h2>
        <button className="btn-primary" onClick={() => navigate('/internal-use/new')}>
          + Novo Uso Interno
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Data</th>
              <th>Valor Total (R$)</th>
            </tr>
          </thead>
          <tbody>
            {usos.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{new Date(u.data).toLocaleString('pt-BR')}</td>
                <td>R$ {u.valor_total.toFixed(2)}</td>
              </tr>
            ))}
            {usos.length === 0 && (
              <tr className="empty-row">
                <td colSpan={3}>Nenhum uso interno registrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
