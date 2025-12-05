package handlers

import (
	"net/http"
	"strings"

	"gkjw-finance-backend/config"
	"gkjw-finance-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CategoryRequest struct {
	Type string `json:"type" binding:"omitempty,oneof=income expense general"`
	Name string `json:"name" binding:"required,min=2"`
}

// GetCategories returns categories, optionally filtered by type.
func GetCategories(c *gin.Context) {
	if err := syncCategoriesFromTransactions(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to sync categories"})
		return
	}

	var categories []models.Category

	query := config.DB.Model(&models.Category{})
	if typ := c.Query("type"); typ != "" {
		query = query.Where("type = ?", typ)
	}

	if err := query.Order("name asc").Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": categories})
}

// CreateCategory adds a new category (admin-only via routes middleware).
func CreateCategory(c *gin.Context) {
	var req CategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	name := strings.TrimSpace(req.Name)
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nama kategori tidak boleh kosong"})
		return
	}

	typ := strings.TrimSpace(req.Type)
	if typ == "" {
		typ = "general"
	}

	if !isValidCategoryType(typ) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tipe kategori tidak valid"})
		return
	}

	// Uniqueness check (case-insensitive) per type
	var existing models.Category
	if err := config.DB.Where("LOWER(name) = LOWER(?)", name).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Kategori sudah ada"})
		return
	}

	category := models.Category{
		Type: typ,
		Name: name,
	}

	if err := config.DB.Create(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat kategori"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": category})
}

// UpdateCategory updates category name/type.
func UpdateCategory(c *gin.Context) {
	id := c.Param("id")
	if _, err := uuid.Parse(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category id"})
		return
	}

	var req CategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	name := strings.TrimSpace(req.Name)
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nama kategori tidak boleh kosong"})
		return
	}

	typ := strings.TrimSpace(req.Type)

	var category models.Category
	if err := config.DB.First(&category, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kategori tidak ditemukan"})
		return
	}

	if typ == "" {
		typ = category.Type
	}

	if !isValidCategoryType(typ) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tipe kategori tidak valid"})
		return
	}

	// Check duplicate
	var dup models.Category
	if err := config.DB.Where("id <> ? AND LOWER(name) = LOWER(?)", id, name).First(&dup).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Kategori dengan nama tersebut sudah ada"})
		return
	}

	// Store old name to update transactions
	oldName := category.Name

	category.Type = typ
	category.Name = name

	if err := config.DB.Save(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui kategori"})
		return
	}

	// Update all transactions with the old category name to use the new name
	if oldName != name {
		if err := config.DB.Model(&models.Transaction{}).
			Where("LOWER(category) = LOWER(?)", oldName).
			Update("category", name).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui transaksi"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"data": category})
}

// isValidCategoryType limits accepted values; defaults handled at call site.
func isValidCategoryType(t string) bool {
	switch strings.ToLower(t) {
	case "income", "expense", "general":
		return true
	default:
		return false
	}
}

// syncCategoriesFromTransactions seeds Category table from distinct transaction categories.
func syncCategoriesFromTransactions() error {
	var names []string
	if err := config.DB.Model(&models.Transaction{}).
		Distinct().
		Where("category IS NOT NULL AND category <> ''").
		Pluck("category", &names).Error; err != nil {
		return err
	}

	for _, raw := range names {
		name := strings.TrimSpace(raw)
		if name == "" {
			continue
		}

		var count int64
		if err := config.DB.Model(&models.Category{}).
			Where("LOWER(name) = LOWER(?)", name).
			Count(&count).Error; err != nil {
			return err
		}

		if count == 0 {
			cat := models.Category{Type: "general", Name: name}
			if err := config.DB.Create(&cat).Error; err != nil {
				return err
			}
		}
	}

	return nil
}

// DeleteCategory deletes a category if not used.
func DeleteCategory(c *gin.Context) {
	id := c.Param("id")
	if _, err := uuid.Parse(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category id"})
		return
	}

	var category models.Category
	if err := config.DB.First(&category, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kategori tidak ditemukan"})
		return
	}

	// Check usage in transactions
	var count int64
	if err := config.DB.Model(&models.Transaction{}).Where("LOWER(category) = LOWER(?)", category.Name).Count(&count).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengecek penggunaan kategori"})
		return
	}
	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kategori tidak dapat dihapus karena sudah dipakai di transaksi"})
		return
	}

	if err := config.DB.Delete(&models.Category{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus kategori"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Kategori berhasil dihapus"})
}
