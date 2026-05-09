import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Categoria } from '../types/database';
import { categoryService } from '../services/categoryService';

export function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

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

  const filtered = useMemo(() => {
    return categories.filter(cat => {
      const matchSearch = !search || cat.nome.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && cat.status) ||
        (statusFilter === 'inactive' && !cat.status);
      return matchSearch && matchStatus;
    });
  }, [categories, search, statusFilter]);

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

      {/* Filtros */}
      <div className="filter-bar">
        <div className="filter-search-wrap">
          <span className="filter-search-icon">🔍</span>
          <input
            className="filter-search"
            type="text"
            placeholder="Buscar por nome..."
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
        <span className="filter-count">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
      </div>

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
          {filtered.map(cat => (
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
          {filtered.length === 0 && (
            <tr className="empty-row">
              <td colSpan={4}>Nenhuma categoria encontrada.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
