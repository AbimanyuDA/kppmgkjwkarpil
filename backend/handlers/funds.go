package handlers

import (
	"gkjw-finance-backend/config"
	"gkjw-finance-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetFunds mengambil semua dana
func GetFunds(c *gin.Context) {
	var funds []models.Fund
	result := config.DB.Find(&funds)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": funds})
}

// CreateFund membuat dana baru (Admin only)
func CreateFund(c *gin.Context) {
	var fund models.Fund
	if err := c.ShouldBindJSON(&fund); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set default status if not provided
	if fund.Status == "" {
		fund.Status = "active"
	}

	result := config.DB.Create(&fund)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusCreated, fund)
}

// UpdateFund memperbarui dana (Admin only)
func UpdateFund(c *gin.Context) {
	id := c.Param("id")
	var fund models.Fund

	if err := config.DB.First(&fund, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Fund not found"})
		return
	}

	if err := c.ShouldBindJSON(&fund); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	config.DB.Save(&fund)
	c.JSON(http.StatusOK, fund)
}

// DeleteFund menghapus dana (Admin only)
func DeleteFund(c *gin.Context) {
	id := c.Param("id")
	result := config.DB.Delete(&models.Fund{}, id)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Fund not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Fund deleted successfully"})
}
