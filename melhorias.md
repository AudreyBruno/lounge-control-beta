# Plano de Melhorias - Lounge Control v2.0

Este documento detalha as sugestões de melhoria para a próxima versão do sistema, focando em robustez, usabilidade e novas funcionalidades.

---

## 🛠️ Arquitetura e Backend

### 1. Transações de Banco de Dados
- **Problema:** Operações complexas (como vendas) não são atômicas. Se uma parte falha, o banco pode ficar inconsistente.
- **Sugestão:** Implementar transações SQL nos serviços de `Venda` e `Uso Interno`.
- **Impacto:** Alta integridade dos dados financeiros e de estoque.

### 2. Sistema de Migrations
- **Problema:** Atualmente o esquema é fixo. Alterações futuras podem causar perda de dados ou erros de inicialização.
- **Sugestão:** Implementar um controle de versão de banco de dados para gerenciar atualizações de tabelas de forma segura.
- **Impacto:** Facilidade de atualização para o usuário final.

### 3. Centralização de Lógica no Rust (Opcional)
- **Sugestão:** Mover cálculos pesados ou processos de segurança (como o hashing de senhas) para o backend em Rust.
- **Impacto:** Melhor performance e segurança.

---

## 🖥️ Layout e Interface (UI)

### 1. Dashboard Visual
- **Sugestão:** Substituir os cards puramente textuais por gráficos de linha e pizza.
- **Ferramenta:** Recharts ou Chart.js.
- **Métricas:** Vendas dos últimos 7 dias, categorias mais vendidas e status de recebíveis.

### 2. Feedback de Estado
- **Sugestão:** Implementar um sistema de "Toasts" (notificações flutuantes) para sucessos e erros, substituindo alertas estáticos que quebram o layout.
- **Impacto:** Interface mais limpa e moderna.

### 3. Modo PDV Otimizado
- **Sugestão:** Criar uma interface de "Modo Quiosque" ou tela cheia para o PDV, focando apenas no que é essencial para o atendimento rápido.

---

## ⚡ Usabilidade e UX

### 1. Atalhos de Teclado
- **Sugestão:** Mapear funções críticas para teclas de função (F1-F12).
- **Exemplos:** `F1` (Buscar Produto), `F12` (Finalizar), `ESC` (Cancelar).

### 2. Feedback Sonoro
- **Sugestão:** Adicionar sons sutis para:
    - Item adicionado com sucesso.
    - Erro (ex: sem estoque).
    - Venda finalizada.

### 3. Filtros Avançados e Paginação
- **Problema:** Listagens muito grandes podem ficar lentas no frontend.
- **Sugestão:** Implementar paginação e filtros diretamente na query SQL (backend-side filtering).

---

## ✨ Novas Funcionalidades

### 1. Controle de Caixa (Abertura e Fechamento)
- **Sugestão:** Fluxo de trabalho para iniciar e encerrar o dia de trabalho, conferindo o valor em espécie no caixa vs. valor registrado no sistema.

### 2. Relatórios e Exportação
- **Sugestão:** 
    - Exportação de listas para CSV/Excel.
    - Geração de PDF para fechamento de caixa ou recibos não fiscais.

### 3. Pagamentos Parciais e Múltiplos
- **Sugestão:** Permitir que uma única venda seja paga com diferentes métodos (ex: R$ 50,00 no Pix e R$ 20,00 no Dinheiro).

### 4. Histórico e Auditoria de Estoque
- **Sugestão:** Criar uma tela para visualizar todas as entradas e saídas de um produto específico, com o motivo da movimentação.

---

## 🔒 Segurança

### 1. Níveis de Acesso (Roles)
- **Sugestão:** Refinar o campo `is_admin` para permissões mais granulares (ex: balconista não pode excluir vendas ou alterar preços).

### 2. Logs de Auditoria
- **Sugestão:** Registrar em uma tabela de `logs` todas as ações sensíveis (exclusões, alterações de estoque manual, descontos concedidos).

### 3. Backup Integrado
- **Sugestão:** Criar um botão "Exportar Backup" que gera uma cópia do arquivo `.db` em um local escolhido pelo usuário.

---

## 🧪 Qualidade

### 1. Testes Automatizados
- **Sugestão:** Adicionar testes de unidade para os `Services` e testes de integração para o fluxo de venda.
- **Impacto:** Prevenção de bugs em novas atualizações.

### 2. Documentação de API Interna
- **Sugestão:** Documentar os comandos Tauri e a estrutura das tabelas para facilitar a entrada de novos desenvolvedores.
