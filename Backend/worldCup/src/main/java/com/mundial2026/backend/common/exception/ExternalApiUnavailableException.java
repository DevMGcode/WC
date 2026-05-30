package com.mundial2026.backend.common.exception;

import org.springframework.http.HttpStatusCode;

public class ExternalApiUnavailableException extends RuntimeException {

    private final HttpStatusCode statusCode;

    public ExternalApiUnavailableException(HttpStatusCode statusCode) {
        super("External API unavailable. Status: " + statusCode);
        this.statusCode = statusCode;
    }

    public ExternalApiUnavailableException(String message, Throwable cause) {
        super(message, cause);
        this.statusCode = null;
    }

    public HttpStatusCode getStatusCode() {
        return statusCode;
    }
}