package main

import (
	"log"
	"os"

)



func main() {
	cfg := config {
		address: ":8080",
		db: dbConfig{
			// Initialize database configuration fields
		},
	}

	api := application{
		config: cfg,
	}

	if err := api.Start(api.mount()); err != nil {
		log.Printf("Server has failed to start: %s", err)
		os.Exit(1)
	}
}