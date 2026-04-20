package calendar.common.util;

import calendar.common.exception.ValidationException;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageRequest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class PageRequestFactoryTest {

    @Test
    void defaults_whenNulls() {
        PageRequest pr = PageRequestFactory.of(null, null);
        assertEquals(0, pr.getPageNumber());
        assertEquals(20, pr.getPageSize());
    }

    @Test
    void clampsNegativePage_toZero() {
        PageRequest pr = PageRequestFactory.of(-1, 10);
        assertEquals(0, pr.getPageNumber());
        assertEquals(10, pr.getPageSize());
    }

    @Test
    void rejectsSizeOverMax() {
        ValidationException ex = assertThrows(ValidationException.class,
                () -> PageRequestFactory.of(0, 101));
        assertEquals("COMM-4000", ex.getCode());
    }

    @Test
    void acceptsBoundarySize100() {
        PageRequest pr = PageRequestFactory.of(0, 100);
        assertEquals(100, pr.getPageSize());
    }
}
