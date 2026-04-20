package calendar.common.api;

import calendar.common.type.UserRole;

public interface CurrentUser {

    Long getId();

    String getLoginId();

    UserRole getRole();

    boolean isAuthenticated();
}
