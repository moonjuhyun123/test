package calendar.common.dto;

import java.util.Collections;
import java.util.List;

public final class PagedResponse<T> {

    private final List<T> items;
    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;
    private final boolean hasNext;

    public PagedResponse(List<T> items, int page, int size, long totalElements) {
        this.items = items == null ? Collections.emptyList() : items;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = size == 0 ? 0 : (int) Math.ceil(totalElements / (double) size);
        this.hasNext = (page + 1) < this.totalPages;
    }

    public static <T> PagedResponse<T> empty(int page, int size) {
        return new PagedResponse<>(Collections.emptyList(), page, size, 0);
    }

    public List<T> getItems() { return items; }
    public int getPage() { return page; }
    public int getSize() { return size; }
    public long getTotalElements() { return totalElements; }
    public int getTotalPages() { return totalPages; }
    public boolean isHasNext() { return hasNext; }
}
