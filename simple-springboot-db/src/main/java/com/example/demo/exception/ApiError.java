package com.example.demo.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(LocalDateTime timestamp, int status, String error, String message,
                       String path, Map<String, String> fieldErrors) {

    public static ApiError of(int status, String message, String path, Map<String, String> fieldErrors) {
        HttpStatus hs = HttpStatus.resolve(status);
        return new ApiError(LocalDateTime.now(), status,
                hs != null ? hs.getReasonPhrase() : "Error", message, path, fieldErrors);
    }
}
