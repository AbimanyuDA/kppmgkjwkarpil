package main

import (
	"gkjw-finance-backend/config"
	"gkjw-finance-backend/models"
	"log"

	"github.com/joho/godotenv"
)

func main() {
	// Load .env file
	godotenv.Load()

	// Initialize database
	config.InitDB()

	// Insert sample funds
	funds := []models.Fund{
		{Name: "Kas Umum", Description: "Dana operasional gereja", Status: "active"},
		{Name: "Kas Ibadah", Description: "Dana untuk keperluan ibadah", Status: "active"},
		{Name: "Kas Sosial", Description: "Dana untuk kegiatan sosial", Status: "active"},
	}

	for _, fund := range funds {
		var existingFund models.Fund
		result := config.DB.Where("name = ?", fund.Name).First(&existingFund)
		if result.Error != nil {
			// Fund doesn't exist, create it
			if err := config.DB.Create(&fund).Error; err != nil {
				log.Printf("Failed to create fund %s: %v", fund.Name, err)
			} else {
				log.Printf("Created fund: %s", fund.Name)
			}
		} else {
			log.Printf("Fund already exists: %s", fund.Name)
		}
	}

	// Insert sample categories
	categories := []models.Category{
		{Name: "Persembahan", Type: "income"},
		{Name: "Perpuluhan", Type: "income"},
		{Name: "Donasi", Type: "income"},
		{Name: "Gaji Pelayan", Type: "expense"},
		{Name: "Listrik & Air", Type: "expense"},
		{Name: "Pemeliharaan", Type: "expense"},
		{Name: "Kegiatan Ibadah", Type: "expense"},
		{Name: "Kegiatan Sosial", Type: "expense"},
	}

	for _, category := range categories {
		var existingCategory models.Category
		result := config.DB.Where("name = ? AND type = ?", category.Name, category.Type).First(&existingCategory)
		if result.Error != nil {
			// Category doesn't exist, create it
			if err := config.DB.Create(&category).Error; err != nil {
				log.Printf("Failed to create category %s: %v", category.Name, err)
			} else {
				log.Printf("Created category: %s (%s)", category.Name, category.Type)
			}
		} else {
			log.Printf("Category already exists: %s (%s)", category.Name, category.Type)
		}
	}

	log.Println("Sample data inserted successfully!")
}
