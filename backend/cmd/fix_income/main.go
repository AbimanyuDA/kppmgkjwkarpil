package main

import (
	"fmt"
	"gkjw-finance-backend/config"
	"gkjw-finance-backend/models"
	"strings"

	"github.com/google/uuid"
)

func main() {
	config.InitDB()

	// Get first admin user
	var admin models.User
	config.DB.Where("role = ?", "admin").First(&admin)
	if admin.ID == uuid.Nil {
		fmt.Println("No admin user found")
		return
	}

	// Check current status
	var incomeCount, expenseCount int64
	config.DB.Model(&models.Transaction{}).Where("type = ?", "income").Count(&incomeCount)
	config.DB.Model(&models.Transaction{}).Where("type = ?", "expense").Count(&expenseCount)

	fmt.Printf("Current - Income: %d, Expense: %d\n\n", incomeCount, expenseCount)

	// List some transactions to understand the data
	var txs []models.Transaction
	config.DB.Limit(30).Order("date DESC").Find(&txs)

	fmt.Println("=== Sample Transactions ===")
	for i, tx := range txs {
		fmt.Printf("%d. Type: %s | Amount: %.0f | Category: %s | Desc: %s\n", 
			i+1, tx.Type, tx.Amount, tx.Category, tx.Description)
	}

	// Identify which ones should be income based on keywords
	incomeKeywords := []string{
		"sumbangan",
		"donasi",
		"setor",
		"masuk",
		"pemasukan",
		"usaha",
		"penjualan",
		"pigora",
		"sisa dana",
		"transfer hadiah",
		"pengembalian",
		"reimburse",
	}

	fmt.Println("\n=== Checking for Income Transactions ===")
	var shouldBeIncome []models.Transaction
	config.DB.Where("type = ?", "expense").Find(&shouldBeIncome)

	incomeCount = 0
	for _, tx := range shouldBeIncome {
		descLower := strings.ToLower(tx.Description)
		for _, keyword := range incomeKeywords {
			if strings.Contains(descLower, keyword) {
				fmt.Printf("Found income: %s (%.0f) - %s\n", tx.Description, tx.Amount, descLower)
				incomeCount++
				break
			}
		}
	}

	fmt.Printf("\nFound %d transactions that should be income\n", incomeCount)
}
