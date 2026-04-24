import { VendaRepository } from '../repositories/VendaRepository';
import { FinanceRepository } from '../repositories/FinanceRepository';
import { ProdutoRepository } from '../repositories/ProdutoRepository';
import { Produto } from '../types/database';

const vendaRepo = new VendaRepository();
const financeRepo = new FinanceRepository();
const produtoRepo = new ProdutoRepository();

export interface DashboardData {
  salesToday: number;
  pendingReceivables: number;
  upcomingPayables: number;
  lowStockProducts: Produto[];
}

export const dashboardService = {
  async getSummary(): Promise<DashboardData> {
    const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

    const [salesToday, pendingReceivables, upcomingPayables, lowStockProducts] = await Promise.all([
      vendaRepo.getSalesTotalByDate(today),
      financeRepo.getPendingReceivablesTotal(),
      financeRepo.getUpcomingPayablesTotal(today),
      produtoRepo.getLowStock(5),
    ]);

    return {
      salesToday,
      pendingReceivables,
      upcomingPayables,
      lowStockProducts,
    };
  }
};
