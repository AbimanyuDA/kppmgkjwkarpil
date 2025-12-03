package handlers

import (
	"gkjw-finance-backend/config"
	"gkjw-finance-backend/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func GetReports(c *gin.Context) {
	var transactions []models.Transaction
	
	query := config.DB.Preload("CreatedByUser").Where("status = ?", "approved")

	// Filter by date range
	if startDate := c.Query("startDate"); startDate != "" {
		query = query.Where("date >= ?", startDate)
	}
	if endDate := c.Query("endDate"); endDate != "" {
		query = query.Where("date <= ?", endDate)
	}

	// Filter by type
	if txType := c.Query("type"); txType != "" {
		query = query.Where("type = ?", txType)
	}

	// Filter by category
	if category := c.Query("category"); category != "" {
		query = query.Where("category = ?", category)
	}

	query = query.Order("date DESC")

	if err := query.Find(&transactions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch transactions"})
		return
	}

	// Calculate summary
	var totalIncome, totalExpense float64
	for _, t := range transactions {
		if t.Type == "income" {
			totalIncome += t.Amount
		} else {
			totalExpense += t.Amount
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"data": transactions,
		"summary": gin.H{
			"totalIncome":  totalIncome,
			"totalExpense": totalExpense,
			"balance":      totalIncome - totalExpense,
			"count":        len(transactions),
		},
	})
}

func ExportPDF(c *gin.Context) {
	// This is a placeholder - you'll need to implement PDF generation
	// using a library like gofpdf or similar
	c.JSON(http.StatusNotImplemented, gin.H{
		"message": "PDF export feature - implement with gofpdf library",
		"hint":    "Install: go get github.com/jung-kurt/gofpdf",
	})
}

func ExportExcel(c *gin.Context) {
	// This is a placeholder - you'll need to implement Excel generation
	// using a library like excelize
	c.JSON(http.StatusNotImplemented, gin.H{
		"message": "Excel export feature - implement with excelize library",
		"hint":    "Install: go get github.com/xuri/excelize/v2",
	})
}

func UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file provided"})
		return
	}

	// Generate unique filename
	filename := time.Now().Format("20060102150405") + "_" + file.Filename
	
	// Save file to uploads directory
	uploadPath := "./uploads/" + filename
	if err := c.SaveUploadedFile(file, uploadPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	// In production, you should upload to Firebase Storage or S3
	// and return the public URL
	fileURL := "/uploads/" + filename

	c.JSON(http.StatusOK, gin.H{
		"message": "File uploaded successfully",
		"data": gin.H{
			"url":      fileURL,
			"filename": filename,
		},
	})
}
