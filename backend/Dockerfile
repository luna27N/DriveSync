# Build with the same Java major version used by the Render runtime.
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml .
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
ENV SERVER_PORT=10000
COPY --from=build /workspace/target/drivesync-1.0.0.jar /app/drivesync.jar
EXPOSE 10000
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/drivesync.jar"]
