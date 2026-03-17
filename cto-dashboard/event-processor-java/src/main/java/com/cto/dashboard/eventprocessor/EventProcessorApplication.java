package com.cto.dashboard.eventprocessor;

import com.cto.dashboard.eventprocessor.clickhouse.ClickHouseService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class EventProcessorApplication {

    public static void main(String[] args) {
        SpringApplication.run(EventProcessorApplication.class, args);
    }

    @Bean
    public CommandLineRunner init(ClickHouseService clickHouseService) {
        return args -> {
            // Initialize ClickHouse tables
            clickHouseService.ensureTablesExist();
            System.out.println("✅ Event Processor running");
            System.out.println("📬 Listening for events from Kafka");
        };
    }
}
