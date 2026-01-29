module github.com/thapakon-thai/eshop-microservices/order

go 1.25.4

require (
	github.com/go-chi/chi/v5 v5.2.3
	github.com/thapakon-thai/eshop-microservices/proto v0.0.0-00010101000000-000000000000
	google.golang.org/grpc v1.78.0
)

require (
	github.com/rabbitmq/amqp091-go v1.10.0
	golang.org/x/net v0.47.0 // indirect
	golang.org/x/sys v0.39.0 // indirect
	google.golang.org/genproto/googleapis/rpc v0.0.0-20251029180050-ab9386a59fda // indirect
	google.golang.org/protobuf v1.36.10 // indirect
)

require (
	github.com/jackc/pgpassfile v1.0.0 // indirect
	github.com/jackc/pgservicefile v0.0.0-20240606120523-5a60cdf6a761 // indirect
	github.com/jackc/pgx/v5 v5.7.6 // indirect
	github.com/jackc/puddle/v2 v2.2.2 // indirect
	github.com/jinzhu/inflection v1.0.0 // indirect
	github.com/jinzhu/now v1.1.5 // indirect
	github.com/shopspring/decimal v1.4.0
	golang.org/x/crypto v0.46.0 // indirect
	golang.org/x/sync v0.19.0 // indirect
	golang.org/x/text v0.32.0 // indirect
	gorm.io/driver/postgres v1.5.7
	gorm.io/gorm v1.25.7
)

replace github.com/thapakon-thai/eshop-microservices/proto => ../../packages/proto
