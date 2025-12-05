#!/bin/bash
# Quick Import Script untuk CSV Cashflow

# Edit path berikut ke lokasi CSV file Anda
CSV_FILE="d:\Project\Website\GKJW\Referensi\0. Cashflow Utama KPPM GKJW Karangpilang - Main.csv"

# Pastikan sudah di folder backend
cd "$(dirname "$0")"

echo "=== GKJW Finance - CSV Import Tool ==="
echo ""
echo "CSV File: $CSV_FILE"
echo "Starting import..."
echo ""

# Run import dengan Go
go run cmd/migrate/main.go -file="$CSV_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Import completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Run 'go run main.go' to start the backend"
    echo "2. Check transactions in the web UI"
    echo "3. Verify fund balances and payment method split"
else
    echo ""
    echo "❌ Import completed with errors"
    echo "Review the error messages above and retry"
fi
