package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

type OrderHandler struct {

}

func Route() chi.Router {
	r := chi.NewRouter()

	r.Get("/health", HealthCheck)

	return r
}

func HealthCheck(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
}