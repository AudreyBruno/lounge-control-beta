import { useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

export function Layout() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { theme, toggleTheme } = useThemeStore();

  // Apply theme attribute on mount and whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <nav className="sidebar">
        <h3>Lounge Control</h3>
        <p className="user-info">Usuário: {user?.username}</p>
        <hr />

        <Link to="/" className="sidebar-link">📊 Dashboard</Link>
        <Link to="/clients" className="sidebar-link">👤 Clientes</Link>
        <Link to="/categories" className="sidebar-link">🏷️ Categorias</Link>
        <Link to="/products" className="sidebar-link">📦 Produtos</Link>
        <Link to="/sales" className="sidebar-link">🛒 PDV (Vendas)</Link>
        <Link to="/internal-use" className="sidebar-link">🔧 Uso Interno</Link>
        <Link to="/finance" className="sidebar-link">💰 Financeiro</Link>

        <div className="logout-area">
          <button className="theme-toggle" onClick={toggleTheme} title="Alternar tema">
            {theme === 'dark' ? '☀️ Tema Claro' : '🌙 Tema Escuro'}
          </button>
          <button onClick={logout}>Sair</button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
