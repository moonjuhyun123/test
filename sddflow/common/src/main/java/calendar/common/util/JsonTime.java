package calendar.common.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public final class JsonTime {

    public static final String PATTERN = "yyyy-MM-dd'T'HH:mm:ss";
    public static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern(PATTERN);

    private JsonTime() {}

    public static String format(LocalDateTime value) {
        return value == null ? null : FORMATTER.format(value);
    }

    public static LocalDateTime parse(String text) {
        return text == null ? null : LocalDateTime.parse(text, FORMATTER);
    }
}
