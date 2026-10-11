package com.bff.service;

import com.bff.client.NeedsClient;
import com.bff.dto.request.NeedsRequest;
import com.bff.dto.response.NeedsResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NeedsService {

    private final NeedsClient needsClient;

    public NeedsService(NeedsClient needsClient) {
        this.needsClient = needsClient;
    }

    public List<NeedsResponse> list(String category, String status) {
        return needsClient.list(category, status);
    }

    public NeedsResponse get(String id) {
        return needsClient.get(id);
    }

    public NeedsResponse create(NeedsRequest request) {
        return needsClient.create(request);
    }

    public NeedsResponse update(String id, NeedsRequest request) {
        return needsClient.update(id, request);
    }

    public NeedsResponse receive(String id, Double amount) {
        return needsClient.receive(id, amount);
    }

    public void delete(String id) {
        needsClient.delete(id);
    }
}
