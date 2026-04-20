package calendar.common.dto;

import java.time.LocalDateTime;

public final class ScheduleTrigger {

    private final Long id;
    private final Long ownerId;
    private final String title;
    private final LocalDateTime startAt;
    private final int remindBeforeMinutes;

    public ScheduleTrigger(Long id, Long ownerId, String title,
                           LocalDateTime startAt, int remindBeforeMinutes) {
        this.id = id;
        this.ownerId = ownerId;
        this.title = title;
        this.startAt = startAt;
        this.remindBeforeMinutes = remindBeforeMinutes;
    }

    public Long getId() { return id; }
    public Long getOwnerId() { return ownerId; }
    public String getTitle() { return title; }
    public LocalDateTime getStartAt() { return startAt; }
    public int getRemindBeforeMinutes() { return remindBeforeMinutes; }
}
