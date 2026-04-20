package calendar.common.dto;

import java.time.LocalDateTime;

public final class ScheduleSummary {

    private final Long id;
    private final Long ownerId;
    private final String title;
    private final LocalDateTime startAt;
    private final LocalDateTime endAt;
    private final String location;

    public ScheduleSummary(Long id, Long ownerId, String title,
                           LocalDateTime startAt, LocalDateTime endAt, String location) {
        this.id = id;
        this.ownerId = ownerId;
        this.title = title;
        this.startAt = startAt;
        this.endAt = endAt;
        this.location = location;
    }

    public Long getId() { return id; }
    public Long getOwnerId() { return ownerId; }
    public String getTitle() { return title; }
    public LocalDateTime getStartAt() { return startAt; }
    public LocalDateTime getEndAt() { return endAt; }
    public String getLocation() { return location; }
}
