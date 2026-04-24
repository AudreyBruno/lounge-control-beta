import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { payableService } from '../services/payableService';

export function FinanceForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState<number | string>('');
  const [dataVencimento, setDataVencimento] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing && id) {
      loadPayable(Number(id));
    }
  }, [id]);

  const loadPayable = async (payableId: number) => {
    try {
      setLoading(true);
      const payables = await payableService.list();
      const p = payables.find(item => item.id === payableId);
      if (p) {
        setDescricao(p.descricao);
        setValor(p.valor);
        const dateStr = p.data_vencimento ? p.data_vencimento.split('T')[0] : '';
        setDataVencimento(dateStr);
      } else {
        setError('Despesa não encontrada');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar despesa');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const numValor = Number(valor);
      
      if (isEditing && id) {
        await payableService.update(Number(id), {
          descricao,
          valor: numValor,
          data_vencimento: new Date(dataVencimento).toISOString(),
        });
      } else {
        await payableService.create({
          descricao,
          valor: numValor,
          data_cadastro: new Date().toISOString(),
          data_vencimento: new Date(dataVencimento).toISOString(),
        });
      }
      navigate('/finance');
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar despesa');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Carregando dados da despesa...</p>;

  return (
    <div>
      <div className="page-header">
        <h2 style={{ margin: 0 }}>{isEditing ? 'Editar Despesa' : 'Nova Despesa'}</h2>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="card-form">
        <form onSubmit={handleSubmit} className="form-group">

          <label>Descrição:</label>
          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required
            placeholder="Ex: Manutenção de equipamento"
          />

          <label>Valor (R$):</label>
          <input
            type="number"
            step="0.01"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            required
            placeholder="0,00"
          />

          <label>Data de Vencimento:</label>
          <input
            type="date"
            value={dataVencimento}
            onChange={(e) => setDataVencimento(e.target.value)}
            required
          />

          <div className="form-actions">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Registrar')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/finance')}
              className="btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
