package handlers

import (
	"fmt"
	"gkjw-finance-backend/config"
	"gkjw-finance-backend/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type DashboardStats struct {
	TotalIncome         float64 `json:"totalIncome"`
	TotalExpense        float64 `json:"totalExpense"`
	CurrentBalance      float64 `json:"currentBalance"`
	PendingTransactions int64   `json:"pendingTransactions"`
	MonthlyIncome       float64 `json:"monthlyIncome"`
	MonthlyExpense      float64 `json:"monthlyExpense"`
}

type MonthlyData struct {
	Month   string  `json:"month"`
	Income  float64 `json:"income"`
	Expense float64 `json:"expense"`
}

type CategoryData struct {
	Category   string  `json:"category"`
	Amount     float64 `json:"amount"`
	Percentage float64 `json:"percentage"`
}

func GetDashboardStats(c *gin.Context) {
	var stats DashboardStats

	// Total income (approved only)
	config.DB.Model(&models.Transaction{}).
		Where("type = ? AND status = ?", "income", "approved").
		Select("COALESCE(SUM(amount), 0)").
		Scan(&stats.TotalIncome)

	// Total expense (approved only)
	config.DB.Model(&models.Transaction{}).
		Where("type = ? AND status = ?", "expense", "approved").
		Select("COALESCE(SUM(amount), 0)").
		Scan(&stats.TotalExpense)

	// Current balance
	stats.CurrentBalance = stats.TotalIncome - stats.TotalExpense

	// Pending transactions count
	config.DB.Model(&models.Transaction{}).
		Where("status = ?", "pending").
		Count(&stats.PendingTransactions)

	// Monthly income (current month)
	startOfMonth := time.Now().AddDate(0, 0, -time.Now().Day()+1)
	config.DB.Model(&models.Transaction{}).
		Where("type = ? AND status = ? AND date >= ?", "income", "approved", startOfMonth).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&stats.MonthlyIncome)

	// Monthly expense (current month)
	config.DB.Model(&models.Transaction{}).
		Where("type = ? AND status = ? AND date >= ?", "expense", "approved", startOfMonth).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&stats.MonthlyExpense)

	c.JSON(http.StatusOK, gin.H{"data": stats})
}

func GetMonthlyData(c *gin.Context) {
	var monthlyData []MonthlyData

	// Get last 6 months data
	for i := 5; i >= 0; i-- {
		month := time.Now().AddDate(0, -i, 0)
		monthStart := time.Date(month.Year(), month.Month(), 1, 0, 0, 0, 0, time.UTC)
		monthEnd := monthStart.AddDate(0, 1, -1)

		var income, expense float64

		config.DB.Model(&models.Transaction{}).
			Where("type = ? AND status = ? AND date >= ? AND date <= ?", 
				"income", "approved", monthStart, monthEnd).
			Select("COALESCE(SUM(amount), 0)").
			Scan(&income)

		config.DB.Model(&models.Transaction{}).
			Where("type = ? AND status = ? AND date >= ? AND date <= ?", 
				"expense", "approved", monthStart, monthEnd).
			Select("COALESCE(SUM(amount), 0)").
			Scan(&expense)

		monthlyData = append(monthlyData, MonthlyData{
			Month:   month.Format("Jan 2006"),
			Income:  income,
			Expense: expense,
		})
	}

	c.JSON(http.StatusOK, gin.H{"data": monthlyData})
}

func GetCategoryData(c *gin.Context) {
	var categoryData []CategoryData

	// Get current month start
	startOfMonth := time.Now().AddDate(0, 0, -time.Now().Day()+1)

	// Get type from query parameter (default: expense)
	transactionType := c.DefaultQuery("type", "expense")

	// Debug log - print what we're querying
	fmt.Printf("=== GetCategoryData Debug ===\n")
	fmt.Printf("Type requested: %s\n", transactionType)
	fmt.Printf("Start of month: %s\n", startOfMonth.Format("2006-01-02"))

	// Check total count by type
	var totalIncomeCount, totalExpenseCount int64
	config.DB.Model(&models.Transaction{}).Where("status = ?", "approved").Where("type = ?", "income").Count(&totalIncomeCount)
	config.DB.Model(&models.Transaction{}).Where("status = ?", "approved").Where("type = ?", "expense").Count(&totalExpenseCount)
	fmt.Printf("Total approved income count: %d\n", totalIncomeCount)
	fmt.Printf("Total approved expense count: %d\n", totalExpenseCount)

	// Get total for the month
	var totalAmount float64
	config.DB.Model(&models.Transaction{}).
		Where("type = ? AND status = ? AND date >= ?", transactionType, "approved", startOfMonth).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&totalAmount)

	fmt.Printf("Total %s amount this month: %f\n", transactionType, totalAmount)

	// Get by category
	type CategorySum struct {
		Category string
		Amount   float64
	}

	var categorySums []CategorySum
	config.DB.Model(&models.Transaction{}).
		Select("category, COALESCE(SUM(amount), 0) as amount").
		Where("type = ? AND status = ? AND date >= ?", transactionType, "approved", startOfMonth).
		Group("category").
		Scan(&categorySums)

	fmt.Printf("Found %d categories for %s\n", len(categorySums), transactionType)

	// Calculate percentages
	for _, cs := range categorySums {
		percentage := 0.0
		if totalAmount > 0 {
			percentage = (cs.Amount / totalAmount) * 100
		}

		fmt.Printf("  Category: %s, Amount: %f, Percentage: %f%%\n", cs.Category, cs.Amount, percentage)

		categoryData = append(categoryData, CategoryData{
			Category:   cs.Category,
			Amount:     cs.Amount,
			Percentage: percentage,
		})
	}

	c.JSON(http.StatusOK, gin.H{"data": categoryData})
}
