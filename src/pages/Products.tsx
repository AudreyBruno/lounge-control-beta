import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProdutoWithDetails, productService } from '../services/productService';

export function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProdutoWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const prods = await productService.listFull();
      setProducts(prods);
    } catch (err: any) {
      setError(err.message || 'Error loading products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await productService.delete(id);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Error deleting product');
    }
  };

  if (loading && products.length === 0) return <p>Loading products...</p>;

  return (
    <div>
      <div className="page-header">
        <h2>Produtos</h2>
        <button onClick={() => navigate('/products/new')} className="btn-primary">
          + Novo Produto
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Descrição</th>
            <th>Categoria</th>
            <th>Valor (R$)</th>
            <th>Estoque</th>
            <th>Movimenta Estoque?</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {products.map(prod => (
            <tr key={prod.id}>
              <td>{prod.id}</td>
              <td>{prod.descricao}</td>
              <td>{prod.categoria_nome}</td>
              <td>{prod.valor.toFixed(2)}</td>
              <td>{prod.estoque}</td>
              <td>
                <span className={prod.movimenta_estoque ? 'status-yes' : 'status-no'}>
                  {prod.movimenta_estoque ? 'Sim' : 'Não'}
                </span>
              </td>
              <td>
                <button onClick={() => navigate(`/products/edit/${prod.id}`)} style={{ marginRight: '10px' }}>Editar</button>
                <button onClick={() => handleDelete(prod.id)} className="btn-danger">Excluir</button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr className="empty-row">
              <td colSpan={7}>Nenhum produto cadastrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
