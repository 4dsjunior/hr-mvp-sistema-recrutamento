# setup.ps1 - Script para configurar o ambiente HR MVP
Write-Host "🚀 Configurando o projeto HR MVP..." -ForegroundColor Green

# Verificar se estamos no diretório correto
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "❌ Execute este script na raiz do projeto hr-mvp" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Configurando Backend..." -ForegroundColor Yellow

# Entrar no diretório backend
Set-Location backend

# Verificar se Python está instalado
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python encontrado: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python não encontrado. Instale Python 3.9+ primeiro." -ForegroundColor Red
    exit 1
}

# Remover ambiente virtual problemático se existir
if (Test-Path "venv") {
    Write-Host "🗑️ Removendo ambiente virtual problemático..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force venv
}

# Criar novo ambiente virtual
Write-Host "📦 Criando novo ambiente virtual..." -ForegroundColor Yellow
python -m venv venv

# Ativar ambiente virtual
Write-Host "🔌 Ativando ambiente virtual..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"

# Atualizar pip
Write-Host "🔄 Atualizando pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# Instalar dependências
Write-Host "📚 Instalando dependências..." -ForegroundColor Yellow
pip install -r requirements.txt

# Criar arquivo .env se não existir
if (-not (Test-Path ".env")) {
    Write-Host "📝 Criando arquivo .env..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️ IMPORTANTE: Edite o arquivo backend/.env com suas credenciais do Supabase!" -ForegroundColor Red
}

# Voltar para raiz
Set-Location ..

Write-Host "📁 Configurando Frontend..." -ForegroundColor Yellow

# Entrar no diretório frontend
Set-Location frontend

# Verificar se Node.js está instalado
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Instale Node.js 18+ primeiro." -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Instalar dependências do frontend
Write-Host "📚 Instalando dependências do frontend..." -ForegroundColor Yellow
npm install

# Criar arquivo .env.local se não existir
if (-not (Test-Path ".env.local")) {
    Write-Host "📝 Criando arquivo .env.local..." -ForegroundColor Yellow
    Copy-Item ".env.local.example" ".env.local"
    Write-Host "⚠️ IMPORTANTE: Edite o arquivo frontend/.env.local com suas credenciais do Supabase!" -ForegroundColor Red
}

# Voltar para raiz
Set-Location ..

Write-Host ""
Write-Host "🎉 Configuração concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Configure o Supabase em https://supabase.com" -ForegroundColor White
Write-Host "2. Edite o arquivo backend/.env com suas credenciais" -ForegroundColor White
Write-Host "3. Edite o arquivo frontend/.env.local com suas credenciais" -ForegroundColor White
Write-Host "4. Execute: .\start.ps1" -ForegroundColor White
Write-Host ""
Write-Host "🔗 URLs importantes:" -ForegroundColor Yellow
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White