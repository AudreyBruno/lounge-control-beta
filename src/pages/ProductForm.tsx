import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Categoria, Produto } from '../types/database';
import { ProdutoWithDetails, productService } from '../services/productService';
import { categoryService } from '../services/categoryService';

export function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState<Categoria[]>([]);
  const [descricao, setDescricao] = useState('');
  const [categoriaId, setCategoriaId] = useState<number>(0);
  const [valor, setValor] = useState<number | string>('');
  const [estoque, setEstoque] = useState<number>(0);
  const [movimentaEstoque, setMovimentaEstoque] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
    if (isEditing && id) {
      loadProduct(Number(id));
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const cats = await categoryService.list();
      setCategories(cats.filter(c => c.status));
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar categorias');
    }
  };

  const loadProduct = async (prodId: number) => {
    try {
      setLoading(true);
      const products = await productService.listFull();
      const prod = products.find((p: ProdutoWithDetails) => p.id === prodId);
      if (prod) {
        setDescricao(prod.descricao);
        setCategoriaId(prod.categoria_id);
        setValor(prod.valor);
        setEstoque(prod.estoque);
        setMovimentaEstoque(prod.movimenta_estoque);
      } else {
        setError('Produto não encontrado');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const parsedValor = parseFloat(String(valor));
      const payload: Omit<Produto, 'id'> = {
        categoria_id: categoriaId,
        descricao,
        estoque,
        valor: parsedValor,
        movimenta_estoque: movimentaEstoque
      };

      if (isEditing && id) {
        await productService.update(Number(id), payload);
      } else {
        await productService.create(payload);
      }
      navigate('/products');
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar produto');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Carregando dados do produto...</p>;

  return (
    <div>
      <h2>{isEditing ? 'Editar Produto' : 'Novo Produto'}</h2>
      {error && <div className="alert-error">{error}</div>}

      <div className="card-form">
        <form onSubmit={handleSubmit} className="form-group">
          
          <label>Descrição:</label>
          <input 
            type="text" 
            value={descricao} 
            onChange={(e) => setDescricao(e.target.value)} 
            required 
          />

          <label>Categoria:</label>
          <select 
            value={categoriaId} 
            onChange={(e) => setCategoriaId(Number(e.target.value))}
            required
          >
            <option value={0} disabled>Selecione uma categoria</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>

          <label>Valor (R$):</label>
          <input 
            type="number" 
            step="0.01" 
            value={valor} 
            onChange={(e) => setValor(e.target.value)} 
            required 
          />

          <label>Estoque (Qtd):</label>
          <input 
            type="number" 
            value={estoque} 
            onChange={(e) => setEstoque(Number(e.target.value))} 
            required 
          />

          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={movimentaEstoque} 
              onChange={(e) => setMovimentaEstoque(e.target.checked)} 
            />
            Movimenta Estoque (Ex: Se for item de serviço, desmarque)
          </label>

          <div className="form-actions">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
            </button>
            <button type="button" onClick={() => navigate('/products')} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
