package config

import (
	"log/slog"
	"os"
)

type Config struct {
	ServicePort string
	MongoDBURI  string
	DBName      string
}

func LoadConfig() *Config {
	port := os.Getenv("PRODUCT_SERVICE_PORT")
	if port == "" {
		port = "8004"
	}

	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		slog.Warn("MONGODB_URI is not set, using default")
		mongoURI = "mongodb://localhost:27017"
	}

	return &Config{
		ServicePort: port,
		MongoDBURI:  mongoURI,
		DBName:      "product_db",
	}
}
