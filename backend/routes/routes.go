package routes

import (
	"gkjw-finance-backend/handlers"
	"gkjw-finance-backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	// Health check endpoint
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "GKJW Finance Backend API is running",
			"version": "1.0.0",
		})
	})
	
	// Leapcell healthcheck endpoints
	router.GET("/kaithheathcheck", func(c *gin.Context) {
		c.String(200, "OK")
	})
	router.GET("/kaithhealthcheck", func(c *gin.Context) {
		c.String(200, "OK")
	})

	// ==================== PUBLIC ROUTES (NO AUTH REQUIRED) ====================
	// Auth endpoints
	auth := router.Group("/api/auth")
	{
		auth.POST("/login", handlers.Login)
		auth.POST("/register", handlers.Register)
	}

	// Public Dashboard endpoints
	dashboard := router.Group("/api/dashboard")
	{
		dashboard.GET("/stats", handlers.GetDashboardStats)
		dashboard.GET("/monthly", handlers.GetMonthlyData)
		dashboard.GET("/category", handlers.GetCategoryData)
	}

	// Public Transactions endpoint (GET only)
	router.GET("/api/transactions", handlers.GetTransactions)

	// Public Reports endpoints
	reports := router.Group("/api/reports")
	{
		reports.GET("", handlers.GetReports)
		reports.GET("/export/pdf", handlers.ExportPDF)
		reports.GET("/export/excel", handlers.ExportExcel)
	}

	// ==================== PROTECTED ROUTES (AUTH REQUIRED) ====================
	api := router.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		// Categories (protected)
		categories := api.Group("/categories")
		{
			categories.GET("", handlers.GetCategories)
			adminCategories := categories.Group("")
			adminCategories.Use(middleware.AdminOnly())
			{
				adminCategories.POST("", handlers.CreateCategory)
				adminCategories.PUT(":id", handlers.UpdateCategory)
				adminCategories.DELETE(":id", handlers.DeleteCategory)
			}
		}

		// Dashboard POST (create transactions - protected)
		dashboardProtected := api.Group("/dashboard")
		{
			dashboardProtected.POST("", handlers.CreateTransaction)
		}

		// Transactions (protected operations)
		transactions := api.Group("/transactions")
		{
			transactions.GET("/:id", handlers.GetTransactionByID)
			transactions.POST("", handlers.CreateTransaction)
			transactions.PUT("/:id", handlers.UpdateTransaction)
			transactions.PUT("/:id/status", handlers.UpdateTransactionStatus)
			transactions.DELETE("/:id", middleware.AdminOnly(), handlers.DeleteTransaction)
		}

		// Users (Admin only)
		users := api.Group("/users")
		users.Use(middleware.AdminOnly())
		{
			users.GET("", handlers.GetUsers)
			users.GET("/:id", handlers.GetUserByID)
			users.POST("", handlers.CreateUser)
			users.PUT("/:id", handlers.UpdateUser)
			users.DELETE("/:id", handlers.DeleteUser)
		}

		// Funds (protected)
		funds := api.Group("/funds")
		{
			funds.GET("", handlers.GetFunds)
			fundsAdmin := funds.Group("")
			fundsAdmin.Use(middleware.AdminOnly())
			{
				fundsAdmin.POST("", handlers.CreateFund)
				fundsAdmin.PUT("/:id", handlers.UpdateFund)
				fundsAdmin.DELETE("/:id", handlers.DeleteFund)
			}
		}

		// Activity Logs (Admin only)
		logs := api.Group("/logs")
		{
			logs.GET("", middleware.AdminOnly(), handlers.GetActivityLogs)
		}

		// File Upload (protected)
		api.POST("/upload", handlers.UploadFile)
	}
}
