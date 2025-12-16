package config

import (
	"fmt"
	"gkjw-finance-backend/models"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB() {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")

	// Validate required environment variables
	if host == "" || port == "" || user == "" || password == "" || dbname == "" {
		log.Fatal("Missing required database environment variables")
	}

	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=require",
		host, port, user, password, dbname)

	var err error
	// Use Silent logger for production to speed up startup
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto migrate models - run in background to avoid blocking startup
	go func() {
		if err := DB.AutoMigrate(&models.User{}, &models.Fund{}, &models.Category{}, &models.Transaction{}, &models.ActivityLog{}); err != nil {
			log.Println("Warning: Failed to auto-migrate database:", err)
		}
	}()

	// Ensure a default fund exists and backfill legacy transactions
	// Run asynchronously to avoid blocking startup
	go func() {
		var defaultFund models.Fund
		if err := DB.Where("name = ?", "Default Fund").First(&defaultFund).Error; err != nil {
			defaultFund = models.Fund{
				Name:        "Default Fund",
				Description: "Fund created automatically for legacy transactions",
				Status:      "active",
			}
			if err := DB.Create(&defaultFund).Error; err != nil {
				log.Println("Warning: Failed to create default fund:", err)
				return
			}
		}

		if err := DB.Model(&models.Transaction{}).
			Where("fund_id IS NULL").
			Update("fund_id", defaultFund.ID).Error; err != nil {
			log.Println("Warning: Failed to backfill transactions fund_id:", err)
		}

		if err := DB.Model(&models.Transaction{}).
			Where("payment_method IS NULL OR payment_method = ''").
			Update("payment_method", "cash").Error; err != nil {
			log.Println("Warning: Failed to backfill payment_method:", err)
		}
	}()

	log.Println("Database connected and migrated successfully")
}
