# SideQuest 3b – Systematische Testplanung

> **Datum:** 22.06.2025

> **Teammitglieder & Beiträge:**
>
> - Yanis Sebastian Zürcher - Dokumentation
> - Jason Bichsel - Recherche
> - Dominik Könitzer - Recherche




## Einleitung

Im Rahmen der Aufgabe 3b wurde die bestehende Testplanung überprüft, systematisch kategorisiert und erweitert. Zudem wurden vier fehlende Systemtests im Detail ausgearbeitet, um die Qualitätssicherung der Applikation "WISS Forum" weiter zu verbessern.

---

## 1. Kategorisierung bestehender Tests

| Testfall | Beschreibung                                             | Testart(en)                            |
| -------- | -------------------------------------------------------- | -------------------------------------- |
| T-001    | Registrierung mit validen Daten                          | Funktionstest, Sicherheitstest         |
| T-002    | Beitragserstellung als eingeloggter Benutzer             | Funktionstest, UI-/Usabilitytest       |
| T-003    | Punktevergabe bei Aktivität & Leaderboard-Aktualisierung | Funktionstest, Performanztest, UI-Test |

**Ergänzte Testart:**

* **Zugänglichkeitstest (Accessibility Testing)**

Diese Testart wurde bisher nicht berücksichtigt, ist aber besonders für Web-Applikationen mit schulischem Publikum relevant (Barrierefreiheit, Lesbarkeit, Tastaturnavigation etc.).

---

## 2. Neue Tests für unterrepräsentierte Kategorien

### Test 1: Zugriffsschutz durch Rollen

* **Kategorie:** Sicherheitstest
* **Ziel:** Überprüfung, ob Studierende keinen Zugriff auf Admin-Only-Seiten erhalten
* **Ablauf:** Student versucht per Direkt-URL Zugriff auf Adminbereich
* **Erwartung:** Zugriff verweigert (403 oder Weiterleitung)

### Test 2: Fehlermeldung bei bestehender E-Mail

* **Kategorie:** Fehlertest / UX
* **Ziel:** Fehler bei Registrierung mit bereits verwendeter E-Mail
* **Ablauf:** Benutzer registriert sich mit bekannter E-Mail
* **Erwartung:** Fehlernachricht, kein Datenbankeintrag

---

## 3. Vier zusätzliche detaillierte Systemtests

### S-001: Passwort-Reset über E-Mail

* **Voraussetzung:** Konto existiert
* **Ablauf:** Passwort vergessen -> Email eingeben -> Link empfangen -> neues Passwort setzen
* **Erwartung:** Token wird korrekt versendet, Login mit neuem Passwort möglich

### S-002: Responsive Design auf Mobile

* **Voraussetzung:** Mobile-Gerät oder DevTools
* **Ablauf:** Alle Hauptseiten mit Mobile-Viewport testen
* **Erwartung:** Keine UI-Fehler, Navigation vollständig nutzbar

### S-003: Leaderboard-Skalierung bei 100+ Benutzern

* **Voraussetzung:** Viele Testdaten im Leaderboard
* **Ablauf:** Seite öffnen, Scrollverhalten testen
* **Erwartung:** Performance stabil, Ladezeit < 1s

### S-004: Session-Zeitüberschreitung / Timeout

* **Voraussetzung:** Benutzer ist eingeloggt
* **Ablauf:** Nach 30 Minuten Inaktivität Aktion auslösen
* **Erwartung:** Session abgelaufen, Redirect auf Login

---

## Fazit

Mit der systematischen Erweiterung um neue Testarten, Fehlerfälle und fehlende Systemtests wird eine deutlich bessere Abdeckung erzielt. Die Tests orientieren sich an funktionalen, qualitativen und sicherheitsrelevanten Anforderungen des WISS Forums und stellen die Grundlage für eine verbesserte Release-Qualität dar.
