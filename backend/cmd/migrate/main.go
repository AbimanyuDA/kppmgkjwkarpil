package main

import (
	"flag"
	"fmt"
	"gkjw-finance-backend/config"
	"gkjw-finance-backend/tools"
	"log"
	"os"

	"github.com/google/uuid"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file
	godotenv.Load()

	var csvFile string
	var importOnly bool

	flag.StringVar(&csvFile, "file", "", "Path to CSV file to import")
	flag.BoolVar(&importOnly, "import-only", false, "Skip database initialization, only import")
	flag.Parse()

	if csvFile == "" {
		fmt.Println("Usage: go run cmd/migrate/main.go -file=<path-to-csv>")
		fmt.Println("Options:")
		fmt.Println("  -file string       Path to CSV file (required)")
		fmt.Println("  -import-only       Skip database init, only import data")
		os.Exit(1)
	}

	// Check if file exists
	if _, err := os.Stat(csvFile); os.IsNotExist(err) {
		log.Fatalf("CSV file not found: %s", csvFile)
	}

	// Initialize database
	if !importOnly {
		fmt.Println("Initializing database...")
		config.InitDB()
		fmt.Println("Database initialized successfully")
	} else {
		config.InitDB()
	}

	// Get admin user (for created_by field)
	// Using a fixed UUID for the system admin
	adminUserID := uuid.MustParse("00000000-0000-0000-0000-000000000001")

	// Run import
	fmt.Printf("Starting import from: %s\n\n", csvFile)

	successCount, errorCount, err := tools.ImportTransactions(csvFile, adminUserID)
	if err != nil {
		log.Fatalf("Import failed: %v", err)
	}

	fmt.Printf("\n=== Import Complete ===\n")
	fmt.Printf("Success: %d\n", successCount)
	fmt.Printf("Errors:  %d\n", errorCount)
	fmt.Printf("Total:   %d\n", successCount+errorCount)

	if errorCount > 0 {
		os.Exit(1)
	}
}
