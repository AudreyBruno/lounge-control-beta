# 🍹 Lounge Control

Sistema de gerenciamento para bares e lounges, construído com **Tauri 2**, **React 19**, **TypeScript** e **SQLite**.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter as seguintes ferramentas instaladas:

### Ferramentas obrigatórias

| Ferramenta | Versão mínima | Link |
|---|---|---|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| pnpm | 8+ | `npm install -g pnpm` |
| Rust | stable | [rustup.rs](https://rustup.rs) |

### Dependências do sistema (Linux)

```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  libappindicator3-dev \
  librsvg2-dev \
  patchelf \
  libssl-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev
```

### Dependências do sistema (macOS)

```bash
xcode-select --install
```

### Dependências do sistema (Windows)

- Instale o [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) com as ferramentas de desenvolvimento C++.
- Instale o [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (geralmente já está presente no Windows 10/11).

---

## 🚀 Executando em modo de desenvolvimento

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd lounge-control
```

### 2. Instale as dependências do frontend

```bash
pnpm install
```

### 3. Inicie o servidor de desenvolvimento

```bash
pnpm tauri dev
```

Isso irá:
1. Iniciar o servidor Vite em `http://localhost:1420`
2. Compilar o backend Rust
3. Abrir a janela do aplicativo com hot-reload ativo

> **Nota:** Na primeira execução, a compilação do Rust pode levar alguns minutos. As compilações subsequentes serão muito mais rápidas.

---

## 🏗️ Compilando para produção

### Compilar para a plataforma atual

```bash
pnpm tauri build
```

O instalador/executável gerado ficará em:

```
src-tauri/target/release/bundle/
```

---

### 📦 Saída por plataforma

#### Linux

```bash
pnpm tauri build
```

Arquivos gerados em `src-tauri/target/release/bundle/`:
- `.deb` — pacote Debian/Ubuntu
- `.rpm` — pacote Fedora/Red Hat (requer `rpm-build`)
- `.AppImage` — executável portátil (roda em qualquer distro)

#### macOS

```bash
pnpm tauri build
```

Arquivos gerados em `src-tauri/target/release/bundle/`:
- `.app` — aplicativo macOS
- `.dmg` — imagem de disco para distribuição

> **Nota:** Para compilar para macOS você precisa estar em um Mac. A compilação cruzada não é suportada oficialmente pelo Tauri.

#### Windows

```bash
pnpm tauri build
```

Arquivos gerados em `src-tauri/target/release/bundle/`:
- `.exe` (NSIS) — instalador tradicional
- `.msi` — instalador MSI

> **Nota:** Para gerar o `.msi`, o WiX Toolset precisa estar instalado. O Tauri CLI tentará baixá-lo automaticamente se não for encontrado.

---

## 🗄️ Banco de dados

O aplicativo utiliza **SQLite** via `tauri-plugin-sql`. O arquivo de banco de dados (`lounge.db`) é criado automaticamente na primeira execução, no diretório de dados do aplicativo do sistema operacional:

| SO | Localização |
|---|---|
| Linux | `~/.local/share/lounge-control/` |
| macOS | `~/Library/Application Support/lounge-control/` |
| Windows | `C:\Users\<usuário>\AppData\Roaming\lounge-control\` |

---

## 🛠️ Scripts disponíveis

| Comando | Descrição |
|---|---|
| `pnpm dev` | Inicia apenas o servidor Vite (frontend) |
| `pnpm build` | Compila o frontend para produção |
| `pnpm tauri dev` | Inicia o app completo em modo desenvolvimento |
| `pnpm tauri build` | Gera o executável/instalador para produção |

---

## 🧰 Stack tecnológica

- **Frontend:** React 19, TypeScript, Vite, React Router, Zustand
- **Backend/Desktop:** Tauri 2, Rust
- **Banco de dados:** SQLite (`tauri-plugin-sql`)
- **Autenticação:** bcryptjs

---

## 📁 Estrutura do projeto

```
lounge-control/
├── src/                  # Código frontend (React/TypeScript)
│   ├── database/         # Conexão e configuração do banco
│   ├── repositories/     # Camada de acesso a dados
│   └── ...
├── src-tauri/            # Código backend (Rust/Tauri)
│   ├── src/              # Código Rust
│   ├── icons/            # Ícones do aplicativo
│   ├── capabilities/     # Permissões do Tauri
│   └── tauri.conf.json   # Configuração do Tauri
├── public/               # Assets estáticos
├── index.html            # Ponto de entrada HTML
└── package.json
```
