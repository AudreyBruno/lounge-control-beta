import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UsoInterno } from '../types/database';
import { UsoInternoRepository } from '../repositories/UsoInternoRepository';

const usoInternoRepo = new UsoInternoRepository();

export function InternalUse() {
  const navigate = useNavigate();
  const [usos, setUsos] = useState<UsoInterno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

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

  const filtered = useMemo(() => {
    return usos.filter(u => {
      if (!search) return true;
      const dateStr = new Date(u.data).toLocaleString('pt-BR');
      return dateStr.includes(search) || String(u.id).includes(search);
    });
  }, [usos, search]);

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

      {/* Filtros */}
      <div className="filter-bar">
        <div className="filter-search-wrap">
          <span className="filter-search-icon">🔍</span>
          <input
            className="filter-search"
            type="text"
            placeholder="Buscar por data ou ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="filter-clear-btn" onClick={() => setSearch('')} title="Limpar busca">✕</button>
          )}
        </div>
        <span className="filter-count">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
      </div>

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
            {filtered.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{new Date(u.data).toLocaleString('pt-BR')}</td>
                <td>R$ {u.valor_total.toFixed(2)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr className="empty-row">
                <td colSpan={3}>Nenhum uso interno encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
