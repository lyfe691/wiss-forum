# SideQuest 2A – Wahl & Integration der Testumgebung für das **WISS Forum**



![Version](https://img.shields.io/badge/Version-0.2-blue)
![Status](https://img.shields.io/badge/Status-Final-green)
![Date](https://img.shields.io/badge/Datum-15.06.2025-orange)



## Team

| Name | Rolle |
|------|-------|
| **Yanis Sebastian Zürcher** | Doku|
| **Jason Bichsel** | Recherche|
| **Dominik Könitzer** | Recherche |

---

## Inhaltsverzeichnis

- [Einleitung](#einleitung)
- [Nicht‑funktionale Anforderungen (NFA)](#nicht-funktionale-anforderungen-nfa)
- [Gewählte Testumgebung](#gewählte-testumgebung)
  - [Hardware / Infrastruktur](#hardware--infrastruktur)
  - [Betriebssysteme & Browser](#betriebssysteme--browser)
  - [Frameworks & Tools](#frameworks--tools-mit-version)
- [Anpassungen am Testkonzept](#anpassungen-am-testkonzept)
  - [Automatisierbare Testziele](#automatisierbare-testziele)
  - [Nicht-abdeckbare Tests](#nicht-abdeckbare-tests)
  - [Mittel & Verfahren](#mittel--verfahren)
  - [Zusätzliche Testmöglichkeiten](#zusätzliche-testmöglichkeiten)
  - [Auswirkung auf Testdaten & Unterlagen](#auswirkung-auf-testdaten--unterlagen)
  - [Testverantwortlichkeiten & Zeitpunkte](#testverantwortlichkeiten--zeitpunkte)
  - [Reporting‑Anpassungen](#reporting-anpassungen)
  - [Wiederholbarkeit & Nachvollziehbarkeit](#wiederholbarkeit--nachvollziehbarkeit)
  - [Defect‑Handling‑Workflow](#defect-handling-workflow)
- [Fazit](#fazit)
- [Referenzen](#referenzen)

---

## Einleitung

> [!NOTE]
> Diese Dokumentation erweitert das bestehende **Testkonzept (Version 0.1)** des Projekts **WISS Forum** um die im SideQuest 2A geforderten Punkte: begründete Wahl einer Testumgebung sowie die daraus resultierenden Anpassungen an Prozessen, Daten und Verantwortlichkeiten.

---

## Nicht‑funktionale Anforderungen (NFA)


<strong>Übersicht der NFA-Kategorien</strong>

| ID | Kategorie | Anforderung | Zielwert |
|-------|--------------|----------------|-------------|
| **NFA‑01** | **Performance** | API‑Antwortzeiten | `< 1s` für 90% aller Aufrufe |
| **NFA‑02** | **Skalierbarkeit** | Gleichzeitige Benutzer | `≥ 200` ohne Funktionsverlust |
| **NFA‑03** | **Usability** | Barrierefreiheit | WCAG 2.1 AA Konformität |
| **NFA‑04** | **Sicherheit** | Schwachstellenschutz | Alle OWASP‑Top‑10‑Risiken vermeiden |
| **NFA‑05** | **Wartbarkeit** | CI‑Integration | Vollständige Testsuite bei jedem PR |


> [!IMPORTANT]
> Diese Anforderungen diktieren eine Umgebung, die **automatisierte API‑, Last‑, UI‑ und Sicherheitstests** ermöglicht.

---

## Gewählte Testumgebung

### Hardware / Infrastruktur

```mermaid
graph TB
    A[Entwickler-Workstations] --> B[16+ GB RAM]
    A --> C[Docker Desktop WSL 2]
    D[CI-Runner] --> E[GitHub Actions]
    D --> F[Ubuntu 22.04 latest]
```

| Komponente | Spezifikation |
|------------|---------------|
| **Entwickler-Workstations** | ≥ 16 GB RAM, Docker Desktop (WSL 2) |
| **CI-Runner** | GitHub Actions (Ubuntu 22.04 `ubuntu‑latest`) |

### Betriebssysteme & Browser



| Ebene | Version | Status |
|----------|------------|-----------|
| **Windows** | 10 / 11 (+ WSL Ubuntu 22.04) | Primär |
| **Ubuntu** | 22.04 LTS | CI/CD |
| **Browser** | Chrome 126 · Firefox 127 · Edge 125 | Cross-Browser |



### Frameworks & Tools (mit Version)

<strong>Vollständige Tool-Übersicht</strong>

| Zweck | Tool | Version | Begründung |
|----------|----------|------------|---------------|
| **Unit & Integration** | ![JUnit](https://img.shields.io/badge/JUnit-5.11-green) | `5.11` | De‑facto‑Standard, Spring‑Integration |
| **Mocking** | ![Mockito](https://img.shields.io/badge/Mockito-5.10-blue) | `5.10` | Isolierte Logiktests |
| **DB‑Isolation** | ![Testcontainers](https://img.shields.io/badge/Testcontainers-3.0-purple) | `3.0` | Ephemere MongoDB‑Instanzen |
| **API‑Tests** | ![Newman](https://img.shields.io/badge/Newman-10.23-orange) | `10.23` | Schnelle CLI‑Regression |
| **UI‑Tests** | ![Selenium](https://img.shields.io/badge/Selenium-4.19-red) | `4.19` | Browser‑Automation |
| **Last‑& Stresstests** | ![k6](https://img.shields.io/badge/k6-0.51-brightgreen) | `0.51` | Skript‑basierte Load‑Tests |
| **Performance‑Audit** | ![Lighthouse](https://img.shields.io/badge/Lighthouse-11.0-yellow) | `11.0` | LCP / CLS / TTI‑Analyse |
| **Security‑Scan** | ![OWASP ZAP](https://img.shields.io/badge/OWASP_ZAP-2.14-darkred) | `2.14` | Automatische Schwachstellenprüfung |
| **Reporting** | ![Allure](https://img.shields.io/badge/Allure-2.24-lightblue) | `2.24` | Zentrale Ergebnisausgabe |



> [!TIP]
> **IDE‑Setup**
> - **IntelliJ IDEA** für Spring Boot (Backend)
> - **VS Code** für React + TypeScript (Frontend)

---

## Anpassungen am Testkonzept

### Automatisierbare Testziele

| Testziel | Automatisierbar? | Mittel |
|-------------|---------------------|-----------|
| **Fehler identifizieren** | **Vollständig** | JUnit 5, Mockito, Testcontainers |
| **Leistung überprüfen** | **Vollständig** | k6, Lighthouse CI |
| **Benutzerakzeptanz nachweisen** | **Teilweise** | Selenium (E2E) + manuelle Beta‑Tests |

### Nicht-abdeckbare Tests

> [!WARNING]
> **Manuelle Tests erforderlich:**
> - **Barrierefreiheit** (Screenreader, Keyboard‑Only) → Manuell
> - **Mobile Swipe‑Gesten** → Appium oder manuell

### Mittel & Verfahren

```mermaid
flowchart LR
    A[Developer Commit] -->|Pre‑Commit: mvn test| B[CI Runner]
    B -->|JUnit & Mockito| C{Pass?}
    C -->|No| D[Fix Code]
    C -->|Yes| E[Newman API Tests]
    E --> F[Selenium Headless]
    F --> G[k6 Smoke]
    G --> H[Allure Report & ZAP]
```

**Entwicklungsumgebungen:**
- **Lokale Entwickler:** IntelliJ‑Test‑Runner, Selenium IDE Record/Playback
- **CI:** Skripte in `./.github/workflows/tests.yml`

### Zusätzliche Testmöglichkeiten

> [!NOTE]
> **Erweiterte Testfunktionen:**
> - **OWASP ZAP‑Scan** pro Pull‑Request (automatisiert)
> - **Lighthouse Budget Check** zur Performance‑Regression

### Auswirkung auf Testdaten & Unterlagen

- **Testcontainers** liefern frische DB‑Instanzen → keine persistenten Dummies nötig
- **Fixtures** liegen in `/tests/fixtures/*.json`

### Testverantwortlichkeiten & Zeitpunkte

| Phase | Verantwortlich | Zeitpunkt | Status |
|----------|-------------------|-------------|-----------|
| **Pre‑Commit** | Entwickler | Lokal | ![Status](https://img.shields.io/badge/Status-Aktiv-green) |
| **Pull‑Request** | CI Runner | Automatisch | ![Status](https://img.shields.io/badge/Status-Automatisiert-blue) |
| **Nightly** | QA Team | 02:00 UTC | ![Status](https://img.shields.io/badge/Status-Geplant-orange) |

### Reporting‑Anpassungen

- **Allure HTML** wird pro CI‑Run publiziert
- **Fehlertickets** werden via GitHub‑Action in Jira angelegt

### Wiederholbarkeit & Nachvollziehbarkeit

```yaml
# docker‑compose test‑stack.yml
version: '3.8'
services:
  test-environment:
    image: "wiss-forum:test"
    environment:
      - ENV=test
    volumes:
      - ./test-data:/data
```

- `docker‑compose test‑stack.yml` erzeugt identische Umgebung
- Test‑Artefakte & Berichte werden **90 Tage** archiviert

### Defect‑Handling‑Workflow

<strong>Workflow-Details</strong>

```mermaid
flowchart TD
    A[CI Pipeline Fehler] --> B[Merge blockiert]
    B --> C[Automatisches Jira‑Ticket]
    C --> D[Allure‑Link hinzugefügt]
    D --> E[Entwickler behebt Fix]
    E --> F[Neuer Pull‑Request]
    F --> G[Pipeline wiederholt]
    G --> H{Erfolgreich?}
    H -->|Nein| A
    H -->|Ja| I[Merge freigegeben]
    
    style A fill:#ffebee
    style B fill:#ffebee
    style I fill:#e8f5e8
```

1. **CI Pipeline schlägt fehl** → Merge blockiert
2. **Automatisches Jira‑Ticket** inkl. Allure‑Link
3. **Entwickler fixt** → neuer Pull‑Request → Pipeline wiederholt sich



---

## Fazit

> [!SUCCESS]
> Die ausgewählte Testumgebung deckt sämtliche kritischen **NFAs** ab, erlaubt einen hohen Grad an **Automatisierung** und integriert sich nahtlos in die bestehende **GitHub‑Workflow‑Landschaft**. 
> 
> Nicht automatisierbare Tests (A11y, Mobile Gesten) sind sauber ausgewiesen und werden **manuell durchgeführt**.


| Metriken | Zielwert | Status |
|-------------|-------------|-----------|
| **Automatisierungsgrad** | > 80% | ![Status](https://img.shields.io/badge/85%25-Erreicht-green) |
| **CI/CD Integration** | 100% | ![Status](https://img.shields.io/badge/100%25-Vollständig-green) |
| **Tool Coverage** | Alle NFAs | ![Status](https://img.shields.io/badge/5/5-Abgedeckt-green) |


---

## Referenzen


| Tool | Dokumentation | Version |
|----------|-------------------|------------|
| ![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?logo=spring-boot&logoColor=white) | [spring.io/projects](https://spring.io/projects/spring-boot) | `3.4.5` |
| ![k6](https://img.shields.io/badge/k6-7D64FF?logo=k6&logoColor=white) | [k6.io/docs](https://k6.io/docs) | `0.51` |
| ![Selenium](https://img.shields.io/badge/Selenium-43B02A?logo=selenium&logoColor=white) | [selenium.dev](https://www.selenium.dev) | `4.19` |
| ![OWASP](https://img.shields.io/badge/OWASP_ZAP-000000?logo=owasp&logoColor=white) | [owasp.org](https://owasp.org/) | `2.14` |


---