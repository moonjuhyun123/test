package calendar.common.entity;

import calendar.common.config.JpaAuditingConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.SqlConfig;

import jakarta.persistence.EntityManager;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@DataJpaTest
@Import(JpaAuditingConfig.class)
@TestPropertySource(properties = {
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class BaseEntityAuditingTest {

    @Autowired
    private EntityManager em;

    @Test
    void createdAt_and_updatedAt_arePopulatedOnPersist() {
        TestAuditEntity e = new TestAuditEntity("x");
        em.persist(e);
        em.flush();

        assertNotNull(e.getId());
        assertNotNull(e.getCreatedAt());
        assertNotNull(e.getUpdatedAt());
    }

    @Test
    void updatedAt_changesOnUpdate() throws InterruptedException {
        TestAuditEntity e = new TestAuditEntity("x");
        em.persist(e);
        em.flush();
        var beforeUpdate = e.getUpdatedAt();

        Thread.sleep(20);
        e.setName("y");
        em.flush();

        assertNotNull(e.getUpdatedAt());
        // 같거나 이후 시점. 최소한 null이 아니어야 함.
        org.junit.jupiter.api.Assertions.assertTrue(
                !e.getUpdatedAt().isBefore(beforeUpdate));
    }
}
