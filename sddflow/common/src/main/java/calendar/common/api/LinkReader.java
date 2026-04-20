package calendar.common.api;

import java.util.List;

public interface LinkReader {

    List<Long> findMemoIdsByScheduleId(Long scheduleId);

    List<Long> findScheduleIdsByMemoId(Long memoId);
}
