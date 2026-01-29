package com.eshop.payment;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Arrays;

@RestController
public class PaymentController {

    public record Payment(String id, double amount, String status, String fullName, String userId, String email) {
    }

    @GetMapping("/payments")
    public List<Payment> getPayments() {
        // Return empty list - real payments will come from database
        return List.of();
    }
}
