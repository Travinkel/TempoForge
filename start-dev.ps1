# start-dev.ps1
# Run TempoForge API + client for local development

Write-Host "=== TempoForge Dev Environment ===" -ForegroundColor Cyan

# Paths
$apiPath = "server/TempoForge.Api/TempoForge.Api.csproj"
$clientPath = "client/tempoforge-web"

# Start API in background
Write-Host "Starting API..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "dotnet run --project $apiPath" -WorkingDirectory (Get-Location)

# Start client in background
Write-Host "Starting client..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WorkingDirectory "$clientPath"

Write-Host "`nAPI will run on http://localhost:5000"
Write-Host "Client will run on http://localhost:5173`n" -ForegroundColor Cyan
