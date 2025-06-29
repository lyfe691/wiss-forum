# SideQuest 6A – Clean Code Prinzipien

> **Datum:** 29.06.2025
>
> **Teammitglieder & Beiträge:**
>
> • Yanis Sebastian Zürcher – Dokumentation & Lösungen
> • Jason Bichsel – Recherche
> • Dominik Könitzer – Recherche

---

## Aufgabe 1 – DRY-Prinzip (Don't Repeat Yourself)

**Problem:**
Die `System.out.println(...)`-Aufrufe wiederholen sich mehrfach mit demselben Muster.

**Lösung (DRY-konform):**

```java
public class DRYExample {
    public static void main(String[] args) {
        printAddition(1, 2);
        printAddition(3, 4);
        printAddition(5, 6);
    }

    public static int add(int a, int b) {
        return a + b;
    }

    public static void printAddition(int a, int b) {
        System.out.println(a + " + " + b + " = " + add(a, b));
    }
}
```

---

## Aufgabe 2 – DRY in TaskManager

**Problem:**
`displayTasks()` wiederholt denselben Block für jede einzelne Task.

**Lösung (DRY-konform, dynamisch):**

```java
public class TaskManager {
    private List<Task> tasks;

    public void displayTasks() {
        for (Task t : tasks) {
            System.out.println("Task: " + t.getName());
            System.out.println("Status: " + t.getStatus());
        }
    }
}
```

---

## Aufgabe 3 – SRP (Single Responsibility Principle)

**Problem:**
Die Klasse `UserAccount` hat mehrere Verantwortungen:

1. Daten halten (name, email)
2. Daten validieren (Logik)

**Lösung (SRP-konform):**

* Die Klasse `UserAccount` sollte **nur** Daten halten und Setter/Getter beinhalten.
* Eine separate Klasse `UserValidator` sollte die Validierung übernehmen:

```java
public class UserValidator {
    public void validate(UserAccount user) {
        // valifation logic
    }
}
```

Dadurch wird jede Klasse nur für *eine* Aufgabe verantwortlich gemacht.

---

## Aufgabe 4 – YAGNI (You Ain't Gonna Need It)

**Problem:**
Die Klasse enthält `geb_datum`, obwohl dies **nicht** Teil der User Story ist. Das widerspricht YAGNI – unnötige Funktionalitäten sollen nicht vorzeitig implementiert werden.

**Lösung:**

```java
public class User {
    private String email;
    private String password;

    public User(String email, String password) {
        this.email = email;
        this.password = password;
    }
}
```

---

## Aufgabe 5 – Prinzipanalyse

```java
public void transferTo(int amount, Account a){
    a.setBalance(a.getBalance() += amount);
}
```

**Verletztes Prinzip:**
**C) SRP – Single Responsibility Principle**

**Begründung:**
`Account` verwaltet seinen eigenen Kontostand **und** übernimmt Logik zur Überweisung auf andere Konten. Die Methode `transferTo` implementiert Geschäftslogik, die besser in eine separate `TransactionService` ausgelagert werden sollte.

---

## Aufgabe 6 – Prinzipanalyse

```java
public class UtilityClass {
    ...
}
```

**Verletztes Prinzip:**
**B) SRP – Single Responsibility Principle**

**Begründung:**
Die Klasse übernimmt zu viele Verantwortungen (Drucken, Mathe, Zufallszahlen, etc.). Jedes davon sollte in einer separaten Utility-Klasse sein, z. B. `MathUtils`, `IOUtils`, `RandomUtils`.

---

## Fazit

Alle Beispiele zeigen typische Verletzungen fundamentaler Clean-Code-Prinzipien. Durch einfache Refactorings können Lesbarkeit, Wartbarkeit und Erweiterbarkeit des Codes deutlich verbessert werden.

