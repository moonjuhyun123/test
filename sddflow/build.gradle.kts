plugins {
    java
    id("org.springframework.boot") version "3.3.4" apply false
    id("io.spring.dependency-management") version "1.1.6" apply false
}

allprojects {
    group = "calendar"
    version = "0.0.1-SNAPSHOT"

    repositories {
        mavenCentral()
    }
}

subprojects {
    apply(plugin = "java")
    apply(plugin = "io.spring.dependency-management")

    java {
        toolchain {
            languageVersion.set(JavaLanguageVersion.of(17))
        }
    }

    the<io.spring.gradle.dependencymanagement.dsl.DependencyManagementExtension>().apply {
        imports {
            mavenBom("org.springframework.boot:spring-boot-dependencies:3.3.4")
        }
    }

    tasks.withType<Test> {
        useJUnitPlatform()
    }
}

// 도메인 모듈 간 직접 의존 차단 (CLAUDE.md 헌법 §모듈 격리 원칙)
val commonModuleName = "common"
val domainModules = setOf(
    "user", "schedule", "memo", "schedule-memo-link",
    "tag", "attachment", "search", "notification"
)

subprojects {
    afterEvaluate {
        if (project.name in domainModules) {
            configurations.findByName("implementation")?.dependencies?.forEach { dep ->
                if (dep is ProjectDependency) {
                    val depName = dep.path.removePrefix(":")
                    if (depName in domainModules && depName != project.name) {
                        throw GradleException(
                            "❌ 모듈 격리 위반: ${project.name}이 $depName 에 직접 의존합니다. " +
                            "공통 모듈(common)의 인터페이스/이벤트를 경유하세요."
                        )
                    }
                }
            }
        }
    }
}
