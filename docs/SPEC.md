# Lounge Management System — Technical Spec

## 1. Project Overview

Desktop application for managing a lounge/bar business.

Main responsibilities:

* client management
* product and inventory management
* sales
* internal product consumption
* accounts payable
* accounts receivable

The system must work **offline-first** using a local database.

---

# 2. Technology Stack

Desktop Framework

* Tauri

Frontend

* React
* TypeScript

Database

* SQLite

Database Access

* Drizzle ORM or direct SQL

State Management

* Zustand or React Context

---

# 3. Database Schema

## users

Purpose: authentication and system access.

Fields:

id INTEGER PRIMARY KEY
name TEXT NOT NULL
username TEXT UNIQUE NOT NULL
password TEXT NOT NULL
is_admin BOOLEAN DEFAULT false

---

## clientes

Represents lounge customers.

Fields:

id INTEGER PRIMARY KEY
nome TEXT NOT NULL
numero TEXT
status BOOLEAN DEFAULT true
permite_venda_prazo BOOLEAN DEFAULT false

---

## categoria

Product categories.

Fields:

id INTEGER PRIMARY KEY
nome TEXT NOT NULL
status BOOLEAN DEFAULT true

---

## produto

Products sold in the lounge.

Fields:

id INTEGER PRIMARY KEY
categoria_id INTEGER REFERENCES categoria(id)
descricao TEXT NOT NULL
estoque INTEGER DEFAULT 0
valor REAL NOT NULL
movimenta_estoque BOOLEAN DEFAULT true

---

## venda

Sales made to customers.

Fields:

id INTEGER PRIMARY KEY
cliente_id INTEGER REFERENCES clientes(id)
valor_total REAL NOT NULL
valor_pago REAL DEFAULT 0
pago BOOLEAN DEFAULT false
data DATETIME DEFAULT CURRENT_TIMESTAMP

---

## venda_item

Products inside a sale.

Fields:

id INTEGER PRIMARY KEY
venda_id INTEGER REFERENCES venda(id)
produto_id INTEGER REFERENCES produto(id)
valor_unitario REAL
valor_total REAL
quantidade INTEGER

---

## uso_interno

Products consumed internally by the lounge.

Fields:

id INTEGER PRIMARY KEY
valor_total REAL
data DATETIME DEFAULT CURRENT_TIMESTAMP

---

## uso_interno_item

Products used internally.

Fields:

id INTEGER PRIMARY KEY
uso_interno_id INTEGER REFERENCES uso_interno(id)
produto_id INTEGER REFERENCES produto(id)
valor_unitario REAL
valor_total REAL
quantidade INTEGER

---

## contas_pagar

Expenses that must be paid.

Fields:

id INTEGER PRIMARY KEY
data_cadastro DATETIME
data_vencimento DATETIME
valor REAL
descricao TEXT

---

## contas_receber

Money expected from sales.

Fields:

id INTEGER PRIMARY KEY
venda_id INTEGER REFERENCES venda(id)
data_cadastro DATETIME
data_vencimento DATETIME
valor REAL
descricao TEXT
pago BOOLEAN DEFAULT false

---

# 4. Business Rules

## Sales

When a sale is created the system must:

1. create a record in `venda`
2. create records in `venda_item`
3. calculate `valor_total`
4. update product stock if necessary
5. create record in `contas_receber`

---

## Accounts Receivable Logic

Every sale generates a record in `contas_receber`.

Rules:

If

valor_pago >= valor_total

Then

pago = true

Else

pago = false

---

## Stock Movement

Stock must only change when:

produto.movimenta_estoque = true

Stock update rule:

estoque = estoque - quantidade

---

## Internal Use

Internal consumption behaves like a sale but:

* does not generate accounts receivable
* only decreases stock

---

## Credit Sale

A sale can be made without full payment only if:

cliente.permite_venda_prazo = true

---

# 5. Core Application Screens

## Login

Fields:

* username
* password

Authentication against `users` table.

---

## Dashboard

Display:

* sales of the day
* pending accounts receivable
* upcoming accounts payable
* low stock products

---

## Clients

CRUD operations.

Features:

create client
edit client
enable/disable client
allow credit purchase

---

## Categories

Simple CRUD.

---

## Products

CRUD operations.

Fields:

* category
* description
* price
* stock
* stock movement toggle

---

## Sales

Workflow:

1 select client
2 add products
3 choose quantity
4 calculate total
5 register payment

System must automatically:

* generate sale items
* update stock
* generate accounts receivable

---

## Internal Use

Record products used internally.

Example:

* staff consumption
* lounge internal usage

---

## Accounts Payable

Manual financial entries.

Features:

create expense
edit expense
delete expense

---

## Accounts Receivable

Generated automatically from sales.

Features:

view pending payments
mark payment as received
list receivables

---

# 6. Project Structure

src/

database/
schema/
migrations/

services/
saleService.ts
stockService.ts
financeService.ts

repositories/

ui/
components/
pages/

features/
clients/
products/
sales/
finance/

---

# 7. Services Responsibilities

## saleService

Responsible for:

creating sales
creating sale items
calculating totals
updating stock
generating accounts receivable

---

## stockService

Responsible for:

stock increase
stock decrease
internal usage stock updates

---

## financeService

Responsible for:

accounts payable
accounts receivable
payment updates

---

# 8. Future Improvements

sales reports
financial reports
inventory reports
receipt printing
CSV export
cash register control

---
