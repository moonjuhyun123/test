package calendar.common.util;

import calendar.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class OwnershipGuardTest {

    @Test
    void passes_whenOwnerMatchesCurrentUser() {
        assertDoesNotThrow(() -> OwnershipGuard.requireOwner(1L, 1L));
    }

    @Test
    void throws_whenOwnerDiffers_withAuth4040() {
        ResourceNotFoundException ex =
                assertThrows(ResourceNotFoundException.class,
                        () -> OwnershipGuard.requireOwner(1L, 2L));
        assertEquals("AUTH-4040", ex.getCode());
    }

    @Test
    void throws_whenCurrentUserNull() {
        assertThrows(ResourceNotFoundException.class,
                () -> OwnershipGuard.requireOwner(1L, null));
    }

    @Test
    void throws_whenOwnerNull() {
        assertThrows(ResourceNotFoundException.class,
                () -> OwnershipGuard.requireOwner(null, 1L));
    }
}
