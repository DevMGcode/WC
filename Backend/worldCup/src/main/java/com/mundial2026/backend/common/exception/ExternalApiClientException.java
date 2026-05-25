package com.mundial2026.backend.common.exception;

import org.springframework.http.HttpStatusCode;

public class ExternalApiClientException extends RuntimeException {

    private final HttpStatusCode statusCode;

    public ExternalApiClientException(HttpStatusCode statusCode, String message) {
        super(message);
        this.statusCode = statusCode;
    }

    public HttpStatusCode getStatusCode() {
        return statusCode;
    }
}