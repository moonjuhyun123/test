package calendar.common.config;

import calendar.common.exception.ForbiddenException;
import calendar.common.exception.ResourceNotFoundException;
import calendar.common.exception.UnauthorizedException;
import calendar.common.exception.ValidationException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = GlobalExceptionHandlerTest.ThrowController.class)
@Import({GlobalExceptionHandler.class})
@TestPropertySource(properties = {
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration"
})
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mvc;

    @Test
    void unauthorized_mapsTo401_withAuth4010() throws Exception {
        mvc.perform(get("/t/unauthorized"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("AUTH-4010"));
    }

    @Test
    void forbidden_mapsTo403() throws Exception {
        mvc.perform(get("/t/forbidden"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error.code").value("AUTH-4030"));
    }

    @Test
    void notFound_mapsTo404() throws Exception {
        mvc.perform(get("/t/notfound"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("SCHED-4040"));
    }

    @Test
    void validation_mapsTo400() throws Exception {
        mvc.perform(get("/t/validation"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("COMM-4000"));
    }

    @Test
    void unknown_mapsTo500_withComm5000() throws Exception {
        mvc.perform(get("/t/unknown"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error.code").value("COMM-5000"));
    }

    @RestController
    static class ThrowController {

        @GetMapping("/t/unauthorized")
        public void unauthorized() { throw new UnauthorizedException(); }

        @GetMapping("/t/forbidden")
        public void forbidden() { throw new ForbiddenException(); }

        @GetMapping("/t/notfound")
        public void notFound() {
            throw ResourceNotFoundException.of("SCHED-4040", "일정을 찾을 수 없습니다.");
        }

        @GetMapping("/t/validation")
        public void validation() { throw new ValidationException("bad"); }

        @GetMapping("/t/unknown")
        public void unknown() { throw new RuntimeException("boom"); }
    }
}
