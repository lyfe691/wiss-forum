# SideQuest 5A – Selenium Cheat-Sheet (Teil 1)

> **Datum:** 28.06.2025
> **Teammitglieder & Beiträge:**
>
> * Yanis Sebastian Zürcher – Dokumentation
> * Jason Bichsel – Recherche
> * Dominik Könitzer – Recherche

---

## Teil 1 – Theorie

### 1. Möglichkeiten zur Lokalisierung von HTML-Elementen

Selenium bietet mehrere Strategien, um HTML-Elemente auf Webseiten zu identifizieren:

| Methode              | Beschreibung                                                      | Beispiel                                                    |
| -------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------- |
| `By.id`              | Sucht ein Element anhand der eindeutigen ID                       | `driver.findElement(By.id("username"))`                     |
| `By.className`       | Sucht ein Element anhand der CSS-Klasse                           | `driver.findElement(By.className("btn"))`                   |
| `By.cssSelector`     | Verwendet CSS-Selektoren zur gezielten Suche                      | `driver.findElement(By.cssSelector("#login-form > input"))` |
| `By.name`            | Sucht nach Attribut `name`                                        | `driver.findElement(By.name("email"))`                      |
| `By.tagName`         | Sucht Elemente anhand ihres Tags (z. B. `input`, `div`, `button`) | `driver.findElement(By.tagName("button"))`                  |
| `By.linkText`        | Sucht einen Link mit exaktem Linktext                             | `driver.findElement(By.linkText("Logout"))`                 |
| `By.partialLinkText` | Sucht einen Link mit Teiltext                                     | `driver.findElement(By.partialLinkText("Log"))`             |
| `By.xpath`           | XPath-Ausdruck zur Navigation im DOM                              | `driver.findElement(By.xpath("//div[@id='main']"))`         |

---

### 2. Vergleich von By.id, By.className und By.cssSelector

| Kriterium   | `By.id`                      | `By.className`                  | `By.cssSelector`                             |
| ----------- | ---------------------------- | ------------------------------- | -------------------------------------------- |
| Einfachheit | Sehr einfach und zuverlässig | Einfach, aber weniger eindeutig | Sehr flexibel, aber komplex                  |
| Performance | Sehr schnell                 | Schnell                         | Etwas langsamer                              |
| Genauigkeit | Sehr hoch (sofern eindeutig) | Gering bei mehreren Klassen     | Sehr hoch, kann komplexe Strukturen abbilden |
| Empfehlung  | Wenn eindeutig vorhanden     | Für einfache Gruppen            | Bei verschachtelten Strukturen               |

**Fazit:** `By.id` ist ideal, wenn IDs vorhanden und eindeutig sind. `By.className` ist nützlich bei UI-Komponenten. `By.cssSelector` ist am flexibelsten, z. B. bei verschachtelten oder dynamischen Elementen.

---

### 3. Tastatur- und Mauseingaben simulieren

Selenium erlaubt das Senden von Tastatur- und Mausaktionen über folgende Methoden:

```java
WebElement input = driver.findElement(By.id("search"));
input.sendKeys("Selenium Cheat Sheet");  // kb

WebElement button = driver.findElement(By.id("submit"));
button.click();  // mouse
```

Für komplexere Eingaben gibt es die `Actions`-Klasse:

```java
Actions actions = new Actions(driver);
actions.moveToElement(element).click().sendKeys("Text").build().perform();
```

---

### 4. Probleme mit Antwortzeiten

Bei Formularen oder Ladeprozessen kann es zu **Verzögerungen** kommen, z. B.:

* Datenbankanfragen
* Serverseitige Validierung
* Dynamisches Nachladen von Inhalten

**Risiko:** Selenium testet zu früh, das Element ist noch nicht sichtbar/interaktiv → Test schlägt fehl.

---

### 5. Lösung: Umgang mit Verzögerungen

Selenium bietet dafür verschiedene **Wait-Mechanismen**:

| Methode            | Beschreibung                                     |
| ------------------ | ------------------------------------------------ |
| `Thread.sleep(ms)` | Statische Wartezeit (nicht empfohlen)            |
| `WebDriverWait`    | Explizites Warten auf bestimmte Bedingungen      |
| `implicitlyWait`   | Wartet automatisch auf jedes Element (max. Zeit) |

**Beispiel (empfohlen):**

```java
WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
WebElement element = wait.until(ExpectedConditions.elementToBeClickable(By.id("submit")));
element.click();
```

---

### 6. Informationen von Webelementen auslesen

Mit Selenium können folgende Eigenschaften geprüft werden:

| Methode                         | Beschreibung                              |
| ------------------------------- | ----------------------------------------- |
| `getText()`                     | Holt den sichtbaren Text eines Elements   |
| `getAttribute("value")`         | Holt den Wert eines Attributes            |
| `getCssValue("color")`          | Holt CSS-Stilwerte                        |
| `isDisplayed()` / `isEnabled()` | Statusabfrage (Sichtbarkeit, Aktivierung) |
| `getLocation()` / `getSize()`   | Position und Grösse des Elements          |

**Beispiel:**

```java
WebElement button = driver.findElement(By.id("submit"));
System.out.println(button.getText());
System.out.println(button.isEnabled());
```

---

## Fazit

Dieses Cheat-Sheet deckt die zentralen Funktionen von Selenium ab, die für UI-Tests im WISS Forum Projekt wichtig sind. Es bildet die Grundlage für automatisierte Testfälle in Teil 2 und 3 dieser Aufgabe.
