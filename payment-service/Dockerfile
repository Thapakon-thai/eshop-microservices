FROM maven:3.9.5-eclipse-temurin-17 AS builder

WORKDIR /app
COPY pom.xml .
# Download dependencies (this step is cached if pom.xml doesn't change)
# RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn package -DskipTests

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

CMD ["java", "-jar", "app.jar"]
