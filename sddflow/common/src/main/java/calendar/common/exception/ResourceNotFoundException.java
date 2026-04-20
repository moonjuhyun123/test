package calendar.common.exception;

public class ResourceNotFoundException extends DomainException {

    public ResourceNotFoundException(String code, String message) {
        super(code, message);
    }

    public static ResourceNotFoundException ownerMismatch() {
        return new ResourceNotFoundException("AUTH-4040", "리소스를 찾을 수 없습니다.");
    }

    public static ResourceNotFoundException of(String moduleCode, String message) {
        return new ResourceNotFoundException(moduleCode, message);
    }
}
