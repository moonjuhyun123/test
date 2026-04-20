package calendar.common.dto;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PagedResponseTest {

    @Test
    void empty_producesZeroTotals() {
        PagedResponse<String> p = PagedResponse.empty(0, 20);

        assertTrue(p.getItems().isEmpty());
        assertEquals(0, p.getTotalElements());
        assertEquals(0, p.getTotalPages());
        assertFalse(p.isHasNext());
    }

    @Test
    void totalPages_isCeiling_andHasNextReflectsPosition() {
        PagedResponse<String> p = new PagedResponse<>(List.of("a", "b"), 0, 2, 5);

        assertEquals(3, p.getTotalPages());
        assertTrue(p.isHasNext());
    }

    @Test
    void lastPage_hasNoNext() {
        PagedResponse<String> p = new PagedResponse<>(List.of("a"), 2, 2, 5);

        assertEquals(3, p.getTotalPages());
        assertFalse(p.isHasNext());
    }

    @Test
    void nullItems_treatedAsEmpty() {
        PagedResponse<String> p = new PagedResponse<>(null, 0, 20, 0);

        assertTrue(p.getItems().isEmpty());
    }
}
