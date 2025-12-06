package handler

import (
	"gkjw-finance-backend/config"
	"gkjw-finance-backend/routes"
	"log"
	"net/http"
	"os"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

var (
	router    *gin.Engine
	initOnce  sync.Once
	initError error
)

func initRouter() error {
	var err error
	initOnce.Do(func() {
		// Load environment variables (might fail on Vercel, but that's OK)
		if e := godotenv.Load(); e != nil {
			log.Println("No .env file found (expected on Vercel)")
		}

		// Log env vars for debugging
		log.Printf("DB_HOST=%s, DB_PORT=%s, DB_USER=%s, DB_NAME=%s", 
			os.Getenv("DB_HOST"), os.Getenv("DB_PORT"), os.Getenv("DB_USER"), os.Getenv("DB_NAME"))

		// Initialize database connection
		config.InitDB()

		// Create Gin router
		router = gin.Default()

		// CORS middleware
		router.Use(func(c *gin.Context) {
			c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
			c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
			c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

			if c.Request.Method == "OPTIONS" {
				c.AbortWithStatus(204)
				return
			}

			c.Next()
		})

		// Setup routes
		routes.SetupRoutes(router)
	})
	return err
}

// Handler is the serverless function entry point for Vercel
func Handler(w http.ResponseWriter, r *http.Request) {
	if err := initRouter(); err != nil {
		http.Error(w, "Failed to initialize router", http.StatusInternalServerError)
		return
	}
	router.ServeHTTP(w, r)
}
