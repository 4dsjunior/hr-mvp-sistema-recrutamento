# start.ps1 - Script para iniciar o sistema HR MVP
Write-Host "🚀 Iniciando sistema HR MVP..." -ForegroundColor Green

# Verificar se os arquivos necessários existem
$requiredFiles = @(
    "backend\app.py",
    "backend\.env",
    "frontend\.env.local"
)

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Host "❌ Arquivo necessário não encontrado: $file" -ForegroundColor Red
        Write-Host "💡 Execute primeiro: .\setup.ps1" -ForegroundColor Yellow
        exit 1
    }
}

# Função para iniciar o backend
function Start-Backend {
    Write-Host "🐍 Iniciando Backend Flask..." -ForegroundColor Yellow
    Set-Location backend
    
    # Ativar ambiente virtual
    & "venv\Scripts\Activate.ps1"
    
    # Iniciar Flask
    python app.py
}

# Função para iniciar o frontend
function Start-Frontend {
    Write-Host "⚛️ Iniciando Frontend React..." -ForegroundColor Yellow
    Set-Location frontend
    
    # Iniciar Vite
    npm run dev
}

# Função para testar a API
function Test-API {
    Write-Host "🧪 Testando conexão com a API..." -ForegroundColor Yellow
    
    Start-Sleep -Seconds 2
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/test" -Method GET -TimeoutSec 5
        if ($response.status -eq "ok") {
            Write-Host "✅ API respondendo corretamente!" -ForegroundColor Green
            Write-Host "📊 Resposta: $($response.message)" -ForegroundColor White
        } else {
            Write-Host "⚠️ API respondeu, mas com status inesperado" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Erro ao conectar com a API" -ForegroundColor Red
        Write-Host "   Verifique se o backend está rodando em http://localhost:5000" -ForegroundColor White
    }
}

# Perguntar qual componente iniciar
Write-Host ""
Write-Host "Escolha uma opção:" -ForegroundColor Cyan
Write-Host "1. Iniciar apenas Backend (Flask)" -ForegroundColor White
Write-Host "2. Iniciar apenas Frontend (React)" -ForegroundColor White
Write-Host "3. Iniciar ambos (recomendado)" -ForegroundColor White
Write-Host "4. Testar API" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Digite sua escolha (1-4)"

switch ($choice) {
    "1" {
        Start-Backend
    }
    "2" {
        Start-Frontend
    }
    "3" {
        Write-Host "🚀 Iniciando ambos os serviços..." -ForegroundColor Green
        Write-Host "💡 Use Ctrl+C para parar os serviços" -ForegroundColor Yellow
        Write-Host ""
        
        # Iniciar backend em background
        $backendJob = Start-Job -ScriptBlock {
            Set-Location $using:PWD
            Set-Location backend
            & "venv\Scripts\Activate.ps1"
            python app.py
        }
        
        # Aguardar um pouco para o backend iniciar
        Start-Sleep -Seconds 3
        
        # Testar API
        Test-API
        
        # Iniciar frontend
        Start-Frontend
        
        # Limpar job quando sair
        Stop-Job $backendJob
        Remove-Job $backendJob
    }
    "4" {
        Test-API
    }
    default {
        Write-Host "❌ Opção inválida" -ForegroundColor Red
        exit 1
    }
}