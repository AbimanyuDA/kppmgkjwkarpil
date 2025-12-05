package handlers

import (
	"gkjw-finance-backend/config"
	"gkjw-finance-backend/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CreateTransactionRequest struct {
	Type        string  `json:"type" binding:"required,oneof=income expense"`
	PaymentMethod string `json:"paymentMethod" binding:"omitempty,oneof=cash bank"`
	Amount      float64 `json:"amount" binding:"required,gt=0"`
	Category    string  `json:"category" binding:"required"`
	Description string  `json:"description"`
	EventName   string  `json:"eventName" binding:"required"`
	Date        string  `json:"date" binding:"required"`
	NoteURL     string  `json:"noteUrl"`
	FundID      string  `json:"fundId" binding:"required"`
}

type UpdateTransactionStatusRequest struct {
	Status          string `json:"status" binding:"required,oneof=approved rejected"`
	RejectionReason string `json:"rejectionReason"`
}

func GetTransactions(c *gin.Context) {
	var transactions []models.Transaction

	query := config.DB.Preload("CreatedByUser").Preload("Fund").Order("created_at DESC")

	// Filter by status
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	// Filter by type
	if txType := c.Query("type"); txType != "" {
		query = query.Where("type = ?", txType)
	}

	// Filter by payment method
	if pm := c.Query("paymentMethod"); pm != "" {
		query = query.Where("payment_method = ?", pm)
	}

	// Filter by date range
	if startDate := c.Query("startDate"); startDate != "" {
		query = query.Where("date >= ?", startDate)
	}
	if endDate := c.Query("endDate"); endDate != "" {
		query = query.Where("date <= ?", endDate)
	}

	// Filter by fund
	if fundID := c.Query("fundId"); fundID != "" {
		query = query.Where("fund_id = ?", fundID)
	}

	// For non-admin users, show only their own transactions
	userRole, _ := c.Get("userRole")
	userID, _ := c.Get("userId")
	if userRole != "admin" {
		query = query.Where("created_by = ?", userID)
	}

	if err := query.Find(&transactions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch transactions"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": transactions})
}

func GetTransactionByID(c *gin.Context) {
	id := c.Param("id")
	
	var transaction models.Transaction
	if err := config.DB.Preload("CreatedByUser").Preload("Fund").Where("id = ?", id).First(&transaction).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaction not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": transaction})
}

func CreateTransaction(c *gin.Context) {
	var req CreateTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("userId")
	userRole, _ := c.Get("userRole")

	// Parse date string to time.Time
	parsedDate, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
		return
	}

	parsedFund, err := uuid.Parse(req.FundID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid fundId"})
		return
	}

	paymentMethod := req.PaymentMethod
	if paymentMethod == "" {
		paymentMethod = "cash"
	}

	transaction := models.Transaction{
		FundID:      parsedFund,
		Type:        req.Type,
		PaymentMethod: paymentMethod,
		Amount:      req.Amount,
		Category:    req.Category,
		Description: req.Description,
		EventName:   req.EventName,
		Date:        parsedDate,
		CreatedBy:   userID.(uuid.UUID),
		NoteURL:     req.NoteURL,
		Status:      "pending",
	}

	// Auto-approve for income transactions created by admin
	if req.Type == "income" && userRole == "admin" {
		transaction.Status = "approved"
	}

	if err := config.DB.Create(&transaction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create transaction"})
		return
	}

	// Log activity
	logActivity(userID.(uuid.UUID), "Created transaction: "+req.EventName)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Transaction created successfully",
		"data":    transaction,
	})
}

func UpdateTransaction(c *gin.Context) {
	id := c.Param("id")
	
	var transaction models.Transaction
	if err := config.DB.Where("id = ?", id).First(&transaction).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaction not found"})
		return
	}

	var req CreateTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse date string to time.Time
	parsedDate, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
		return
	}

	parsedFund, err := uuid.Parse(req.FundID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid fundId"})
		return
	}

	paymentMethod := req.PaymentMethod
	if paymentMethod == "" {
		paymentMethod = transaction.PaymentMethod
		if paymentMethod == "" {
			paymentMethod = "cash"
		}
	}

	transaction.FundID = parsedFund
	transaction.Type = req.Type
	transaction.PaymentMethod = paymentMethod
	transaction.Amount = req.Amount
	transaction.Category = req.Category
	transaction.Description = req.Description
	transaction.EventName = req.EventName
	transaction.Date = parsedDate
	transaction.NoteURL = req.NoteURL

	if err := config.DB.Save(&transaction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update transaction"})
		return
	}

	userID, _ := c.Get("userId")
	logActivity(userID.(uuid.UUID), "Updated transaction: "+transaction.EventName)

	c.JSON(http.StatusOK, gin.H{
		"message": "Transaction updated successfully",
		"data":    transaction,
	})
}

func UpdateTransactionStatus(c *gin.Context) {
	id := c.Param("id")
	
	var transaction models.Transaction
	if err := config.DB.Where("id = ?", id).First(&transaction).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaction not found"})
		return
	}

	var req UpdateTransactionStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	transaction.Status = req.Status
	if req.Status == "rejected" {
		transaction.RejectionReason = req.RejectionReason
	}

	if err := config.DB.Save(&transaction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update transaction status"})
		return
	}

	userID, _ := c.Get("userId")
	logActivity(userID.(uuid.UUID), "Updated transaction status to "+req.Status+": "+transaction.EventName)

	c.JSON(http.StatusOK, gin.H{
		"message": "Transaction status updated successfully",
		"data":    transaction,
	})
}

func DeleteTransaction(c *gin.Context) {
	id := c.Param("id")
	
	var transaction models.Transaction
	if err := config.DB.Where("id = ?", id).First(&transaction).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaction not found"})
		return
	}

	if err := config.DB.Delete(&transaction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete transaction"})
		return
	}

	userID, _ := c.Get("userId")
	logActivity(userID.(uuid.UUID), "Deleted transaction: "+transaction.EventName)

	c.JSON(http.StatusOK, gin.H{"message": "Transaction deleted successfully"})
}
