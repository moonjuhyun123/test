package calendar.common.config;

import calendar.common.util.JsonTime;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

@Configuration
public class JacksonConfig {

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jacksonCustomizer() {
        return builder -> builder
                .serializers(new LocalDateTimeSerializer(JsonTime.FORMATTER))
                .deserializers(new LocalDateTimeDeserializer(JsonTime.FORMATTER))
                .simpleDateFormat(JsonTime.PATTERN);
    }
}
