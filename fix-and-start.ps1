# Smart Bazaar - Fix & Start Script
# This script handles common startup issues

Write-Host "=== Smart Bazaar Startup Fix ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill existing dotnet processes
Write-Host "[1/4] Stopping existing API instances..." -ForegroundColor Yellow
$dotnetProcesses = Get-Process -Name "dotnet" -ErrorAction SilentlyContinue
if ($dotnetProcesses) {
    $dotnetProcesses | ForEach-Object {
        Write-Host "  Stopping process: $($_.Id)" -ForegroundColor Gray
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
    Write-Host "  ✓ Cleaned up" -ForegroundColor Green
} else {
    Write-Host "  ✓ No existing processes" -ForegroundColor Green
}

# Step 2: Check Docker Desktop
Write-Host "[2/4] Checking Docker Desktop..." -ForegroundColor Yellow
$dockerProcess = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
if (-not $dockerProcess) {
    Write-Host "  ⚠ Docker Desktop is not running" -ForegroundColor Red
    Write-Host "  Starting Docker Desktop..." -ForegroundColor Yellow
    
    $dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerPath) {
        Start-Process $dockerPath
        Write-Host "  Waiting 20 seconds for Docker to start..." -ForegroundColor Gray
        Start-Sleep -Seconds 20
        Write-Host "  ✓ Docker Desktop started" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Docker Desktop not found at: $dockerPath" -ForegroundColor Red
        Write-Host "  Please install Docker Desktop or start it manually" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "  ✓ Docker Desktop is running" -ForegroundColor Green
}

# Step 3: Start Qdrant
Write-Host "[3/4] Starting Qdrant container..." -ForegroundColor Yellow
$qdrantExists = docker ps -a --filter "name=qdrant" --format "{{.Names}}" 2>$null
if ($qdrantExists -eq "qdrant") {
    Write-Host "  Container exists, starting..." -ForegroundColor Gray
    docker start qdrant 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Qdrant started" -ForegroundColor Green
    } else {
        Write-Host "  Removing old container..." -ForegroundColor Gray
        docker rm -f qdrant 2>$null
        docker run -d -p 6333:6333 -p 6334:6334 -v qdrant_storage:/qdrant/storage --name qdrant qdrant/qdrant:latest
        Write-Host "  ✓ Qdrant created and started" -ForegroundColor Green
    }
} else {
    Write-Host "  Creating new Qdrant container..." -ForegroundColor Gray
    docker run -d -p 6333:6333 -p 6334:6334 -v qdrant_storage:/qdrant/storage --name qdrant qdrant/qdrant:latest
    Write-Host "  ✓ Qdrant created and started" -ForegroundColor Green
}

Write-Host "  Waiting 3 seconds for Qdrant to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 3

# Verify Qdrant is running
$qdrantRunning = docker ps --filter "name=qdrant" --format "{{.Names}}" 2>$null
if ($qdrantRunning -eq "qdrant") {
    Write-Host "  ✓ Qdrant is running on http://localhost:6333" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Qdrant may not be running properly" -ForegroundColor Yellow
}

# Step 4: Start the API
Write-Host "[4/4] Starting SmartBazaar API..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "SmartBazaar.API"
cd $backendPath

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✓ Ready! Starting API now..." -ForegroundColor Green
Write-Host "API will run on: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Qdrant Dashboard: http://localhost:6333/dashboard" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

dotnet run --urls "http://localhost:5000"
