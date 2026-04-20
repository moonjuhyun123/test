package calendar.common.exception;

import calendar.common.dto.FieldError;

import java.util.Collections;
import java.util.List;

public class ValidationException extends DomainException {

    private final List<FieldError> fieldErrors;

    public ValidationException(String message) {
        super("COMM-4000", message);
        this.fieldErrors = Collections.emptyList();
    }

    public ValidationException(String code, String message) {
        super(code, message);
        this.fieldErrors = Collections.emptyList();
    }

    public ValidationException(String code, String message, List<FieldError> fieldErrors) {
        super(code, message);
        this.fieldErrors = fieldErrors == null ? Collections.emptyList() : fieldErrors;
    }

    public List<FieldError> getFieldErrors() {
        return fieldErrors;
    }
}
