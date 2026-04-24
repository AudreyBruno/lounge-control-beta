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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h2 style={{ margin: 0 }}>Novo Uso Interno</h2>
        <button 
          onClick={() => navigate('/internal-use')} 
          style={{ padding: '8px 15px' }}
        >
          Ver Histórico
        </button>
      </div>
      <p style={{ color: '#666' }}>
        Registre os produtos consumidos internamente. Isso abaterá o estoque, mas não gerará contas a receber.
      </p>
      
      {error && <div style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#ffeaea' }}>{error}</div>}
      {successMessage && <div style={{ color: 'green', marginBottom: '10px', padding: '10px', backgroundColor: '#eaffea' }}>{successMessage}</div>}

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        {/* Lado Esquerdo: Adicionar produtos */}
        <div style={{ flex: 1, backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
          
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Adicionar Produto</label>
            <select 
              value={selectedProduct} 
              onChange={(e) => setSelectedProduct(Number(e.target.value))}
              style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
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
                style={{ padding: '10px', width: '80px' }}
              />
              <button 
                onClick={handleAddToCart}
                disabled={selectedProduct === 0 || quantity <= 0}
                style={{ flex: 1, padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
              >
                + Adicionar Item
              </button>
            </div>
          </div>
        </div>

        {/* Lado Direito: Carrinho e Finalização */}
        <div style={{ flex: 1, backgroundColor: '#fafafa', border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          <h3>Lista de Consumo</h3>
          
          {cart.length === 0 ? (
            <p>A lista está vazia.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>Item</th>
                  <th style={{ padding: '8px' }}>Qtd</th>
                  <th style={{ padding: '8px' }}>Custo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px' }}>{item.descricao}</td>
                    <td style={{ padding: '8px' }}>{item.cart_quantity}</td>
                    <td style={{ padding: '8px' }}>R$ {(item.valor * item.cart_quantity).toFixed(2)}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>
                      <button onClick={() => removeFromCart(item.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Remover</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff', border: '1px solid #ccc' }}>
            <h2 style={{ margin: '0 0 15px 0', fontSize: '1.2em' }}>Custo Total Registrado: R$ {totalCart.toFixed(2)}</h2>
            
            <button 
              onClick={handleFinishInternalUse} 
              disabled={submitting || cart.length === 0}
              style={{ width: '100%', padding: '15px', backgroundColor: '#ffc107', color: '#000', border: 'none', fontSize: '1.1em', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {submitting ? 'Processando...' : 'Registrar Consumo'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
