# Implementation Tasks

Follow this exact order when implementing the system.

---

# Phase 1 — Project Setup

1 Initialize Tauri project
2 Setup React + TypeScript
3 Setup SQLite connection
4 Create database initialization logic
5 Run database.sql on first startup

---

# Phase 2 — Database Layer

Create repository layer for all tables.

Repositories:

UserRepository
ClienteRepository
CategoriaRepository
ProdutoRepository
VendaRepository
FinanceRepository

Each repository must support:

create
update
delete
findById
list

---

# Phase 3 — Authentication

Create login system.

Features:

login with username/password
hash password
store user session

Admin users must have full access.

---

# Phase 4 — Products

Implement:

Category CRUD
Product CRUD

Features:

create category
edit category
activate/deactivate category

create product
edit product
update stock

---

# Phase 5 — Clients

Client CRUD.

Fields:

nome
numero
status
permite_venda_prazo

---

# Phase 6 — Sales System

Create full sale workflow.

Steps:

select client
add products
set quantities
calculate total
insert sale
insert sale items

Logic:

update stock if movimenta_estoque = true

---

# Phase 7 — Accounts Receivable

When a sale is created:

create contas_receber record.

Rules:

if valor_pago >= valor_total

mark as paid

otherwise

mark as pending.

---

# Phase 8 — Internal Use

Create internal usage system.

Steps:

select products
set quantities
calculate total

Insert:

uso_interno
uso_interno_item

Decrease stock.

---

# Phase 9 — Accounts Payable

Create manual finance entries.

CRUD:

create expense
edit expense
delete expense

---

# Phase 10 — Dashboard

Dashboard must show:

sales today
pending receivables
upcoming payables
low stock products

---

# Phase 11 — Reports (optional)

Sales report
Financial report
Stock report

---

# Development Rules

Always use services for business logic.

Services required:

saleService
stockService
financeService

Repositories must not contain business logic.
