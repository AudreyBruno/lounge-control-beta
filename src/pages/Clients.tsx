import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cliente } from '../types/database';
import { clientService } from '../services/clientService';

export function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [fiadoFilter, setFiadoFilter] = useState<'all' | 'yes' | 'no'>('all');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.list();
      setClients(data);
    } catch (err: any) {
      setError(err.message || 'Error loading clients');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (c: Cliente) => {
    try {
      await clientService.toggleStatus(c.id, c.status);
      await loadClients();
    } catch (err: any) {
      setError(err.message || 'Error toggling status');
    }
  };

  const filtered = useMemo(() => {
    return clients.filter(c => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        c.nome.toLowerCase().includes(q) ||
        (c.numero || '').toLowerCase().includes(q);
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && c.status) ||
        (statusFilter === 'inactive' && !c.status);
      const matchFiado =
        fiadoFilter === 'all' ||
        (fiadoFilter === 'yes' && c.permite_venda_prazo) ||
        (fiadoFilter === 'no' && !c.permite_venda_prazo);
      return matchSearch && matchStatus && matchFiado;
    });
  }, [clients, search, statusFilter, fiadoFilter]);

  if (loading && clients.length === 0) return <p>Loading clients...</p>;

  return (
    <div>
      <div className="page-header">
        <h2>Clientes</h2>
        <button onClick={() => navigate('/clients/new')} className="btn-primary">
          + Novo Cliente
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
            placeholder="Buscar por nome ou contato..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="filter-clear-btn" onClick={() => setSearch('')} title="Limpar busca">✕</button>
          )}
        </div>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
        <select
          className="filter-select"
          value={fiadoFilter}
          onChange={e => setFiadoFilter(e.target.value as any)}
        >
          <option value="all">Fiado: todos</option>
          <option value="yes">Permite fiado</option>
          <option value="no">Não permite fiado</option>
        </select>
        <span className="filter-count">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Contato</th>
            <th>Permite Fiado?</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(c => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.nome}</td>
              <td>{c.numero || '-'}</td>
              <td>
                <span className={c.permite_venda_prazo ? 'status-yes' : 'status-no'}>
                  {c.permite_venda_prazo ? 'Sim' : 'Não'}
                </span>
              </td>
              <td>
                <span className={c.status ? 'status-active' : 'status-inactive'}>
                  {c.status ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td>
                <div className="flex-row" style={{ gap: '6px' }}>
                  {c.status && (
                    <button
                      onClick={() => navigate(`/sales/new?clientId=${c.id}`)}
                      className="btn-success"
                      title="Iniciar venda para este cliente"
                    >
                      🛒 Vender
                    </button>
                  )}
                  <button onClick={() => navigate(`/clients/edit/${c.id}`)}>Editar</button>
                  <button onClick={() => handleToggleStatus(c)} className={c.status ? 'btn-danger' : 'btn-success'}>
                    {c.status ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr className="empty-row">
              <td colSpan={6}>Nenhum cliente encontrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
