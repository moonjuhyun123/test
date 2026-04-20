package calendar.common.event;

import calendar.common.type.ResourceType;

import java.time.LocalDateTime;

public final class ResourceDeletedEvent {

    private final ResourceType resourceType;
    private final Long resourceId;
    private final Long ownerId;
    private final LocalDateTime occurredAt;

    public ResourceDeletedEvent(ResourceType resourceType, Long resourceId, Long ownerId) {
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.ownerId = ownerId;
        this.occurredAt = LocalDateTime.now();
    }

    public ResourceType getResourceType() { return resourceType; }
    public Long getResourceId() { return resourceId; }
    public Long getOwnerId() { return ownerId; }
    public LocalDateTime getOccurredAt() { return occurredAt; }
}
