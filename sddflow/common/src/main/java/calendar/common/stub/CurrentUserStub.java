package calendar.common.stub;

import calendar.common.api.CurrentUser;
import calendar.common.type.UserRole;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("local")
public class CurrentUserStub implements CurrentUser {

    @Override
    public Long getId() {
        return 1L;
    }

    @Override
    public String getLoginId() {
        return "stub-user";
    }

    @Override
    public UserRole getRole() {
        return UserRole.USER;
    }

    @Override
    public boolean isAuthenticated() {
        return true;
    }
}
