package calendar.common.dto;

public final class TagSummary {

    private final Long id;
    private final Long ownerId;
    private final String name;
    private final Long parentId;
    private final int depth;

    public TagSummary(Long id, Long ownerId, String name, Long parentId, int depth) {
        this.id = id;
        this.ownerId = ownerId;
        this.name = name;
        this.parentId = parentId;
        this.depth = depth;
    }

    public Long getId() { return id; }
    public Long getOwnerId() { return ownerId; }
    public String getName() { return name; }
    public Long getParentId() { return parentId; }
    public int getDepth() { return depth; }
}
