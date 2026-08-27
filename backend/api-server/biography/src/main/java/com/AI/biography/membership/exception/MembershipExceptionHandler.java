package com.AI.biography.membership.exception;

import com.AI.biography.section.exception.BadRequestException;
import com.AI.biography.section.exception.ErrorResponse;
import com.AI.biography.section.exception.NotFoundException;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice(basePackages = "com.AI.biography.membership")
public class MembershipExceptionHandler {

    @ExceptionHandler(MembershipUnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(MembershipUnauthorizedException exception) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(401, "Unauthorized", exception.getMessage()));
    }

    @ExceptionHandler(MembershipForbiddenException.class)
    public ResponseEntity<ErrorResponse> handleForbidden(MembershipForbiddenException exception) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse(403, "Forbidden", exception.getMessage()));
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(404, "Not Found", exception.getMessage()));
    }

    @ExceptionHandler(MembershipConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflict(MembershipConflictException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(409, "Conflict", exception.getMessage()));
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(BadRequestException exception) {
        return ResponseEntity.badRequest()
                .body(new ErrorResponse(400, "Bad Request", exception.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult().getFieldErrors()
                .stream()
                .map(error -> error.getField() + " " + error.getDefaultMessage())
                .collect(Collectors.joining("; "));
        return ResponseEntity.badRequest()
                .body(new ErrorResponse(400, "Bad Request", message));
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ErrorResponse> handleInvalidRequest(Exception exception) {
        return ResponseEntity.badRequest()
                .body(new ErrorResponse(400, "Bad Request", "Invalid request"));
    }
}
