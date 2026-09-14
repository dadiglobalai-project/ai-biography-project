package com.AI.biography.website;

import com.AI.biography.section.exception.BadRequestException;
import com.AI.biography.section.exception.ErrorResponse;
import com.AI.biography.section.exception.NotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(basePackages = "com.AI.biography.website")
public class WebsiteExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(404, "Not Found", exception.getMessage()));
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(BadRequestException exception) {
        return ResponseEntity.badRequest()
                .body(new ErrorResponse(400, "Bad Request", exception.getMessage()));
    }
}
