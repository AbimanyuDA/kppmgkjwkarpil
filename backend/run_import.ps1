# GKJW Finance - CSV Import Tool (PowerShell)
# Quick import script untuk Windows

# Path ke CSV file - edit sesuai lokasi Anda
$csvFile = "d:\Project\Website\GKJW\Referensi\0. Cashflow Utama KPPM GKJW Karangpilang - Main.csv"

# Set working directory ke backend folder
Set-Location (Split-Path $PSCommandPath -Parent)

Write-Host "=== GKJW Finance - CSV Import Tool ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "CSV File: $csvFile" -ForegroundColor Yellow
Write-Host "Starting import..." -ForegroundColor Green
Write-Host ""

# Run import with proper argument passing
& go run cmd/migrate/main.go -file="$csvFile"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Import completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Run 'go run main.go' to start the backend" -ForegroundColor White
    Write-Host "2. Check transactions in the web UI" -ForegroundColor White
    Write-Host "3. Verify fund balances and payment method split" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Import completed with errors" -ForegroundColor Red
    Write-Host "Review the error messages above and retry" -ForegroundColor Yellow
}
