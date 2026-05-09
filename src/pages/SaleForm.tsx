import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { clientService } from '../services/clientService';
import { productService, ProdutoWithDetails } from '../services/productService';
import { saleService } from '../services/saleService';
import { Cliente } from '../types/database';

interface CartItem extends ProdutoWithDetails {
  cart_quantity: number;
}

export function SaleForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetClientId = Number(searchParams.get('clientId')) || 0;
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

  // Client combobox state
  const [clientSearch, setClientSearch] = useState('');
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const clientRef = useRef<HTMLDivElement>(null);

  // Product combobox state
  const [productSearch, setProductSearch] = useState('');
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const productRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (clientRef.current && !clientRef.current.contains(e.target as Node)) {
        setClientDropdownOpen(false);
      }
      if (productRef.current && !productRef.current.contains(e.target as Node)) {
        setProductDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cliData, prodData] = await Promise.all([
        clientService.list(),
        productService.listFull()
      ]);
      const activeClients = cliData.filter(c => c.status);
      setClients(activeClients);
      setProducts(prodData);

      // Pre-select client if clientId was passed via URL
      if (presetClientId) {
        const preset = activeClients.find(c => c.id === presetClientId);
        if (preset) {
          setSelectedClient(preset.id);
          setClientSearch(preset.nome + (preset.numero ? ` (${preset.numero})` : ''));
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  // Filtered suggestions
  const filteredClients = useMemo(() => {
    const q = clientSearch.toLowerCase();
    if (!q) return clients.slice(0, 10);
    return clients.filter(
      c => c.nome.toLowerCase().includes(q) || (c.numero || '').toLowerCase().includes(q)
    ).slice(0, 10);
  }, [clients, clientSearch]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase();
    if (!q) return products.slice(0, 10);
    return products.filter(
      p =>
        p.descricao.toLowerCase().includes(q) ||
        (p.categoria_nome || '').toLowerCase().includes(q)
    ).slice(0, 10);
  }, [products, productSearch]);

  // Derived labels for selected items
  const selectedClientObj = clients.find(c => c.id === selectedClient);
  const selectedProductObj = products.find(p => p.id === selectedProduct);

  const handleSelectClient = (c: Cliente) => {
    setSelectedClient(c.id);
    setClientSearch(c.nome + (c.numero ? ` (${c.numero})` : ''));
    setClientDropdownOpen(false);
  };

  const handleSelectProduct = (p: ProdutoWithDetails) => {
    setSelectedProduct(p.id);
    setProductSearch(`${p.descricao} — R$ ${p.valor.toFixed(2)}`);
    setProductDropdownOpen(false);
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
    setProductSearch('');
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
      setClientSearch('');
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

          {/* ── BUSCA DE CLIENTE ── */}
          <div style={{ marginBottom: '20px' }}>
            <label className="pdv-label">Cliente</label>
            <div className="pdv-combobox" ref={clientRef}>
              <div className="pdv-combobox-input-wrap">
                <span className="pdv-combobox-icon">🔍</span>
                <input
                  className="pdv-combobox-input"
                  type="text"
                  placeholder="Buscar cliente pelo nome ou contato..."
                  value={clientSearch}
                  onChange={e => {
                    setClientSearch(e.target.value);
                    setSelectedClient(0);
                    setClientDropdownOpen(true);
                  }}
                  onFocus={() => setClientDropdownOpen(true)}
                />
                {selectedClientObj && (
                  <span className="pdv-combobox-badge">✓</span>
                )}
                {clientSearch && (
                  <button
                    className="pdv-combobox-clear"
                    onClick={() => { setClientSearch(''); setSelectedClient(0); setClientDropdownOpen(false); }}
                  >✕</button>
                )}
              </div>
              {clientDropdownOpen && filteredClients.length > 0 && (
                <ul className="pdv-combobox-list">
                  {filteredClients.map(c => (
                    <li
                      key={c.id}
                      className={`pdv-combobox-item${c.id === selectedClient ? ' selected' : ''}`}
                      onMouseDown={() => handleSelectClient(c)}
                    >
                      <span className="pdv-combobox-item-name">{c.nome}</span>
                      {c.numero && <span className="pdv-combobox-item-sub">{c.numero}</span>}
                      {c.permite_venda_prazo && <span className="pdv-combobox-tag">Fiado</span>}
                    </li>
                  ))}
                </ul>
              )}
              {clientDropdownOpen && clientSearch && filteredClients.length === 0 && (
                <div className="pdv-combobox-empty">Nenhum cliente encontrado</div>
              )}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--surface-border)' }} />

          {/* ── BUSCA DE PRODUTO ── */}
          <div style={{ marginTop: '20px' }}>
            <label className="pdv-label">Adicionar Produto</label>
            <div className="pdv-combobox" ref={productRef} style={{ marginBottom: '12px' }}>
              <div className="pdv-combobox-input-wrap">
                <span className="pdv-combobox-icon">🔍</span>
                <input
                  className="pdv-combobox-input"
                  type="text"
                  placeholder="Buscar produto por nome ou categoria..."
                  value={productSearch}
                  onChange={e => {
                    setProductSearch(e.target.value);
                    setSelectedProduct(0);
                    setProductDropdownOpen(true);
                  }}
                  onFocus={() => setProductDropdownOpen(true)}
                />
                {selectedProductObj && (
                  <span className="pdv-combobox-badge">✓</span>
                )}
                {productSearch && (
                  <button
                    className="pdv-combobox-clear"
                    onClick={() => { setProductSearch(''); setSelectedProduct(0); setProductDropdownOpen(false); }}
                  >✕</button>
                )}
              </div>
              {productDropdownOpen && filteredProducts.length > 0 && (
                <ul className="pdv-combobox-list">
                  {filteredProducts.map(p => (
                    <li
                      key={p.id}
                      className={`pdv-combobox-item${p.id === selectedProduct ? ' selected' : ''}`}
                      onMouseDown={() => handleSelectProduct(p)}
                    >
                      <span className="pdv-combobox-item-name">{p.descricao}</span>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {p.categoria_nome && <span className="pdv-combobox-item-sub">{p.categoria_nome}</span>}
                        <span className="pdv-combobox-tag pdv-combobox-tag--price">R$ {p.valor.toFixed(2)}</span>
                        <span className={`pdv-combobox-tag${p.estoque <= 0 ? ' pdv-combobox-tag--danger' : ''}`}>
                          Estoque: {p.estoque}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {productDropdownOpen && productSearch && filteredProducts.length === 0 && (
                <div className="pdv-combobox-empty">Nenhum produto encontrado</div>
              )}
            </div>

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

