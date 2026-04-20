package calendar.common.config;

import calendar.common.dto.ApiResponse;
import calendar.common.dto.ErrorBody;
import calendar.common.dto.FieldError;
import calendar.common.exception.DomainException;
import calendar.common.exception.ForbiddenException;
import calendar.common.exception.ResourceNotFoundException;
import calendar.common.exception.UnauthorizedException;
import calendar.common.exception.ValidationException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnauthorized(UnauthorizedException e,
                                                                HttpServletRequest req) {
        return build(HttpStatus.UNAUTHORIZED, e.getCode(), e.getMessage(), null, req);
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiResponse<Void>> handleForbidden(ForbiddenException e,
                                                             HttpServletRequest req) {
        return build(HttpStatus.FORBIDDEN, e.getCode(), e.getMessage(), null, req);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(ResourceNotFoundException e,
                                                            HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, e.getCode(), e.getMessage(), null, req);
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(ValidationException e,
                                                              HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, e.getCode(), e.getMessage(),
                e.getFieldErrors(), req);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleBeanValidation(MethodArgumentNotValidException e,
                                                                  HttpServletRequest req) {
        List<FieldError> details = e.getBindingResult().getFieldErrors().stream()
                .map(fe -> new FieldError(fe.getField(), fe.getDefaultMessage()))
                .collect(Collectors.toList());
        return build(HttpStatus.BAD_REQUEST, "COMM-4000",
                "입력값이 올바르지 않습니다.", details, req);
    }

    @ExceptionHandler(DomainException.class)
    public ResponseEntity<ApiResponse<Void>> handleDomain(DomainException e,
                                                          HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, e.getCode(), e.getMessage(), null, req);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnknown(Exception e,
                                                           HttpServletRequest req) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "COMM-5000",
                "서버 내부 오류가 발생했습니다.", null, req);
    }

    private ResponseEntity<ApiResponse<Void>> build(HttpStatus status, String code,
                                                    String message, List<FieldError> details,
                                                    HttpServletRequest req) {
        ErrorBody body = new ErrorBody(code, message, details, req.getRequestURI());
        return ResponseEntity.status(status).body(ApiResponse.fail(body));
    }
}
