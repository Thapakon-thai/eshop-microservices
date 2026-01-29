package com.eshop.payment;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Arrays;

@RestController
public class PaymentController {

    public record Payment(String id, double amount, String status, String fullName, String userId, String email) {}

    @GetMapping("/payments")
    public List<Payment> getPayments() {
        return Arrays.asList(
            new Payment("728ed521", 134.0, "pending", "John Doe", "44", "johndoe@gmail.com"),
            new Payment("728ed522", 124.0, "success", "Jane Doe", "35", "janedoe@gmail.com"),
            new Payment("728ed523", 167.0, "success", "Mike Galloway", "11", "mikegalloway@gmail.com"),
            new Payment("728ed524", 156.0, "failed", "Minerva Robinson", "20", "minerbarobinson@gmail.com"),
            new Payment("728ed525", 145.0, "success", "Mable Clayton", "21", "mableclayton@gmail.com")
        );
    }
}
