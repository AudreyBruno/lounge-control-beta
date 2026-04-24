import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cliente } from '../types/database';
import { clientService } from '../services/clientService';

export function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
          {clients.map(c => (
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
                <button onClick={() => navigate(`/clients/edit/${c.id}`)} style={{ marginRight: '10px' }}>Editar</button>
                <button onClick={() => handleToggleStatus(c)} className={c.status ? 'btn-danger' : 'btn-success'}>
                  {c.status ? 'Desativar' : 'Ativar'}
                </button>
              </td>
            </tr>
          ))}
          {clients.length === 0 && (
            <tr className="empty-row">
              <td colSpan={6}>Nenhum cliente cadastrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
