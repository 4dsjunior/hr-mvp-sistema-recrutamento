# 🚀 HR MVP - Sistema de Recrutamento e Seleção

Sistema completo de gestão de recrutamento e seleção para empresas de RH terceirizado.

## 📋 Sobre o Projeto

MVP desenvolvido seguindo roadmap de 16 semanas com foco em aprendizado progressivo.

### 🛠️ Stack Tecnológico

- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **Backend:** Python Flask + Blueprint Pattern
- **Banco de Dados:** Supabase (PostgreSQL)
- **Autenticação:** Supabase Auth
- **Automações:** n8n Cloud (próxima fase)
- **Deploy:** VPS próprio

### 🎯 Funcionalidades (Roadmap)

#### ✅ Concluído - Semana 1-2
- [x] Configuração do ambiente de desenvolvimento
- [x] Setup Supabase com tabelas e RLS
- [x] Backend Flask com estrutura Blueprint
- [x] Frontend React com template Falcon
- [x] Integração básica Flask + React + Supabase
- [x] Sistema de autenticação básico

#### 🚧 Em Desenvolvimento - Semana 3-4
- [ ] CRUD completo de candidatos
- [ ] Interface responsiva para gestão
- [ ] Validações e feedback visual
- [ ] Testes de todas operações

#### 📅 Próximas Fases
- Gestão de vagas
- Sistema de candidaturas
- Pipeline visual (Kanban)
- Dashboard com métricas
- Relatórios e analytics

### 🏗️ Estrutura do Projeto
hr-mvp/
├── backend/                 # API Flask
│   ├── app/
│   │   ├── init.py     # Application factory
│   │   └── routes.py       # Endpoints da API
│   ├── venv/               # Ambiente virtual Python
│   └── .env                # Variáveis de ambiente
├── frontend/               # React App
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas principais
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Configurações (Supabase)
│   └── .env.local          # Variáveis de ambiente
└── README.md
## 🚀 Como Executar

### Pré-requisitos
- Node.js 20+
- Python 3.9+
- Conta no Supabase

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install flask flask-cors supabase python-dotenv
python -c "from app import create_app; app = create_app(); app.run(debug=True)"


Frontend
cd frontend
npm install
npm run dev

Configuração

Criar projeto no Supabase
Executar SQL das tabelas (ver documentação)
Configurar variáveis de ambiente nos arquivos .env

📊 Progresso do Desenvolvimento

Início: 11/07/2025
Duração: 16 semanas
Status Atual: Semana 2 - Setup Completo ✅
Próximo Milestone: CRUD Candidatos

🤝 Contribuição
Projeto desenvolvido como MVP educacional seguindo roadmap específico.
📝 Licença
Projeto privado - Uso educacional

⭐ Checkpoint Atual: Dia 5 - Integração e Testes Concluídos
### **PASSO 5: Fazer Primeiro Commit**

```powershell
# Verificar status atual
git status

# Adicionar todos os arquivos (exceto os ignorados)
git add .

# Verificar o que será commitado
git status

# Fazer primeiro commit
git commit -m "🎉 Initial commit - Setup completo MVP HR

✅ Implementado:
- Estrutura do projeto Flask + React
- Configuração Supabase com tabelas e RLS  
- Sistema de autenticação básico
- Integração frontend/backend funcionando
- Testes de conectividade passando

📍 Checkpoint: Dia 5 - Todos os testes passaram
🎯 Próximo: SEMANA 3-4 - CRUD de Candidatos"
```#   h r - m v p - s i s t e m a - r e c r u t a m e n t o  
 