package main

import (
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)


func (api *application) mount() http.Handler {
	r := chi.NewRouter()

	// A good base middleware stack
	r.Use(middleware.RequestID) // for rate limiting
	r.Use(middleware.RealIP)	// for rate limiting, analytics, and logging
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Set a timeout value on the request context (ctx), that will signal
	// through ctx.Done() that the request has timed out and further
	// processing should be stopped.
	r.Use(middleware.Timeout(60 * time.Second))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("good to go"))
	})

	return r
}

func (api *application) Start(h http.Handler) error {
	srv := &http.Server{
		Addr:    api.config.address,
		Handler: h,
		WriteTimeout: 30 * time.Second,
		ReadTimeout: 10 * time.Second,
		IdleTimeout: time.Minute,
	}

	log.Printf("Starting server on %s", srv.Addr)

	return srv.ListenAndServe()
}


type application struct {
	config config
}

type config struct {
	address string
	db 		dbConfig
}

type dbConfig struct {
	// Database configuration fields
}