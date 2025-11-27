# How to design database schema for this ecommerce microservices?

## Database schema

### Order

- order_id
- product_id
- user_id
- amount
- status

### Product

- product_id
- name
- price
- stock

### User

- user_id
- name
- email
- password

### Payment

- payment_id
- order_id
- amount
- status

