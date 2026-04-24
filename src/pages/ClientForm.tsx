import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clientService } from '../services/clientService';

export function ClientForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [nome, setNome] = useState('');
  const [numero, setNumero] = useState('');
  const [permiteVendaPrazo, setPermiteVendaPrazo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing && id) {
      loadClient(Number(id));
    }
  }, [id]);

  const loadClient = async (clientId: number) => {
    try {
      setLoading(true);
      const clients = await clientService.list();
      const client = clients.find(c => c.id === clientId);
      if (client) {
        setNome(client.nome);
        setNumero(client.numero || '');
        setPermiteVendaPrazo(client.permite_venda_prazo);
      } else {
        setError('Cliente não encontrado');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (isEditing && id) {
        await clientService.update(Number(id), {
          nome,
          numero,
          permite_venda_prazo: permiteVendaPrazo
        });
      } else {
        await clientService.create({
          nome,
          numero,
          permite_venda_prazo: permiteVendaPrazo,
          status: true
        });
      }
      navigate('/clients');
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar cliente');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Carregando dados do cliente...</p>;

  return (
    <div>
      <h2>{isEditing ? 'Editar Cliente' : 'Novo Cliente'}</h2>
      {error && <div className="alert-error">{error}</div>}

      <div className="card-form">
        <form onSubmit={handleSubmit} className="form-group">
          
          <label>Nome:</label>
          <input 
            type="text" 
            value={nome} 
            onChange={(e) => setNome(e.target.value)} 
            required 
          />

          <label>Telefone / Contato:</label>
          <input 
            type="text" 
            value={numero} 
            onChange={(e) => setNumero(e.target.value)} 
          />

          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={permiteVendaPrazo} 
              onChange={(e) => setPermiteVendaPrazo(e.target.checked)} 
            />
            Permite Venda a Prazo (Fiado)?
          </label>

          <div className="form-actions">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
            </button>
            <button type="button" onClick={() => navigate('/clients')} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
