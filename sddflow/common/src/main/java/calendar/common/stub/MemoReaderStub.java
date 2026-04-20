package calendar.common.stub;

import calendar.common.api.MemoReader;
import calendar.common.dto.MemoSearchQuery;
import calendar.common.dto.MemoSummary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Component
@Profile("local")
public class MemoReaderStub implements MemoReader {

    private static final long STUB_ID = 1L;
    private static final long STUB_OWNER = 1L;

    @Override
    public Optional<MemoSummary> findById(Long id) {
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
    public List<MemoSummary> findSummariesByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return Collections.emptyList();
        return ids.contains(STUB_ID) ? List.of(sample()) : Collections.emptyList();
    }

    @Override
    public List<MemoSummary> search(MemoSearchQuery query) {
        return Collections.emptyList();
    }

    private MemoSummary sample() {
        return new MemoSummary(STUB_ID, STUB_OWNER, "stub-memo",
                "stub excerpt...", LocalDateTime.now());
    }
}
