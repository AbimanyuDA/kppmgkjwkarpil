package handler

import (
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"gkjw-finance-backend/config"
	"gkjw-finance-backend/routes"
)

var (
	router *gin.Engine
	once   sync.Once
)

func initRouter() {
	once.Do(func() {
		// Set to release mode for production
		gin.SetMode(gin.ReleaseMode)
		
		// Initialize database
		config.InitDB()
		
		// Setup routes
		router = routes.SetupRoutes()
	})
}

// Handler is the entry point for Vercel serverless function
func Handler(w http.ResponseWriter, r *http.Request) {
	initRouter()
	router.ServeHTTP(w, r)
}
