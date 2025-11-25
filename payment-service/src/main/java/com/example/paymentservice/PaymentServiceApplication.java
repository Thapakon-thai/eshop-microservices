package com.example.paymentservice;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class PaymentServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(PaymentServiceApplication.class, args);
	}

	@GetMapping("/")
	public String home() {
		return "Payment Service is running";
	}

	@org.springframework.context.annotation.Bean
	public org.springframework.amqp.core.Queue orderQueue() {
		return new org.springframework.amqp.core.Queue("orders", false);
	}

	@RabbitListener(queues = "orders")
	public void receiveOrder(String orderJson) {
		System.out.println(" [x] Received Payment Request for Order: " + orderJson);
		// Simulate payment processing
		System.out.println(" [x] Payment Processed Successfully");
	}
}
