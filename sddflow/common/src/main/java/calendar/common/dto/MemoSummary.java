package calendar.common.dto;

import java.time.LocalDateTime;

public final class MemoSummary {

    private final Long id;
    private final Long ownerId;
    private final String title;
    private final String bodyExcerpt;
    private final LocalDateTime updatedAt;

    public MemoSummary(Long id, Long ownerId, String title,
                       String bodyExcerpt, LocalDateTime updatedAt) {
        this.id = id;
        this.ownerId = ownerId;
        this.title = title;
        this.bodyExcerpt = bodyExcerpt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public Long getOwnerId() { return ownerId; }
    public String getTitle() { return title; }
    public String getBodyExcerpt() { return bodyExcerpt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
