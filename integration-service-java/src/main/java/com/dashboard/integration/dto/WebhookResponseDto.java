package com.dashboard.integration.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WebhookResponseDto {
    private String status;
    private String message;

    public WebhookResponseDto(String status) {
        this.status = status;
    }
}
