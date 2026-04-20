package calendar.common.util;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class JsonTimeTest {

    @Test
    void format_producesIso8601_withoutZone() {
        String s = JsonTime.format(LocalDateTime.of(2026, 4, 20, 9, 0, 0));
        assertEquals("2026-04-20T09:00:00", s);
    }

    @Test
    void parse_roundTrips() {
        LocalDateTime dt = JsonTime.parse("2026-04-20T09:00:00");
        assertEquals(LocalDateTime.of(2026, 4, 20, 9, 0, 0), dt);
    }

    @Test
    void nullIn_nullOut() {
        assertNull(JsonTime.format(null));
        assertNull(JsonTime.parse(null));
    }
}
