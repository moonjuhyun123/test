package calendar.common.api;

import calendar.common.dto.MemoSearchQuery;
import calendar.common.dto.MemoSummary;

import java.util.List;
import java.util.Optional;

public interface MemoReader {

    Optional<MemoSummary> findById(Long id);

    boolean existsByIdAndOwner(Long id, Long ownerId);

    List<MemoSummary> findSummariesByIds(List<Long> ids);

    List<MemoSummary> search(MemoSearchQuery query);
}
