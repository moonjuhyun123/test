package calendar.common.stub;

import calendar.common.dto.MemoSearchQuery;
import calendar.common.dto.ScheduleSearchQuery;
import calendar.common.type.UserRole;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class StubBehaviorTest {

    @Test
    void currentUserStub_returnsFixedIdentity() {
        CurrentUserStub s = new CurrentUserStub();
        assertEquals(1L, s.getId());
        assertEquals("stub-user", s.getLoginId());
        assertEquals(UserRole.USER, s.getRole());
        assertTrue(s.isAuthenticated());
    }

    @Test
    void scheduleReaderStub_findsOnlyStubId() {
        ScheduleReaderStub s = new ScheduleReaderStub();
        assertTrue(s.findById(1L).isPresent());
        assertTrue(s.findById(999L).isEmpty());
        assertTrue(s.existsByIdAndOwner(1L, 1L));
        assertFalse(s.existsByIdAndOwner(1L, 2L));
        assertEquals(1, s.findSummariesByIds(List.of(1L, 99L)).size());
        assertTrue(s.search(new ScheduleSearchQuery(1L, "k", null)).isEmpty());
        assertTrue(s.findUpcoming(1L, LocalDateTime.now(), LocalDateTime.now().plusHours(1)).isEmpty());
    }

    @Test
    void memoReaderStub_findsOnlyStubId() {
        MemoReaderStub s = new MemoReaderStub();
        assertTrue(s.findById(1L).isPresent());
        assertTrue(s.findById(2L).isEmpty());
        assertTrue(s.existsByIdAndOwner(1L, 1L));
        assertEquals(1, s.findSummariesByIds(List.of(1L)).size());
        assertTrue(s.search(new MemoSearchQuery(1L, null, null)).isEmpty());
    }

    @Test
    void tagReaderStub_alwaysEmptyAndFalse() {
        TagReaderStub s = new TagReaderStub();
        assertTrue(s.findByIds(List.of(1L, 2L)).isEmpty());
        assertFalse(s.existsByIdAndOwner(1L, 1L));
    }

    @Test
    void linkReaderStub_emptyBothDirections() {
        LinkReaderStub s = new LinkReaderStub();
        assertTrue(s.findMemoIdsByScheduleId(1L).isEmpty());
        assertTrue(s.findScheduleIdsByMemoId(1L).isEmpty());
    }
}
