# SideQuest 4b – Mockito Testing

> **Datum:** 22.06.2025

> **Teammitglieder & Beiträge:**
>
> * Yanis Sebastian Zürcher – Unit Tests, Dokumentation
> * Jason Bichsel – Recherche
> * Dominik Könitzer – Recherche

---

## Teil 1 – Theorie

### Was ist Mockito?

Mockito ist ein beliebtes Java-Framework zum Erstellen von Mocks, also simulierten Objekten, die das Verhalten realer Komponenten nachahmen. Dadurch können Unit Tests gezielt auf einzelne Komponenten fokussieren, ohne auf externe Systeme wie Datenbanken oder Netzwerke angewiesen zu sein.

Mockito erlaubt es, Methodenaufrufe zu beobachten, vordefinierte Antworten zu simulieren und Interaktionen zwischen Komponenten zu verifizieren.

---

### Mockito-Annotationen

| Annotation     | Beschreibung                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------ |
| `@Mock`        | Erstellt ein Mock-Objekt ("leeres" Verhalten, kann mit `when(...).then...` gesteuert werden)     |
| `@Spy`         | Erstellt eine Teil-Attrappe, bei der echte Methoden verwendet werden, sofern nicht überschrieben |
| `@Captor`      | Erlaubt das Abfangen und Prüfen von Argumenten, die an Methoden übergeben wurden                 |
| `@InjectMocks` | Injiziert automatisch Mocks in das zu testende Objekt                                            |

---

### Vergleich @Mock vs. @Spy

| Merkmal          | @Mock                                                | @Spy                                 |
| ---------------- | ---------------------------------------------------- | ------------------------------------ |
| Echtes Verhalten | Nein, alle Methoden müssen explizit definiert werden | Ja, echtes Verhalten bleibt erhalten |
| Anwendung        | Ideal für Abhängigkeiten ohne Logik                  | Ideal für Überwachung echter Logik   |

**Beispiel:**

```java
@Mock
UserRepository userRepo;

@Spy
GamificationService gamificationService = new GamificationService(userRepo);
```

Mit `@Spy` kann man z. B. echte Logik im Service ausführen und gleichzeitig Interaktionen prüfen.

---

### Nutzen von Mockito im Vergleich zu 4A

In SideQuest 4A wurden grundlegende Tests mit JUnit erstellt, jedoch ohne tiefe Verifikation interner Abläufe.
Mit Mockito wurde dies in SideQuest 4B verbessert:

* Es wurden Interaktionen über `verify(...)` geprüft
* Verhalten von Services konnte isoliert beobachtet werden
* Komplexe Abhängigkeiten wurden mittels `@InjectMocks` korrekt zusammengesetzt

Mockito ermöglicht damit eine höhere Testtiefe und bessere Fehlerlokalisierung.

---

## Teil 2 – Praxis

### Verbesserte Tests mit Mockito

**Ziel:** Optimierung der Tests aus 4A durch:

* Zusätzliche Mockito-Annotationen (@Mock, @Spy)
* Bessere Kontrolle über Repository-Interaktionen
* Überwachung von Aufrufen und Zustandsveränderungen

### Neue Tests mit Mockito

Im Projekt wurden unter anderem folgende Mockito-basierte Tests erstellt:

* `testComplexServiceInteraction_WithSpyAndMock_ShouldVerifyAllCalls`
* `testServiceDependencyChain_WithSpyAndMock_ShouldTrackInteractions`

**Genutzte Techniken:**

* `argThat(...)` zur detaillierten Objektverifikation
* `verify(...)` zur Kontrolle von Methodenaufrufen
* Kombination von echten Services mit gemockten Repositories (z. B. GamificationService)

> [!important]
> siehe [ForumApplicationTests.java](https://github.com/lyfe691/wiss-forum/blob/main/backend/src/test/java/ch/wiss/forum/ForumApplicationTests.java)

---

### Maven Testlauf

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
WARNING: A Java agent has been loaded dynamically (C:\Users\sebiz\.m2\repository\net\bytebuddy\byte-buddy-agent\1.15.11\byte-buddy-agent-1.15.11.jar)
WARNING: If a serviceability tool is in use, please run with -XX:+EnableDynamicAgentLoading to hide this warning
WARNING: If a serviceability tool is not in use, please run with -Djdk.instrument.traceUsage for more information
WARNING: Dynamic loading of agents will be disallowed by default in a future release
Java HotSpot(TM) 64-Bit Server VM warning: Sharing is only supported for boot loader classes because bootstrap classpath has been appended
17:54:37.183 [main] INFO ch.wiss.forum.service.GamificationService -- User testuser leveled up to level 2
17:54:37.190 [main] INFO ch.wiss.forum.service.GamificationService -- Updated user testuser stats for topic creation
17:54:37.237 [main] INFO ch.wiss.forum.security.JwtUtils -- JWT key initialized successfully
17:54:37.464 [main] INFO ch.wiss.forum.service.GamificationService -- User testuser leveled up to level 2
17:54:37.464 [main] INFO ch.wiss.forum.service.GamificationService -- Updated user testuser stats for topic creation
17:54:37.471 [main] INFO ch.wiss.forum.service.GamificationService -- Updated user javaexpert stats for topic creation
17:54:37.480 [main] INFO ch.wiss.forum.service.GamificationService -- Updated user newuser stats for post creation
[INFO] Tests run: 10, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.355 s -- in ch.wiss.forum.ForumApplicationTests
[INFO] 
[INFO] Results:
[INFO]
[INFO] Tests run: 10, Failures: 0, Errors: 0, Skipped: 0
[INFO]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  2.767 s
[INFO] Finished at: 2025-06-22T17:54:37+02:00
[INFO] ------------------------------------------------------------------------
```

> [!important]
> `[INFO] Tests run: 10, Failures: 0, Errors: 0, Skipped: 0`

Alle Tests wurden erfolgreich ausgeführt, inklusive der neuen Mockito-basierten Tests.

---

## Fazit

Durch den Einsatz von Mockito wurde die Testqualität deutlich gesteigert. Komplexe Abhängigkeiten konnten isoliert getestet werden. Die Annotationen `@Mock`, `@Spy` und `@InjectMocks` wurden korrekt eingesetzt, und es konnten interne Abläufe sowie Interaktionen gezielt verifiziert werden.

Damit ist SideQuest 4B in vollem Umfang abgeschlossen und erfüllt alle Anforderungen gemäss Bewertungsschema.
