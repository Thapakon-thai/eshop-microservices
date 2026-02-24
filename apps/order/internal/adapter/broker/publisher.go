package broker

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/thapakon-thai/eshop-microservices/order/internal/models"
	"github.com/thapakon-thai/eshop-microservices/order/internal/service"
)

type rabbitMQPublisher struct {
	conn    *amqp.Connection
	channel *amqp.Channel
}

// RabbitMQEventPayload defines exactly what message format RabbitMQ expects, isolated from Domain models.
type RabbitMQEventPayload struct {
	OrderID int64       `json:"order_id"`
	UserID  string      `json:"user_id"`
	Amount  int64       `json:"amount"` // Sent in cents
	Status  string      `json:"status"`
	Items   interface{} `json:"items"` // Maps neatly to domain Items slice, or we could define deeply strict structs
}

// NewRabbitMQPublisher establishes connection and implements OrderEventPublisher.
func NewRabbitMQPublisher(url string) (service.OrderEventPublisher, func(), error) {
	conn, err := amqp.Dial(url)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to connect to RabbitMQ: %w", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, nil, fmt.Errorf("failed to open a channel: %w", err)
	}

	err = ch.ExchangeDeclare(
		"order_events", // name
		"topic",        // type
		true,           // durable
		false,          // auto-deleted
		false,          // internal
		false,          // no-wait
		nil,            // arguments
	)
	if err != nil {
		ch.Close()
		conn.Close()
		return nil, nil, fmt.Errorf("failed to declare an exchange: %w", err)
	}

	pub := &rabbitMQPublisher{
		conn:    conn,
		channel: ch,
	}

	cleanup := func() {
		pub.channel.Close()
		pub.conn.Close()
	}

	return pub, cleanup, nil
}

// PublishOrderCreated maps a domain Order into a RabbitMQ specific payload and publishes it.
func (p *rabbitMQPublisher) PublishOrderCreated(order *models.Order) error {
	payload := RabbitMQEventPayload{
		OrderID: order.ID,
		UserID:  order.UserID,
		Amount:  order.TotalAmount,
		Status:  order.Status,
		Items:   order.Items, // We can directly serialize the pure go structs to JSON in the Adapter
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal order payload: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = p.channel.PublishWithContext(ctx,
		"order_events",  // exchange
		"order.created", // routing key
		false,           // mandatory
		false,           // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		})
	if err != nil {
		return fmt.Errorf("failed to publish message: %w", err)
	}

	log.Printf(" [x] Sent Order Created: %s", body)
	return nil
}
