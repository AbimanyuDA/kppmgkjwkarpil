package routes

import (
	"gkjw-finance-backend/handlers"
	"gkjw-finance-backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	api := router.Group("/api")
	{
		// Public routes
		auth := api.Group("/auth")
		{
			auth.POST("/login", handlers.Login)
			auth.POST("/register", handlers.Register)
		}

		// Protected routes
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			// Dashboard
			dashboard := protected.Group("/dashboard")
			{
				dashboard.GET("/stats", handlers.GetDashboardStats)
				dashboard.GET("/monthly", handlers.GetMonthlyData)
				dashboard.GET("/category", handlers.GetCategoryData)
			}

			// Transactions
			transactions := protected.Group("/transactions")
			{
				transactions.GET("", handlers.GetTransactions)
				transactions.GET("/:id", handlers.GetTransactionByID)
				transactions.POST("", handlers.CreateTransaction)
				transactions.PUT("/:id", handlers.UpdateTransaction)
				transactions.PUT("/:id/status", handlers.UpdateTransactionStatus)
				transactions.DELETE("/:id", middleware.AdminOnly(), handlers.DeleteTransaction)
			}

			// Reports
			reports := protected.Group("/reports")
			{
				reports.GET("", handlers.GetReports)
				reports.GET("/export/pdf", handlers.ExportPDF)
				reports.GET("/export/excel", handlers.ExportExcel)
			}

			// Users (Admin only)
			users := protected.Group("/users")
			users.Use(middleware.AdminOnly())
			{
				users.GET("", handlers.GetUsers)
				users.GET("/:id", handlers.GetUserByID)
				users.POST("", handlers.CreateUser)
				users.PUT("/:id", handlers.UpdateUser)
				users.DELETE("/:id", handlers.DeleteUser)
			}

			// Activity Logs
			logs := protected.Group("/logs")
			{
				logs.GET("", middleware.AdminOnly(), handlers.GetActivityLogs)
			}

			// File Upload
			protected.POST("/upload", handlers.UploadFile)
		}
	}
}
