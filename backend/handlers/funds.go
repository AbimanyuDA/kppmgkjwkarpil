package handlers

import (
	"gkjw-finance-backend/config"
	"gkjw-finance-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CreateFundRequest struct {
    Name        string `json:"name" binding:"required"`
    Description string `json:"description"`
}

type UpdateFundRequest struct {
    Name        string `json:"name" binding:"required"`
    Description string `json:"description"`
    Status      string `json:"status" binding:"required,oneof=active archived"`
}

func GetFunds(c *gin.Context) {
    var funds []models.Fund
    if err := config.DB.Order("name asc").Find(&funds).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch funds"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"data": funds})
}

func CreateFund(c *gin.Context) {
    var req CreateFundRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    fund := models.Fund{
        Name:        req.Name,
        Description: req.Description,
        Status:      "active",
    }

    if err := config.DB.Create(&fund).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create fund"})
        return
    }

    c.JSON(http.StatusCreated, gin.H{"data": fund})
}

func UpdateFund(c *gin.Context) {
    id := c.Param("id")
    var fund models.Fund
    if err := config.DB.First(&fund, "id = ?", id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Fund not found"})
        return
    }

    var req UpdateFundRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    fund.Name = req.Name
    fund.Description = req.Description
    fund.Status = req.Status

    if err := config.DB.Save(&fund).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update fund"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"data": fund})
}

func DeleteFund(c *gin.Context) {
    id := c.Param("id")
    parsed, err := uuid.Parse(id)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid fund id"})
        return
    }

    // Block deletion if there are transactions referencing this fund
    var count int64
    if err := config.DB.Model(&models.Transaction{}).Where("fund_id = ?", parsed).Count(&count).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check fund usage"})
        return
    }

    if count > 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Fund masih dipakai oleh transaksi", "count": count, "action": "Arsipkan saja atau pindahkan transaksi ke fund lain terlebih dahulu"})
        return
    }

    if err := config.DB.Delete(&models.Fund{}, "id = ?", parsed).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete fund"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Fund deleted"})
}
