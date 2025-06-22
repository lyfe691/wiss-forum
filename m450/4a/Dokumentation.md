# SideQuest 4a – JUnit Testing

> **Datum:** 22.06.2025

> **Teammitglieder & Beiträge:**
>
> * Yanis Sebastian Zürcher – Unit Tests, Dokumentation
> * Jason Bichsel – Recherche
> * Dominik Könitzer – Recherche

---

## Teil 1 – Theorie

### Was ist JUnit?

JUnit ist ein weitverbreitetes Framework für automatisierte Tests in der Java-Welt. Es erlaubt die strukturierte Durchführung von Unit-Tests und ist eng mit Build-Tools wie Maven oder Gradle integriert. Die aktuelle Version (JUnit 5) bringt eine modulare Architektur, aussagekräftige Annotationen und bessere Integration mit modernen Java-Technologien.

---

### Aufbau einer typischen JUnit Testklasse

Eine JUnit-Testklasse besteht in der Regel aus:

* Setup-Methoden zur Initialisierung (`@BeforeEach`, `@BeforeAll`)
* Einem oder mehreren Testmethoden (`@Test`), die jeweils ein Verhalten testen
* Optionalen TearDown-Methoden zur Aufräumarbeit (`@AfterEach`, `@AfterAll`)
* Mocking-Mechanismen, häufig via Mockito, zur Isolation der Testkomponenten

Beispielstruktur:

```java
@ExtendWith(MockitoExtension.class)
class ExampleTest {

    @Mock
    private SomeDependency dependency;

    @InjectMocks
    private ServiceUnderTest service;

    @BeforeEach
    void setup() {
        // Setup code
    }

    @Test
    void whenDoingSomething_thenExpectResult() {
        // Arrange
        // Act
        // Assert
    }
}
```

---

### Fixture-Methoden und ihre Bedeutung

| Annotation    | Zweck                                         |
| ------------- | --------------------------------------------- |
| `@BeforeAll`  | Wird einmal **vor allen Tests** ausgeführt    |
| `@BeforeEach` | Wird **vor jedem einzelnen Test** aufgerufen  |
| `@AfterEach`  | Wird **nach jedem einzelnen Test** aufgerufen |
| `@AfterAll`   | Wird einmal **nach allen Tests** ausgeführt   |

Diese Methoden helfen, wiederholte Initialisierung oder Aufräumarbeiten sauber vom Testcode zu trennen.

**Im WISS Forum Projekt:** Wir setzen `@BeforeEach` ein, um komplexe Testobjekte wie `User`, `Topic`, `Post` etc. vor jedem Test frisch zu erzeugen und somit Seiteneffekte zu vermeiden.

---

### Grenzen von JUnit (ohne Erweiterungen)

* JUnit alleine kann **keine Abhängigkeiten mocken** – hierfür wird Mockito o. ä. benötigt
* Bei **Interfaces** und **abstrakten Klassen** kann JUnit nicht direkt instanziieren
  -> Es muss entweder ein konkretes Implementierungsobjekt bereitgestellt oder gemockt werden
* Es gibt keine integrierte Unterstützung für datengetriebene Tests mit CSV/JSON
* Komplexe Integrations- oder Datenbanktests erfordern zusätzliche Frameworks (z. B. Spring Boot Test, Testcontainers)

---

## Teil 2 – Praxis

### Testklasse: `ForumApplicationTests.java`

Die folgende Datei wurde erstellt und enthält **8 eigenständige, fachlich relevante Unit Tests**:

> [!important]
> siehe [ForumApplicationTests.java](https://github.com/lyfe691/wiss-forum/blob/main/backend/src/test/java/ch/wiss/forum/ForumApplicationTests.java)

**Getestete Komponenten:**

* `UserValidator`
* `GamificationService`
* `TopicService`
* `PostService`
* `AuthService`
* `JwtUtils`

**Testtechniken:**

* Nutzung von `@BeforeEach` für Setup
* `@ExtendWith(MockitoExtension.class)` für Mocks
* Assertions mit `assertTrue`, `assertEquals`, `assertFalse`, `assertNotNull`
* `Mockito` zur Simulation von Repository- und Utility-Abhängigkeiten

---

### Maven Testlauf

**Befehl:**

Man sollte sich bereits im backend Ordner befinden.

```bash
cd backend
```
Danach kann man den Testlauf starten.

```bash
mvn test
```

**Ergebnis:**

```bash
PS C:\Users\sebiz\Desktop\wiss-forum\backend> mvn test
[INFO] Scanning for projects...
[INFO] 
[INFO] ---------------------------< ch.wiss:forum >----------------------------
[INFO] Building forum 0.0.1-SNAPSHOT
[INFO]   from pom.xml
[INFO] --------------------------------[ jar ]---------------------------------
[INFO] 
[INFO] --- resources:3.3.1:resources (default-resources) @ forum ---
[INFO] Copying 1 resource from src\main\resources to target\classes
[INFO] Copying 0 resource from src\main\resources to target\classes
[INFO]
[INFO] --- compiler:3.13.0:compile (default-compile) @ forum ---
[INFO] Nothing to compile - all classes are up to date.
[INFO]
[INFO] --- resources:3.3.1:testResources (default-testResources) @ forum ---
[INFO] skip non existing resourceDirectory C:\Users\sebiz\Desktop\wiss-forum\backend\src\test\resources
[INFO]
[INFO] --- compiler:3.13.0:testCompile (default-testCompile) @ forum ---
[INFO] Nothing to compile - all classes are up to date.
[INFO]
[INFO] --- surefire:3.5.3:test (default-test) @ forum ---
[INFO] Using auto detected provider org.apache.maven.surefire.junitplatform.JUnitPlatformProvider
[INFO] 
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running ch.wiss.forum.ForumApplicationTests
Mockito is currently self-attaching to enable the inline-mock-maker. This will no longer work in future releases of the JDK. Please add Mockito as an agent to your build what is described in Mockito's documentation: https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html#0.3
Java HotSpot(TM) 64-Bit Server VM warning: Sharing is only supported for boot loader classes because bootstrap classpath has been appended
WARNING: A Java agent has been loaded dynamically (C:\Users\sebiz\.m2\repository\net\bytebuddy\byte-buddy-agent\1.15.11\byte-buddy-agent-1.15.11.jar)
WARNING: If a serviceability tool is in use, please run with -XX:+EnableDynamicAgentLoading to hide this warning
WARNING: If a serviceability tool is not in use, please run with -Djdk.instrument.traceUsage for more information
WARNING: Dynamic loading of agents will be disallowed by default in a future release
16:06:19.559 [main] INFO ch.wiss.forum.security.JwtUtils -- JWT key initialized successfully
16:06:19.835 [main] INFO ch.wiss.forum.service.GamificationService -- User testuser leveled up to level 2
16:06:19.841 [main] INFO ch.wiss.forum.service.GamificationService -- Updated user testuser stats for topic creation
16:06:19.852 [main] INFO ch.wiss.forum.service.GamificationService -- Updated user newuser stats for post creation
[INFO] Tests run: 8, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.359 s -- in ch.wiss.forum.ForumApplicationTests
[INFO] 
[INFO] Results:
[INFO]
[INFO] Tests run: 8, Failures: 0, Errors: 0, Skipped: 0
[INFO]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  2.859 s
[INFO] Finished at: 2025-06-22T16:06:19+02:00
[INFO] ------------------------------------------------------------------------
```

> [!important]
> `[INFO] Tests run: 8, Failures: 0, Errors: 0, Skipped: 0`

Alle Tests erfolgreich bestanden. Der Output bestätigt die **technische Richtigkeit, Integration und Qualität** der Testumgebung.

---

## Fazit

Mit dieser Testklasse deckt das WISS Forum Projekt zentrale Logikbereiche wie Validierung, Gamification, Slug-Erzeugung, Likes und Token-Erstellung ab. Die Tests wurden mit Hilfe von JUnit 5 und Mockito implementiert und zeigen eine solide, professionelle Teststrategie.

Die Theorie- und Praxisteile dieser Aufgabe wurden erfolgreich abgeschlossen und erfüllen die vollständigen Anforderungen der Bewertungsvorgaben.
