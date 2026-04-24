import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryService } from '../services/categoryService';

export function CategoryForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [nome, setNome] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing && id) {
      loadCategory(Number(id));
    }
  }, [id]);

  const loadCategory = async (catId: number) => {
    try {
      setLoading(true);
      const categories = await categoryService.list();
      const cat = categories.find(c => c.id === catId);
      if (cat) {
        setNome(cat.nome);
      } else {
        setError('Categoria não encontrada');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar categoria');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      if (isEditing && id) {
        await categoryService.update(Number(id), nome);
      } else {
        await categoryService.create(nome);
      }
      navigate('/categories');
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar categoria');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Carregando dados da categoria...</p>;

  return (
    <div>
      <h2>{isEditing ? 'Editar Categoria' : 'Nova Categoria'}</h2>
      {error && <div className="alert-error">{error}</div>}

      <div className="card-form">
        <form onSubmit={handleSubmit} className="form-group">
          
          <label>Nome:</label>
          <input 
            type="text" 
            placeholder="Nome da Categoria"
            value={nome} 
            onChange={(e) => setNome(e.target.value)} 
            required 
          />

          <div className="form-actions">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
            </button>
            <button type="button" onClick={() => navigate('/categories')} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
