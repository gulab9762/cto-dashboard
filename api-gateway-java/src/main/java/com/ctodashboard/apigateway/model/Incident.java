package com.ctodashboard.apigateway.model;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Incident {
    private String date;
    private Integer count;
    private List<CorrelatedEvent> correlatedEvents;
}
