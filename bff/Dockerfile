# Multi-stage build para BFF (Backend For Frontend)
# STAGE 1: Builder - Compilar con Maven
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Copiar pom.xml y descargar dependencias
COPY pom.xml .
COPY src ./src

# Compilar el proyecto
RUN mvn clean package -DskipTests

# STAGE 2: Runtime - Ejecutar con JDK mínimo
FROM eclipse-temurin:17-jdk

WORKDIR /app

# Copiar JAR compilado del stage anterior
COPY --from=builder /app/target/*.jar app.jar

# Exponer puerto 8080 (puerto interno del contenedor)
# El docker-compose lo mapea a 8085
EXPOSE 8080

# Comando de ejecución
ENTRYPOINT ["java", "-jar", "app.jar"]
