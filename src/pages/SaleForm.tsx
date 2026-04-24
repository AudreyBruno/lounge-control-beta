import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientService } from '../services/clientService';
import { productService, ProdutoWithDetails } from '../services/productService';
import { saleService } from '../services/saleService';
import { Cliente } from '../types/database';

interface CartItem extends ProdutoWithDetails {
  cart_quantity: number;
}

export function SaleForm() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Cliente[]>([]);
  const [products, setProducts] = useState<ProdutoWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cart State
  const [selectedClient, setSelectedClient] = useState<number>(0);
  const [selectedProduct, setSelectedProduct] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [valorPago, setValorPago] = useState<number | string>('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cliData, prodData] = await Promise.all([
        clientService.list(),
        productService.listFull()
      ]);
      setClients(cliData.filter(c => c.status));
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

  const handleFinishSale = async () => {
    if (cart.length === 0) return;
    if (selectedClient === 0) {
      setError('Selecione um cliente.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload = {
        cliente_id: selectedClient,
        valor_pago: Number(valorPago) || 0,
        produtos: cart.map(c => ({
          produto_id: c.id,
          quantidade: c.cart_quantity,
          valor_unitario: c.valor
        }))
      };

      const vendaId = await saleService.registerSale(payload);
      
      setSuccessMessage(`Venda #${vendaId} registrada com sucesso!`);
      
      setCart([]);
      setSelectedClient(0);
      setValorPago('');
      
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar venda.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && clients.length === 0) return <p>Carregando PDV...</p>;

  return (
    <div>
      <div className="page-header">
        <h2>Nova Venda (PDV)</h2>
        <button onClick={() => navigate('/sales')} className="btn-secondary">
          Ver Histórico de Vendas
        </button>
      </div>
      
      {error && <div className="alert-error">{error}</div>}
      {successMessage && <div className="alert-success">{successMessage}</div>}

      <div className="pdv-layout">
        {/* Lado Esquerdo */}
        <div className="card-pdv">
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-secondary)' }}>Cliente</label>
            <select 
              value={selectedClient} 
              onChange={(e) => setSelectedClient(Number(e.target.value))}
              style={{ width: '100%' }}
            >
              <option value={0} disabled>Selecione um cliente</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.nome} {c.numero ? `(${c.numero})` : ''}</option>
              ))}
            </select>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--surface-border)' }} />

          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-secondary)' }}>Adicionar Produto</label>
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

            <div className="flex-row">
              <input 
                type="number" 
                min="1" 
                value={quantity} 
                onChange={(e) => setQuantity(Number(e.target.value))} 
                style={{ width: '80px' }}
              />
              <button 
                onClick={handleAddToCart}
                disabled={selectedProduct === 0 || quantity <= 0}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                + Adicionar ao Carrinho
              </button>
            </div>
          </div>
        </div>

        {/* Lado Direito */}
        <div className="card-pdv">
          <h3 className="mt-0">Carrinho</h3>
          
          {cart.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Seu carrinho está vazio.</p>
          ) : (
            <table className="data-table" style={{ marginBottom: '20px' }}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qtd</th>
                  <th>Total</th>
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
                      <button onClick={() => removeFromCart(item.id)} className="btn-ghost">Remover</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="pdv-total-box">
            <h2>Total: R$ {totalCart.toFixed(2)}</h2>
            
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Valor Pago (R$):</label>
            <input 
              type="number" 
              step="0.01" 
              value={valorPago} 
              onChange={(e) => setValorPago(e.target.value)} 
              placeholder="Digite o valor pago pelo cliente"
              style={{ width: '100%', marginBottom: '16px' }}
            />

            <button 
              onClick={handleFinishSale} 
              disabled={submitting || cart.length === 0}
              className="btn-success pdv-finish-btn"
            >
              {submitting ? 'Processando...' : 'Finalizar Venda'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
