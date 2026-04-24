import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService, ProdutoWithDetails } from '../services/productService';
import { internalUseService } from '../services/internalUseService';

interface CartItem extends ProdutoWithDetails {
  cart_quantity: number;
}

export function InternalUseForm() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProdutoWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cart State
  const [selectedProduct, setSelectedProduct] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const prodData = await productService.listFull();
      setProducts(prodData);
    } catch (err: any) {
      setError(err.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (selectedProduct === 0 || quantity <= 0) return;
    
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const existing = cart.find(c => c.id === product.id);
    if (existing) {
      setCart(cart.map(c => 
        c.id === product.id 
          ? { ...c, cart_quantity: c.cart_quantity + quantity }
          : c
      ));
    } else {
      setCart([...cart, { ...product, cart_quantity: quantity }]);
    }

    setSelectedProduct(0);
    setQuantity(1);
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(c => c.id !== productId));
  };

  const totalCart = cart.reduce((acc, item) => acc + (item.valor * item.cart_quantity), 0);

  const handleFinishInternalUse = async () => {
    if (cart.length === 0) return;

    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload = {
        produtos: cart.map(c => ({
          produto_id: c.id,
          quantidade: c.cart_quantity,
          valor_unitario: c.valor
        }))
      };

      const usoId = await internalUseService.registerInternalUse(payload);
      
      setSuccessMessage(`Uso Interno #${usoId} registrado com sucesso! Estoque abatido.`);
      
      setCart([]);
      
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar uso interno.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && products.length === 0) return <p>Carregando...</p>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ margin: 0 }}>Novo Uso Interno</h2>
          <p className="page-subtitle">
            Registre os produtos consumidos internamente. Isso abaterá o estoque, mas não gerará contas a receber.
          </p>
        </div>
        <button
          className="btn-secondary"
          onClick={() => navigate('/internal-use')}
        >
          Ver Histórico
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {successMessage && <div className="alert-success">{successMessage}</div>}

      <div className="pdv-layout" style={{ marginTop: '20px' }}>
        {/* Lado Esquerdo: Adicionar produtos */}
        <div className="card-pdv">
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9em', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Adicionar Produto
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(Number(e.target.value))}
            style={{ width: '100%', marginBottom: '12px' }}
          >
            <option value={0} disabled>Selecione um produto</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.descricao} - R$ {p.valor.toFixed(2)} (Estoque: {p.estoque})
              </option>
            ))}
          </select>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              style={{ width: '90px' }}
            />
            <button
              onClick={handleAddToCart}
              disabled={selectedProduct === 0 || quantity <= 0}
              className="btn-primary"
              style={{ flex: 1 }}
            >
              + Adicionar Item
            </button>
          </div>
        </div>

        {/* Lado Direito: Carrinho e Finalização */}
        <div className="card-pdv">
          <h3 style={{ marginTop: 0 }}>Lista de Consumo</h3>

          {cart.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>A lista está vazia.</p>
          ) : (
            <table className="data-table" style={{ marginBottom: '20px' }}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qtd</th>
                  <th>Custo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={item.id}>
                    <td>{item.descricao}</td>
                    <td>{item.cart_quantity}</td>
                    <td>R$ {(item.valor * item.cart_quantity).toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="btn-ghost"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="pdv-total-box">
            <h2 style={{ margin: '0 0 16px 0', fontSize: '1.2em' }}>
              Custo Total Registrado: R$ {totalCart.toFixed(2)}
            </h2>
            <button
              onClick={handleFinishInternalUse}
              disabled={submitting || cart.length === 0}
              className="btn-warning pdv-finish-btn"
            >
              {submitting ? 'Processando...' : 'Registrar Consumo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
