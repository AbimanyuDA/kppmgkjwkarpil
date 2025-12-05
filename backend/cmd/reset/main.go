package main

import (
	"fmt"
	"gkjw-finance-backend/config"
	"gkjw-finance-backend/models"
	"log"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	// Load .env
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Initialize database
	config.InitDB()

	fmt.Println("⚠️  WARNING: This will DELETE ALL data from transactions and funds tables!")
	fmt.Print("Type 'YES' to confirm: ")
	
	var confirmation string
	fmt.Scanln(&confirmation)
	
	if confirmation != "YES" {
		fmt.Println("Reset cancelled.")
		os.Exit(0)
	}

	// Delete all transactions
	if err := config.DB.Exec("DELETE FROM transactions").Error; err != nil {
		log.Fatalf("Failed to delete transactions: %v", err)
	}
	fmt.Println("✓ Deleted all transactions")

	// Delete all funds
	if err := config.DB.Exec("DELETE FROM funds").Error; err != nil {
		log.Fatalf("Failed to delete funds: %v", err)
	}
	fmt.Println("✓ Deleted all funds")

	// Reset sequences if using PostgreSQL
	config.DB.Exec("ALTER SEQUENCE transactions_id_seq RESTART WITH 1")
	config.DB.Exec("ALTER SEQUENCE funds_id_seq RESTART WITH 1")

	// Verify counts
	var txCount, fundCount int64
	config.DB.Model(&models.Transaction{}).Count(&txCount)
	config.DB.Model(&models.Fund{}).Count(&fundCount)

	fmt.Printf("\n=== Database Reset Complete ===\n")
	fmt.Printf("Transactions: %d\n", txCount)
	fmt.Printf("Funds: %d\n", fundCount)
	fmt.Println("\nReady for fresh import!")
}
