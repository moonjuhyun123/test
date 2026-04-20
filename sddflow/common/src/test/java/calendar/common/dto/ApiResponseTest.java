package calendar.common.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ApiResponseTest {

    @Test
    void ok_wrapsData_andMarksSuccess() {
        ApiResponse<String> r = ApiResponse.ok("hello");

        assertTrue(r.isSuccess());
        assertEquals("hello", r.getData());
        assertNull(r.getError());
        assertNotNull(r.getTimestamp());
    }

    @Test
    void fail_setsErrorBody_andMarksFailure() {
        ErrorBody error = new ErrorBody("TEST-4000", "bad", null, "/x");

        ApiResponse<Void> r = ApiResponse.fail(error);

        assertFalse(r.isSuccess());
        assertNull(r.getData());
        assertEquals("TEST-4000", r.getError().getCode());
    }
}
