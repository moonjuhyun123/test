package calendar.common.util;

import calendar.common.exception.ResourceNotFoundException;

public final class OwnershipGuard {

    private OwnershipGuard() {}

    public static void requireOwner(Long resourceOwnerId, Long currentUserId) {
        if (resourceOwnerId == null || currentUserId == null
                || !resourceOwnerId.equals(currentUserId)) {
            throw ResourceNotFoundException.ownerMismatch();
        }
    }
}
