package calendar.common.stub;

import calendar.common.api.LinkReader;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
@Profile("local")
public class LinkReaderStub implements LinkReader {

    @Override
    public List<Long> findMemoIdsByScheduleId(Long scheduleId) {
        return Collections.emptyList();
    }

    @Override
    public List<Long> findScheduleIdsByMemoId(Long memoId) {
        return Collections.emptyList();
    }
}
