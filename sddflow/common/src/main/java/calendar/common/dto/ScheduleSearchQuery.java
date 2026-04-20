package calendar.common.dto;

import java.util.Collections;
import java.util.List;

public final class ScheduleSearchQuery {

    private final Long ownerId;
    private final String keyword;
    private final List<Long> tagIds;

    public ScheduleSearchQuery(Long ownerId, String keyword, List<Long> tagIds) {
        this.ownerId = ownerId;
        this.keyword = keyword;
        this.tagIds = tagIds == null ? Collections.emptyList() : tagIds;
    }

    public Long getOwnerId() { return ownerId; }
    public String getKeyword() { return keyword; }
    public List<Long> getTagIds() { return tagIds; }
}
