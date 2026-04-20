package calendar.common.exception;

public class UnauthorizedException extends DomainException {

    public UnauthorizedException() {
        super("AUTH-4010", "인증이 필요합니다.");
    }

    public UnauthorizedException(String message) {
        super("AUTH-4010", message);
    }
}
