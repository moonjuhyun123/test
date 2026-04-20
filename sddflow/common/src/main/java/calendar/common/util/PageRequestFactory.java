package calendar.common.util;

import calendar.common.exception.ValidationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

public final class PageRequestFactory {

    public static final int DEFAULT_PAGE = 0;
    public static final int DEFAULT_SIZE = 20;
    public static final int MAX_SIZE = 100;

    private PageRequestFactory() {}

    public static PageRequest of(Integer page, Integer size) {
        return of(page, size, null);
    }

    public static PageRequest of(Integer page, Integer size, Sort sort) {
        int p = (page == null || page < 0) ? DEFAULT_PAGE : page;

        if (size != null && size > MAX_SIZE) {
            throw new ValidationException("COMM-4000",
                    "size는 " + MAX_SIZE + " 이하여야 합니다.");
        }
        int s = (size == null || size < 1) ? DEFAULT_SIZE : size;

        return sort == null ? PageRequest.of(p, s) : PageRequest.of(p, s, sort);
    }
}
