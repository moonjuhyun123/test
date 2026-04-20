package calendar.common.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "test_audit")
public class TestAuditEntity extends BaseEntity {

    @Column(name = "name")
    private String name;

    protected TestAuditEntity() {}

    public TestAuditEntity(String name) {
        this.name = name;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
