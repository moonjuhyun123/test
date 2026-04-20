package calendar.common.stub;

import calendar.common.api.TagReader;
import calendar.common.dto.TagSummary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
@Profile("local")
public class TagReaderStub implements TagReader {

    @Override
    public List<TagSummary> findByIds(List<Long> ids) {
        return Collections.emptyList();
    }

    @Override
    public boolean existsByIdAndOwner(Long id, Long ownerId) {
        return false;
    }
}
