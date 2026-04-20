package calendar.common.dto;

import java.time.LocalDateTime;

public final class ApiResponse<T> {

    private final boolean success;
    private final T data;
    private final ErrorBody error;
    private final String timestamp;

    private ApiResponse(boolean success, T data, ErrorBody error) {
        this.success = success;
        this.data = data;
        this.error = error;
        this.timestamp = LocalDateTime.now().toString();
    }

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, null);
    }

    public static <T> ApiResponse<T> fail(ErrorBody error) {
        return new ApiResponse<>(false, null, error);
    }

    public boolean isSuccess() { return success; }
    public T getData() { return data; }
    public ErrorBody getError() { return error; }
    public String getTimestamp() { return timestamp; }
}
