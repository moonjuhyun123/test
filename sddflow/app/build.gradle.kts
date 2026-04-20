plugins {
    id("org.springframework.boot")
}

dependencies {
    implementation(project(":common"))
    implementation(project(":user"))
    implementation(project(":schedule"))
    implementation(project(":memo"))
    implementation(project(":schedule-memo-link"))
    implementation(project(":tag"))
    implementation(project(":attachment"))
    implementation(project(":search"))
    implementation(project(":notification"))

    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    runtimeOnly("com.h2database:h2")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
}
