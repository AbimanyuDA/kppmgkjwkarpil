# Script untuk menjalankan Backend (Golang) dan Frontend (Next.js) bersamaan

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Starting GKJW Application..." -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Start Backend (Golang)
Write-Host "[1/2] Starting Backend (Golang)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host 'Backend Running on http://localhost:8080' -ForegroundColor Green; go run main.go"

# Wait 2 seconds
Start-Sleep -Seconds 2

# Start Frontend (Next.js)
Write-Host "[2/2] Starting Frontend (Next.js)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host 'Frontend Running on http://localhost:3000' -ForegroundColor Green; npm run dev"

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "Application Started!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host "Backend:  http://localhost:8080" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to stop both servers..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Stop all processes (optional cleanup)
Write-Host "Stopping servers..." -ForegroundColor Red
