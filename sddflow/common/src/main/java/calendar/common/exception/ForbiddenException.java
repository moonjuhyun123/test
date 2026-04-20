package calendar.common.exception;

public class ForbiddenException extends DomainException {

    public ForbiddenException() {
        super("AUTH-4030", "권한이 없습니다.");
    }

    public ForbiddenException(String code, String message) {
        super(code, message);
    }
}
