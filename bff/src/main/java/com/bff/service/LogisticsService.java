package com.bff.service;

import com.bff.client.LogisticsClient;
import com.bff.dto.request.LogisticsRequest;
import com.bff.dto.response.LogisticsResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LogisticsService {

    private final LogisticsClient logisticsClient;

    public LogisticsService(LogisticsClient logisticsClient) {
        this.logisticsClient = logisticsClient;
    }

    public List<LogisticsResponse> list(String acopioCenterId) {
        return logisticsClient.list(acopioCenterId);
    }

    public LogisticsResponse create(LogisticsRequest request) {
        return logisticsClient.create(request);
    }

    public LogisticsResponse updateState(Long id, String estado) {
        return logisticsClient.updateState(id, estado);
    }
}
