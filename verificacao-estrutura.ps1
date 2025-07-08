# Script de Verificação - Windows PowerShell
# Execute: .\verificacao-estrutura.ps1

Write-Host "🔍 VERIFICANDO ESTRUTURA DO PROJETO" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Verificar pastas
$frontendExists = Test-Path "frontend"
$backendExists = Test-Path "backend"

if ($frontendExists -and $backendExists) {
    Write-Host "✅ Estrutura de pastas OK" -ForegroundColor Green
} else {
    Write-Host "❌ ERRO: Não encontrei as pastas frontend e backend" -ForegroundColor Red
    Write-Host "Execute este script na pasta raiz do projeto hr-mvp" -ForegroundColor Yellow
    
    # Criar pastas se não existirem
    if (-not $frontendExists) {
        Write-Host "Criando pasta frontend..." -ForegroundColor Yellow
        New-Item -ItemType Directory -Path "frontend" -Force | Out-Null
    }
    if (-not $backendExists) {
        Write-Host "Criando pasta backend..." -ForegroundColor Yellow
        New-Item -ItemType Directory -Path "backend" -Force | Out-Null
    }
}

# Verificar Node.js
Write-Host "`n🔍 Verificando dependências:" -ForegroundColor Cyan
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Node.js não encontrado" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Node.js não instalado" -ForegroundColor Red
}

# Verificar Python
try {
    $pythonVersion = python --version 2>$null
    if ($pythonVersion) {
        Write-Host "✅ $pythonVersion" -ForegroundColor Green
    } else {
        $python3Version = python3 --version 2>$null
        if ($python3Version) {
            Write-Host "✅ $python3Version" -ForegroundColor Green
        } else {
            Write-Host "❌ Python não encontrado" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "❌ Python não instalado" -ForegroundColor Red
}

# Verificar NPM
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "✅ NPM: v$npmVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ NPM não encontrado" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ NPM não instalado" -ForegroundColor Red
}

# Verificar PIP
try {
    $pipVersion = pip --version 2>$null
    if ($pipVersion) {
        Write-Host "✅ PIP instalado" -ForegroundColor Green
    } else {
        Write-Host "❌ PIP não encontrado" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ PIP não instalado" -ForegroundColor Red
}

# Verificar arquivos essenciais
Write-Host "`n📁 VERIFICANDO ARQUIVOS ESSENCIAIS:" -ForegroundColor Cyan

$files = @(
    "backend\app.py",
    "backend\requirements.txt", 
    "frontend\package.json",
    "frontend\src\App.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file (AUSENTE)" -ForegroundColor Red
    }
}

Write-Host "`n🔧 PRÓXIMO PASSO: Configure os arquivos de ambiente" -ForegroundColor Yellow
Write-Host "Execute os comandos do tutorial para criar os arquivos necessários" -ForegroundColor Yellow