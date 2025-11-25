package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/streadway/amqp"
)

type Product struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
}

type Order struct {
	ProductID string `json:"product_id"`
	UserID    string `json:"user_id"`
	Amount    float64 `json:"amount"`
}

var products = []Product{
	{ID: "1", Name: "Laptop", Price: 1000.0},
	{ID: "2", Name: "Mouse", Price: 20.0},
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}

func main() {
	r := gin.Default()

	// RabbitMQ connection
	var conn *amqp.Connection
	var err error
	
	for i := 0; i < 10; i++ {
		conn, err = amqp.Dial("amqp://guest:guest@rabbitmq:5672/")
		if err == nil {
			break
		}
		log.Printf("Failed to connect to RabbitMQ: %s. Retrying in 5 seconds...", err)
		time.Sleep(5 * time.Second)
	}

	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ after retries: %s", err)
	}
	defer conn.Close()

	r.GET("/products", func(c *gin.Context) {
		c.JSON(http.StatusOK, products)
	})

	r.POST("/orders", func(c *gin.Context) {
		var order Order
		if err := c.ShouldBindJSON(&order); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Send to RabbitMQ
		if conn != nil {
			ch, err := conn.Channel()
			failOnError(err, "Failed to open a channel")
			defer ch.Close()

			q, err := ch.QueueDeclare(
				"orders", // name
				false,    // durable
				false,    // delete when unused
				false,    // exclusive
				false,    // no-wait
				nil,      // arguments
			)
			failOnError(err, "Failed to declare a queue")

			body, _ := json.Marshal(order)
			err = ch.Publish(
				"",     // exchange
				q.Name, // routing key
				false,  // mandatory
				false,  // immediate
				amqp.Publishing{
					ContentType: "application/json",
					Body:        body,
				})
			failOnError(err, "Failed to publish a message")
			log.Printf(" [x] Sent %s", body)
		}

		c.JSON(http.StatusCreated, gin.H{"message": "Order placed", "order": order})
	})

	r.Run(":8002")
}
