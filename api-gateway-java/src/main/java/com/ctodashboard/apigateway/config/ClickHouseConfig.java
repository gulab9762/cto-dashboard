package com.ctodashboard.apigateway.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.util.Objects;

@Configuration
public class ClickHouseConfig {

    @Value("${clickhouse.url}")
    private String clickHouseUrl;

    @Value("${clickhouse.username}")
    private String clickHouseUsername;

    @Value("${clickhouse.password}")
    private String clickHousePassword;

    @Bean(name = "clickHouseDataSource")
    public DataSource clickHouseDataSource() {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(clickHouseUrl);
        dataSource.setUsername(clickHouseUsername);
        dataSource.setPassword(clickHousePassword);
        dataSource.setDriverClassName("com.clickhouse.jdbc.ClickHouseDriver");
        return dataSource;
    }

    @Bean(name = "clickHouseJdbcTemplate")
    public JdbcTemplate clickHouseJdbcTemplate() {
        return new JdbcTemplate(Objects.requireNonNull(clickHouseDataSource()));
    }
}
