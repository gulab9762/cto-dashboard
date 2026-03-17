package com.ctodashboard.apigateway.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Metrics {
    private Integer prsMerged;
    private Double averageCycleTime;
    private Integer reviewCount;
    private Integer commitCount;
}
