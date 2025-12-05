package main

import (
	"fmt"
	"gkjw-finance-backend/config"
	"gkjw-finance-backend/models"
	"log"

	"github.com/joho/godotenv"
)

func main() {
	// Load .env
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	config.InitDB()

	var txnCount, fundCount int64
	config.DB.Model(&models.Transaction{}).Count(&txnCount)
	config.DB.Model(&models.Fund{}).Count(&fundCount)

	fmt.Printf("\n=== Database Summary ===\n")
	fmt.Printf("Total Transactions: %d\n", txnCount)
	fmt.Printf("Total Funds: %d\n\n", fundCount)

	// Show funds
	var funds []models.Fund
	config.DB.Find(&funds)
	fmt.Println("Funds:")
	for _, f := range funds {
		var count int64
		config.DB.Model(&models.Transaction{}).Where("fund_id = ?", f.ID).Count(&count)
		fmt.Printf("  - %s (%d transactions)\n", f.Name, count)
	}

	// Show sample transactions (first 5 and last 5)
	var txns []models.Transaction
	config.DB.Order("date asc").Limit(5).Find(&txns)
	
	fmt.Println("\nFirst 5 Transactions:")
	for _, t := range txns {
		fmt.Printf("  %s | %s | %.2f | %s | %s\n", 
			t.Date.Format("2006-01-02"), 
			t.EventName, 
			t.Amount, 
			t.Type,
			t.PaymentMethod)
	}

	config.DB.Order("date desc").Limit(5).Find(&txns)
	fmt.Println("\nLast 5 Transactions:")
	for _, t := range txns {
		fmt.Printf("  %s | %s | %.2f | %s | %s\n", 
			t.Date.Format("2006-01-02"), 
			t.EventName, 
			t.Amount, 
			t.Type,
			t.PaymentMethod)
	}

	// Check for any suspicious amounts (very small or very large)
	var suspicious []models.Transaction
	config.DB.Where("amount < 100 OR amount > 100000000").Find(&suspicious)
	
	if len(suspicious) > 0 {
		fmt.Printf("\n⚠️  Found %d transactions with unusual amounts:\n", len(suspicious))
		for _, t := range suspicious {
			fmt.Printf("  %s | %s | %.2f | %s\n", 
				t.Date.Format("2006-01-02"), 
				t.Description, 
				t.Amount,
				t.Type)
		}
	} else {
		fmt.Println("\n✓ All amounts look reasonable!")
	}

	// Calculate total balance
	var totalIncome, totalExpense float64
	config.DB.Model(&models.Transaction{}).Where("type = ?", "income").Select("COALESCE(SUM(amount), 0)").Scan(&totalIncome)
	config.DB.Model(&models.Transaction{}).Where("type = ?", "expense").Select("COALESCE(SUM(amount), 0)").Scan(&totalExpense)
	
	fmt.Printf("\n=== Financial Summary ===\n")
	fmt.Printf("Total Income:  Rp %.2f\n", totalIncome)
	fmt.Printf("Total Expense: Rp %.2f\n", totalExpense)
	fmt.Printf("Balance:       Rp %.2f\n", totalIncome - totalExpense)
}
