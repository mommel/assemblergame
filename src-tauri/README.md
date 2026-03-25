# Tauri Setup & Konfiguration für Assembly RPG

Dieses Verzeichnis (`src-tauri`) enthält alles, was benötigt wird, um aus dem web-basierten (React/Vite) Assembly RPG eine eigenständige ausführbare Desktop-Anwendung (`.exe`) zu erstellen.

---

## 🚀 Wie baue und starte ich die App?

Im Hauptverzeichnis des Projekts (da, wo die normale `package.json` liegt), kannst du diese Befehle nutzen:

- **Entwicklungsmodus:** `npm run tauri:dev`
  Startet dein Vite-Frontend und öffnet parallel ein natives Desktop-Fenster. Änderungen in React/Vite (und Rust) werden hier sofort mit Hot-Reload aktualisiert.
  
- **Binary / `.exe` erstellen:** `npm run tauri:build`
  Kompiliert das komplette Spiel (baut zuerst das Vite-Frontend mit `npm run build` und packt es anschließend in einen nativen Rust-Container).
  Die fertige `.exe` bzw. der Installer (`.msi`) findet sich danach im Ordner: 
  `src-tauri/target/release/bundle/`

---

## ⚙️ Die zwei wichtigsten Konfigurationsdateien

### 1. `tauri.conf.json`
Das ist das Hauptkontrollzentrum von Tauri. Hier kannst du das Verhalten des Desktop-Fensters steuern.
*   **Fensterkonfiguration (`app.windows`)**: Hier kannst du die Start-Größe (`width`, `height`), den Fenstertitel (`title`), Vollbildmodus (`fullscreen`) und festlegen, ob das Fenster in der Größe veränderbar ist (`resizable`).
*   **Bundle (`bundle.identifier`)**: Wichtig, falls du die App jemals offiziell veröffentlichen oder updaten möchtest (z.B. `com.assemblyrpg.dev`).
*   **Pfade (`build`)**: Zeigt Tauri, auf welchem Port der Vite-Server läuft (`devUrl`) und wo der finale React-Code für den Release landet (`frontendDist`).

### 2. `Cargo.toml`
Das ist die Konfigurationsdatei für das Rust-Backend (vergleichbar mit deiner `package.json`, aber für Rust).
*   **App Header (`[package]`)**: Hier stehen der Name der `.exe` (`name ="assemblygame"`) und ihre Version (`version = "0.1.0"`).
*   Die Liste unter `[dependencies]` regelt, welche Rust-Erweiterungen mit in die Binary kompiliert werden.

---

## 🎨 Icons anpassen

Aktuell verwendet Tauri ihre Standard-Icons. Diese liegen im Ordner `src-tauri/icons/`.

**So tauschst du sie aus:**
Du musst nicht mühsam 5 verschiedene Formate von Hand machen. Tauri hat ein eingebautes Tool dafür:

1. Bereite ein einzelnes quadratisches, großes Icon (z.B. ein PNG mit 512x512 oder 1024x1024 Pixeln) vor und lege es ins Hauptprojektverzeichnis als `app-icon.png`.
2. Führe im Hauptverzeichnis diesen Befehl aus: 
   `npx tauri icon app-icon.png`
3. Tauri generiert automatisch `.ico`, `.icns` und alle benötigten PNG-Größen und überschreibt die alten Dateien im `icons/` Ordner.

---

## 🛠️ Voraussetzungen: C++ Build Tools & Rust

Damit Tauri (`npm run tauri:build` oder `npm run tauri:dev`) das Rust-Backend zu einer EXE kompilieren kann, werden auf Windows zwei Dinge benötigt:

### 1. Microsoft Visual Studio C++ Build Tools
Rust nutzt den Linker von Microsoft, um Windowsprogramme herzustellen.
1. Lade dir die [Visual Studio Build Tools](https://visualstudio.microsoft.com/de/visual-cpp-build-tools/) herunter.
2. Führe den Installer aus.
3. Wähle im Installer das Feld **"Desktopentwicklung mit C++"** (Desktop development with C++) an.
4. Stelle sicher, dass an der rechten Seite das **Windows 10/11 SDK** ausgewählt ist (ist meist standardmäßig aktiviert).
5. Klicke auf Installieren.

### 2. Rust installieren
1. Gehe auf [rustup.rs](https://rustup.rs/) und lade dir die `rustup-init.exe` herunter.
2. Führe sie aus (ein kleines schwarzes Text-Fenster öffnet sich).
3. Drücke dort einfach `1` für die Standardinstallation und Enter.
4. **WICHTIG:** Nach der Installation der Build Tools und von Rust musst du dein Terminal, VS Code (oder Cursor) **einmal komplett neustarten**, damit die neuen Befehle (`cargo` und `rustc`) erkannt werden.
