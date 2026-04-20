package calendar.common.dto;

import java.util.Collections;
import java.util.List;

public final class ErrorBody {

    private final String code;
    private final String message;
    private final List<FieldError> details;
    private final String path;

    public ErrorBody(String code, String message, List<FieldError> details, String path) {
        this.code = code;
        this.message = message;
        this.details = details == null ? Collections.emptyList() : details;
        this.path = path;
    }

    public String getCode() { return code; }
    public String getMessage() { return message; }
    public List<FieldError> getDetails() { return details; }
    public String getPath() { return path; }
}
