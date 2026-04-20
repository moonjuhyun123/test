package calendar.common.stub;

import calendar.common.api.ScheduleReader;
import calendar.common.dto.ScheduleSearchQuery;
import calendar.common.dto.ScheduleSummary;
import calendar.common.dto.ScheduleTrigger;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Component
@Profile("local")
public class ScheduleReaderStub implements ScheduleReader {

    private static final long STUB_ID = 1L;
    private static final long STUB_OWNER = 1L;

    @Override
    public Optional<ScheduleSummary> findById(Long id) {
        if (id != null && id == STUB_ID) {
            return Optional.of(sample());
        }
        return Optional.empty();
    }

    @Override
    public boolean existsByIdAndOwner(Long id, Long ownerId) {
        return id != null && ownerId != null && id == STUB_ID && ownerId == STUB_OWNER;
    }

    @Override
    public List<ScheduleSummary> findSummariesByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return Collections.emptyList();
        return ids.contains(STUB_ID) ? List.of(sample()) : Collections.emptyList();
    }

    @Override
    public List<ScheduleSummary> search(ScheduleSearchQuery query) {
        return Collections.emptyList();
    }

    @Override
    public List<ScheduleTrigger> findUpcoming(Long ownerId, LocalDateTime from, LocalDateTime to) {
        return Collections.emptyList();
    }

    private ScheduleSummary sample() {
        LocalDateTime now = LocalDateTime.now();
        return new ScheduleSummary(STUB_ID, STUB_OWNER, "stub-schedule",
                now, now.plusHours(1), "stub-location");
    }
}
