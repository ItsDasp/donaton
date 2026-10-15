package com.donaton.logistics.exception;

public class QueueNotFoundException extends RuntimeException {

    public QueueNotFoundException(String queueName) {
        super("La cola no existe: " + queueName);
    }
}
