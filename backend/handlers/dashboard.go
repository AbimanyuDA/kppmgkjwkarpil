package handlers

import (
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

	// Get total expense for the month
	var totalExpense float64
	config.DB.Model(&models.Transaction{}).
		Where("type = ? AND status = ? AND date >= ?", "expense", "approved", startOfMonth).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&totalExpense)

	// Get expense by category
	type CategorySum struct {
		Category string
		Amount   float64
	}

	var categorySums []CategorySum
	config.DB.Model(&models.Transaction{}).
		Select("category, COALESCE(SUM(amount), 0) as amount").
		Where("type = ? AND status = ? AND date >= ?", "expense", "approved", startOfMonth).
		Group("category").
		Scan(&categorySums)

	// Calculate percentages
	for _, cs := range categorySums {
		percentage := 0.0
		if totalExpense > 0 {
			percentage = (cs.Amount / totalExpense) * 100
		}

		categoryData = append(categoryData, CategoryData{
			Category:   cs.Category,
			Amount:     cs.Amount,
			Percentage: percentage,
		})
	}

	c.JSON(http.StatusOK, gin.H{"data": categoryData})
}
