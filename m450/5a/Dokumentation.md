# SideQuest 5a – Selenium Implementation im WISS Forum

> **Datum:** 29.06.2025
> **Projekt:** WISS Forum – Selenium UI Testing
> **Teammitglieder & Beiträge:**
>
> * Yanis Sebastian Zürcher – Dokumentation & Umsetzung
> * Jason Bichsel – Recherche
> * Dominik Könitzer – Recherche

---

## Übersicht

Diese Dokumentation umfasst die Planung, Entwicklung und Analyse der automatisierten UI-Tests für das WISS Forum Projekt mittels Selenium WebDriver. Ergänzend wurden auch Tests mit der Selenium IDE aufgezeichnet und exportiert. Das Ziel war, repetitive Prozesse in der Weboberfläche zu automatisieren, um manuelle Testaufwände zu minimieren.

Die Tests basieren auf einem realen, produktionsähnlichen Web-Frontend mit TailwindCSS und shadcn/ui-Komponenten, was zu erhöhter Komplexität führte, insbesondere beim Selektieren und Interagieren mit DOM-Elementen. Trotz dieser Herausforderungen wurde eine vollständige Test-Suite implementiert.

---

## Teil 1 – Theorie

Ein umfassendes Cheat-Sheet zu allen relevanten Selenium-Techniken befindet sich in der Datei [`Selenium Theory Cheatsheet`](./assets/cheatsheet.md). Darin enthalten sind u. a.:

* Strategien zur Lokalisierung von Elementen (id, class, cssSelector, etc.)
* Vergleich der Selektor-Methoden
* Maus- und Tastatureingaben
* Umgang mit Antwortverzögerungen durch `WebDriverWait`
* Möglichkeiten zur Informationsabfrage von Webelementen

Anhang: [`Selenium Theory Cheatsheet`](./assets/cheatsheet.md)

---

## Teil 2 – Testplanung und Implementierung

### Geplante Prozesse:

1. Registrierung mit ungültigem Benutzernamen (z. B. admin)
2. Registrierung mit ungültiger E-Mail-Domain
3. Login mit nicht existierendem Benutzer
4. Registrierung und erfolgreicher Login
5. Admin-Rollenvergabe via Admin-Tool
6. Kategorisierung und Erstellung eines Themas (kompletter Workflow)

Die Umsetzung erfolgte mit JUnit + Selenium in Kombination mit Page-Object-Pattern zur besseren Wartbarkeit und Strukturierung. Es wurden separate Page-Klassen für Navigation, Registrierung, Login, Admin-Tool, Kategorienverwaltung und Beitragserstellung erstellt.

Alle Tests sind unter folgendem Repository-Abschnitt einsehbar:
🔗 [https://github.com/lyfe691/wiss-forum/tree/main/backend/src/test/java/ch/wiss/forum/selenium](https://github.com/lyfe691/wiss-forum/tree/main/backend/src/test/java/ch/wiss/forum/selenium)

---

## Teil 3 – Analyse und Ergebnisse

Alle Tests wurden mit `mvn test` erfolgreich ausgeführt. Der gesamte Ablauf ist nachvollziehbar und deckt die wesentlichen Prozesse der Anwendung ab. Eine Besonderheit war der vollständige Workflow-Test, welcher Benutzeranlage, Admin-Promotion, Kategorisierung und Topic-Erstellung kombiniert und alle Zwischenschritte auf Konsolenebene dokumentiert.

Einige Herausforderungen:

* Die Kombination aus TailwindCSS und shadcn/ui erzeugt komplexe HTML-Strukturen → viele DOM-Elemente sind nicht trivial klickbar.
* Einige Dropdowns mussten über JavaScript selektiert werden.
* Warten auf dynamische Inhalte (z. B. Toasts, automatische Weiterleitungen) erforderte präzise `ExpectedConditions`.

---

## Teil 4 – Selenium IDE Vergleich

Ein Test wurde zusätzlich mit der Selenium IDE aufgezeichnet und als Java JUnit Code exportiert. Im Vergleich zum handgeschriebenen Test ist der generierte Code:

* weniger strukturiert (kein Page-Object-Pattern)
* fehleranfälliger bei dynamischen Seiten
* schwieriger zu erweitern

Fazit: Die IDE ist hilfreich zum schnellen Prototyping, ersetzt aber keine saubere Testarchitektur.

---

## Anhang: Workflow-Video

Das folgende Video zeigt einen vollständigen Durchlauf des komplexesten Tests:

🎥 [`Workflow Video`](./assets/videos/s.mp4)

---

## Fazit

Trotz der Komplexität des Frontends wurden alle geplanten UI-Prozesse erfolgreich automatisiert. Die Arbeit war aufwendig, hat sich aber gelohnt: Die Test-Suite erlaubt eine verlässliche Validierung des WISS Forums mit jedem Deployment. Das Projekt stellt damit eine solide Basis für Continuous Testing im Frontend dar.
