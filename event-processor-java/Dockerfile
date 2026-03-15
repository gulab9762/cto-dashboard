FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/event-processor-1.0.0-SNAPSHOT.jar app.jar
EXPOSE 3001
CMD ["java", "-jar", "app.jar"]
