import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { initDatabase, getDb } from "./database/connection";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Categories } from "./pages/Categories";
import { CategoryForm } from "./pages/CategoryForm";
import { Products } from "./pages/Products";
import { ProductForm } from "./pages/ProductForm";
import { Clients } from "./pages/Clients";
import { ClientForm } from "./pages/ClientForm";
import { Sales } from "./pages/Sales";
import { SaleForm } from "./pages/SaleForm";
import { InternalUse } from "./pages/InternalUse";
import { InternalUseForm } from "./pages/InternalUseForm";
import { Finance } from "./pages/Finance";
import { FinanceForm } from "./pages/FinanceForm";
import { useAuthStore } from "./store/authStore";
import { useThemeStore } from "./store/themeStore";

function App() {
  const [dbStatus, setDbStatus] = useState("Iniciando banco de dados...");
  const [isDbReady, setIsDbReady] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { theme } = useThemeStore();

  // Apply saved theme early, even before the sidebar renders
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    async function setup() {
      try {
        await initDatabase();
        setDbStatus("Banco de dados pronto ✅");

        // Seed an admin user if none exists (for dev/first run)
        const db = await getDb();
        const users = await db.select<any[]>('SELECT * FROM users LIMIT 1');
        if (users.length === 0) {
          import('bcryptjs').then(async (bcrypt) => {
            const hash = await bcrypt.default.hash('admin', 10);
            await db.execute(
              'INSERT INTO users (name, username, password, is_admin) VALUES ($1, $2, $3, $4)',
              ['Administrador', 'admin', hash, 1]
            );
            console.log('Admin user seeded (admin/admin)');
          });
        }

        setIsDbReady(true);
      } catch (err: any) {
        setDbStatus(`Erro no banco de dados ❌: ${err.message}`);
      }
    }
    setup();
  }, []);

  if (!isDbReady) {
    return (
      <div className="splash-screen">
        <h2>Lounge Control</h2>
        <p>{dbStatus}</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

        {/* Protected Routes inside Layout */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/new" element={<ClientForm />} />
          <Route path="/clients/edit/:id" element={<ClientForm />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/new" element={<CategoryForm />} />
          <Route path="/categories/edit/:id" element={<CategoryForm />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/edit/:id" element={<ProductForm />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/sales/new" element={<SaleForm />} />
          <Route path="/internal-use" element={<InternalUse />} />
          <Route path="/internal-use/new" element={<InternalUseForm />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/finance/new" element={<FinanceForm />} />
          <Route path="/finance/edit/:id" element={<FinanceForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
