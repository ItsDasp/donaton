# Donaton Local Management Script
# Script para gestionar los servicios localmente (sin Docker)

$ErrorActionPreference = "Stop"

# Cargar variables de entorno desde .env
function Load-EnvFile {
    $envFile = ".env"
    if (Test-Path $envFile) {
        Get-Content $envFile | ForEach-Object {
            if ($_ -match '^([^=]+)=(.*)$') {
                $name = $matches[1].Trim()
                $value = $matches[2].Trim()
                [Environment]::SetEnvironmentVariable($name, $value, "Process")
            }
        }
    }
}

# Cargar .env al inicio
Load-EnvFile

# Configuración de servicios
$services = @{
    "postgres" = @{
        Type = "external"
        Port = 5432
        HealthCheck = { Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue | Select-Object -ExpandProperty TcpTestSucceeded }
    }
    "auth" = @{
        Type = "spring"
        Path = "microservicios/auth"
        Port = 8081
        Command = ".\mvnw.cmd spring-boot:run"
    }
    "donation" = @{
        Type = "spring"
        Path = "microservicios/donation"
        Port = 8082
        Command = ".\mvnw.cmd spring-boot:run"
    }
    "logistics" = @{
        Type = "spring"
        Path = "microservicios/logistics"
        Port = 8083
        Command = ".\mvnw.cmd spring-boot:run"
    }
    "needs" = @{
        Type = "spring"
        Path = "microservicios/needs"
        Port = 8084
        Command = ".\mvnw.cmd spring-boot:run"
    }
    "gateway" = @{
        Type = "spring"
        Path = "microservicios/gateway"
        Port = 8080
        Command = ".\mvnw.cmd spring-boot:run"
    }
    "bff" = @{
        Type = "spring"
        Path = "bff"
        Port = 8085
        Command = ".\mvnw.cmd spring-boot:run"
    }
    "frontend" = @{
        Type = "node"
        Path = "frontend"
        Port = 5173
        Command = "npm run dev"
    }
}

# Almacenar procesos activos
$activeProcesses = @{}

function Show-Menu {
    Clear-Host
    Write-Host "=== Donaton Local Management ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Iniciar todos los servicios"
    Write-Host "2. Detener todos los servicios"
    Write-Host "3. Reiniciar todos los servicios"
    Write-Host "4. Reiniciar solo microservicios (auth, donation, logistics, needs, gateway, bff)"
    Write-Host "5. Ver estado de los servicios"
    Write-Host "6. Ver logs de un servicio"
    Write-Host "7. Reiniciar un servicio específico"
    Write-Host "8. Iniciar servicio específico"
    Write-Host "9. Detener servicio específico"
    Write-Host "10. Salir"
    Write-Host ""
}

function Get-ServiceChoice {
    $serviceNames = $services.Keys | Sort-Object
    
    Write-Host "Selecciona un servicio:" -ForegroundColor Yellow
    for ($i = 0; $i -lt $serviceNames.Count; $i++) {
        $status = if ($activeProcesses.ContainsKey($serviceNames[$i])) { "[RUNNING]" } else { "[STOPPED]" }
        Write-Host "$($i + 1). $($serviceNames[$i]) $status"
    }
    
    $choice = Read-Host "Ingresa el número del servicio"
    if ($choice -match "^\d+$" -and $choice -ge 1 -and $choice -le $serviceNames.Count) {
        return $serviceNames[$choice - 1]
    }
    return $null
}

function Test-ExternalServices {
    Write-Host "Verificando servicios externos..." -ForegroundColor Yellow
    
    $postgresOk = $services["postgres"].HealthCheck.Invoke()
    
    if (-not $postgresOk) {
        Write-Host "❌ PostgreSQL no está ejecutándose en puerto 5432" -ForegroundColor Red
        Write-Host "   Inicia PostgreSQL localmente o usa Docker para postgres" -ForegroundColor Yellow
        return $false
    }
    
    Write-Host "✓ Servicios externos OK" -ForegroundColor Green
    return $true
}

function Start-Service {
    param($serviceName)
    
    if ($activeProcesses.ContainsKey($serviceName)) {
        Write-Host "$serviceName ya está ejecutándose" -ForegroundColor Yellow
        return
    }
    
    $service = $services[$serviceName]
    
    if ($service.Type -eq "external") {
        Write-Host "$serviceName es un servicio externo, no se puede iniciar desde aquí" -ForegroundColor Yellow
        return
    }
    
    $originalPath = Get-Location
    try {
        Set-Location $service.Path
        
        Write-Host "Iniciando $serviceName..." -ForegroundColor Cyan
        Write-Host "  AZURE_TENANT_ID: $env:AZURE_TENANT_ID" -ForegroundColor Gray
        Write-Host "  AZURE_CLIENT_ID: $env:AZURE_CLIENT_ID" -ForegroundColor Gray
        
        # Crear archivos de log
        $logFile = "$serviceName.log"
        $errorLogFile = "$serviceName-error.log"
        
        # Limpiar logs anteriores solo si no están en uso
        try {
            if (Test-Path $logFile) { Remove-Item $logFile -ErrorAction Stop }
        } catch {
            Write-Host "  (Archivo $logFile en uso, se anexará al existente)" -ForegroundColor Yellow
        }
        try {
            if (Test-Path $errorLogFile) { Remove-Item $errorLogFile -ErrorAction Stop }
        } catch {
            Write-Host "  (Archivo $errorLogFile en uso, se anexará al existente)" -ForegroundColor Yellow
        }
        
        if ($service.Type -eq "spring") {
            $cmdArgs = "/c", "set AZURE_TENANT_ID=$env:AZURE_TENANT_ID && set AZURE_CLIENT_ID=$env:AZURE_CLIENT_ID && $($service.Command) > $logFile 2> $errorLogFile"
            $process = Start-Process -FilePath "cmd" -ArgumentList $cmdArgs -PassThru -WindowStyle Normal
        } elseif ($service.Type -eq "node") {
            $cmdArgs = "/c", "set AZURE_TENANT_ID=$env:AZURE_TENANT_ID && set AZURE_CLIENT_ID=$env:AZURE_CLIENT_ID && $($service.Command) > $logFile 2> $errorLogFile"
            $process = Start-Process -FilePath "cmd" -ArgumentList $cmdArgs -PassThru -WindowStyle Normal
        }
        
        if ($process) {
            $activeProcesses[$serviceName] = $process
            Write-Host "✓ $serviceName iniciado (PID: $($process.Id))" -ForegroundColor Green
            Write-Host "  Logs: $logFile" -ForegroundColor Gray
            Write-Host "  Errores: $errorLogFile" -ForegroundColor Gray
        }
    } finally {
        Set-Location $originalPath
    }
}

function Stop-Service {
    param($serviceName)
    
    if (-not $activeProcesses.ContainsKey($serviceName)) {
        Write-Host "$serviceName no está ejecutándose" -ForegroundColor Yellow
        return
    }
    
    $process = $activeProcesses[$serviceName]
    
    try {
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        $activeProcesses.Remove($serviceName)
        Write-Host "✓ $serviceName detenido" -ForegroundColor Green
    } catch {
        Write-Host "Error al detener ${serviceName}: $_" -ForegroundColor Red
    }
}

function Start-AllServices {
    if (-not (Test-ExternalServices)) {
        Read-Host "Presiona Enter para continuar"
        return
    }
    
    # Iniciar en orden de dependencia
    $startOrder = @("auth", "donation", "logistics", "needs", "gateway", "bff", "frontend")
    
    foreach ($serviceName in $startOrder) {
        if ($services[$serviceName].Type -ne "external") {
            Start-Service $serviceName
            Start-Sleep -Seconds 3
        }
    }
    
    Write-Host ""
    Write-Host "Todos los servicios iniciados" -ForegroundColor Green
    Read-Host "Presiona Enter para continuar"
}

function Stop-AllServices {
    Write-Host "Deteniendo todos los servicios..." -ForegroundColor Yellow
    
    foreach ($serviceName in $activeProcesses.Keys.Clone()) {
        Stop-Service $serviceName
    }
    
    Write-Host "Todos los servicios detenidos" -ForegroundColor Green
    Read-Host "Presiona Enter para continuar"
}

function Restart-AllServices {
    Write-Host "Reiniciando todos los servicios..." -ForegroundColor Cyan
    foreach ($serviceName in $activeProcesses.Keys.Clone()) {
        Stop-Service $serviceName
    }
    Start-Sleep -Seconds 2
    Start-AllServices
}

function Restart-Microservices {
    Write-Host "Reiniciando solo microservicios..." -ForegroundColor Cyan
    
    $microservices = @("auth", "donation", "logistics", "needs", "gateway", "bff")
    
    foreach ($serviceName in $microservices) {
        if ($activeProcesses.ContainsKey($serviceName)) {
            Stop-Service $serviceName
        }
    }
    
    Start-Sleep -Seconds 2
    
    foreach ($serviceName in $microservices) {
        Start-Service $serviceName
        Start-Sleep -Seconds 2
    }
    
    Write-Host ""
    Write-Host "Microservicios reiniciados" -ForegroundColor Green
    Read-Host "Presiona Enter para continuar"
}

function Show-Status {
    Write-Host "Estado de los servicios:" -ForegroundColor Cyan
    Write-Host ""
    
    foreach ($serviceName in $services.Keys | Sort-Object) {
        $service = $services[$serviceName]
        
        if ($service.Type -eq "external") {
            $status = if ($service.HealthCheck.Invoke()) { "RUNNING" } else { "STOPPED" }
            $color = if ($service.HealthCheck.Invoke()) { "Green" } else { "Red" }
        } else {
            $status = if ($activeProcesses.ContainsKey($serviceName)) { "RUNNING" } else { "STOPPED" }
            $color = if ($activeProcesses.ContainsKey($serviceName)) { "Green" } else { "Red" }
        }
        
        Write-Host "$serviceName : " -NoNewline
        Write-Host $status -ForegroundColor $color
    }
    
    Write-Host ""
    Read-Host "Presiona Enter para continuar"
}

function View-Logs {
    $serviceName = Get-ServiceChoice
    if ($serviceName) {
        $service = $services[$serviceName]
        
        if ($service.Type -eq "external") {
            Write-Host "$serviceName es un servicio externo, revisa sus logs directamente" -ForegroundColor Yellow
            Read-Host "Presiona Enter para continuar"
            return
        }
        
        $logFile = "$serviceName.log"
        $errorLogFile = "$serviceName-error.log"
        
        Write-Host "Mostrando logs de $serviceName..." -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Gray
        
        # Mostrar contenido existente del log si existe
        if (Test-Path $logFile) {
            Write-Host "LOG FILE ($logFile):" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Gray
            Get-Content $logFile -Tail 100
        } else {
            Write-Host "No hay archivo de log para $serviceName" -ForegroundColor Yellow
        }
        
        # Mostrar contenido existente del error log si existe
        if (Test-Path $errorLogFile) {
            Write-Host "========================================" -ForegroundColor Red
            Write-Host "ERROR LOG ($errorLogFile):" -ForegroundColor Red
            Write-Host "========================================" -ForegroundColor Red
            Get-Content $errorLogFile -Tail 100
        } else {
            Write-Host "No hay archivo de error log para $serviceName" -ForegroundColor Gray
        }
        
        Write-Host "========================================" -ForegroundColor Gray
        Write-Host "Presiona Enter para continuar" -ForegroundColor Gray
        Read-Host
    } else {
        Write-Host "Selección inválida" -ForegroundColor Red
        Read-Host "Presiona Enter para continuar"
    }
}

function Restart-Service {
    $serviceName = Get-ServiceChoice
    if ($serviceName) {
        if ($services[$serviceName].Type -eq "external") {
            Write-Host "$serviceName es un servicio externo, no se puede reiniciar desde aquí" -ForegroundColor Yellow
            Read-Host "Presiona Enter para continuar"
            return
        }
        
        Stop-Service $serviceName
        Start-Sleep -Seconds 2
        Start-Service $serviceName
        Read-Host "Presiona Enter para continuar"
    } else {
        Write-Host "Selección inválida" -ForegroundColor Red
        Read-Host "Presiona Enter para continuar"
    }
}

# Main loop
do {
    Show-Menu
    $choice = Read-Host "Selecciona una opción"
    
    switch ($choice) {
        "1" { Start-AllServices }
        "2" { Stop-AllServices }
        "3" { Restart-AllServices }
        "4" { Restart-Microservices }
        "5" { Show-Status }
        "6" { View-Logs }
        "7" { Restart-Service }
        "8" { 
            $serviceName = Get-ServiceChoice
            if ($serviceName) { Start-Service $serviceName }
            Read-Host "Presiona Enter para continuar"
        }
        "9" { 
            $serviceName = Get-ServiceChoice
            if ($serviceName) { Stop-Service $serviceName }
            Read-Host "Presiona Enter para continuar"
        }
        "10" { 
            Write-Host "Saliendo..." -ForegroundColor Yellow
            # Detener todos los procesos al salir
            Stop-AllServices
            break 
        }
        default {
            Write-Host "Opción inválida" -ForegroundColor Red
            Read-Host "Presiona Enter para continuar"
        }
    }
} while ($choice -ne "8")
