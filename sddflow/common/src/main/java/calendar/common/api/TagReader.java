package calendar.common.api;

import calendar.common.dto.TagSummary;

import java.util.List;

public interface TagReader {

    List<TagSummary> findByIds(List<Long> ids);

    boolean existsByIdAndOwner(Long id, Long ownerId);
}
