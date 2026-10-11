package com.bff.exception;

public class BFFException extends RuntimeException {

    private final int status;

    public BFFException(String message, int status) {
        super(message);
        this.status = status;
    }

    public int getStatus() {
        return status;
    }
}
