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
			// Categories
			categories := protected.Group("/categories")
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


			// Funds: list for all, manage for admin
			funds := protected.Group("/funds")
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
