package calendar.common.api;

import calendar.common.dto.ScheduleSearchQuery;
import calendar.common.dto.ScheduleSummary;
import calendar.common.dto.ScheduleTrigger;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ScheduleReader {

    Optional<ScheduleSummary> findById(Long id);

    boolean existsByIdAndOwner(Long id, Long ownerId);

    List<ScheduleSummary> findSummariesByIds(List<Long> ids);

    List<ScheduleSummary> search(ScheduleSearchQuery query);

    List<ScheduleTrigger> findUpcoming(Long ownerId, LocalDateTime from, LocalDateTime to);
}
