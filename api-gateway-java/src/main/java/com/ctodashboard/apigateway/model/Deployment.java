package com.ctodashboard.apigateway.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Deployment {
    private String date;
    private Integer count;
    private Double successRate;
}
