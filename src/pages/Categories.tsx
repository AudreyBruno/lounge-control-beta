import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Categoria } from '../types/database';
import { categoryService } from '../services/categoryService';

export function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.list();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Error loading categories');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (cat: Categoria) => {
    try {
      await categoryService.toggleStatus(cat.id, cat.status);
      await loadCategories();
    } catch (err: any) {
      setError(err.message || 'Error toggling status');
    }
  };

  if (loading && categories.length === 0) return <p>Loading categories...</p>;

  return (
    <div>
      <div className="page-header">
        <h2>Categorias</h2>
        <button onClick={() => navigate('/categories/new')} className="btn-primary">
          + Nova Categoria
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => (
            <tr key={cat.id}>
              <td>{cat.id}</td>
              <td>{cat.nome}</td>
              <td>
                <span className={cat.status ? 'status-active' : 'status-inactive'}>
                  {cat.status ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td>
                <button onClick={() => navigate(`/categories/edit/${cat.id}`)} style={{ marginRight: '10px' }}>Editar</button>
                <button onClick={() => handleToggleStatus(cat)} className={cat.status ? 'btn-danger' : 'btn-success'}>
                  {cat.status ? 'Desativar' : 'Ativar'}
                </button>
              </td>
            </tr>
          ))}
          {categories.length === 0 && (
            <tr className="empty-row">
              <td colSpan={4}>Nenhuma categoria cadastrada.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
