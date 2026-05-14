# Roadtrippers E2E Test Automation Suite

A robust, enterprise-ready automated test suite leveraging **Playwright** and **TypeScript** to verify the core trip-planning ecosystem of [Roadtrippers](https://roadtrippers.com).

## 🚀 Setup Instructions

Ensure you have [Node.js](https://nodejs.org) installed, then execute the following commands in your terminal:

1. **Clone & Navigate to the Project Folder:**
   ```bash
   cd part1-automation
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Install Required Browser Binaries:**
   ```bash
   npx playwright install chromium
   ```

## 🛠 Execution Instructions

*   **Run Entire Test Suite (Headless Mode):**
    ```bash
    npx playwright test
    ```

*   **Run Tests with Visible Browser (Headed Mode):**
    ```bash
    npx playwright test --headed
    ```

*   **Open Interactive UI Mode (Best for Debugging):**
    ```bash
    npx playwright test --ui
    ```

*   **Generate and View HTML Test Report:**
    ```bash
    npx playwright show-report
    ```

## 📁 Project Architecture

*   `pages/MapPage.ts` — Implements the **Page Object Model (POM)** pattern. It encapsulates all application state selectors, explicit wait handlers, and interactive helper methods.
*   `tests/roadtrippers.test.ts` — Contains **5 distinct automated specs** evaluating core business requirements (Happy Paths, Edge Cases, and Validation Failures).

## ⚖️ Architectural Decisions & Trade-offs

Given the constrained time budget of this technical assignment, the following tactical engineering trade-offs were made:

*   **Explicit Static Waits (`waitForTimeout`):** Roadtrippers initializes complex map configurations and non-deterministic marketing overlays asynchronously. A dedicated 5-second padding wait was added at the beginning of `handlePopups()` to allow late-rendering dialogs (such as the "Start Exploring" panel) to successfully attach to the DOM before validation. Additionally, typing sequences (`pressSequentially`) leverage static pauses to handle real-time API autocomplete popups. In a production suite, these would be refactored into strict `page.waitForResponse()` hooks tracking specific backend network streams.
*   **Sequential Popup/Banner Recovery:** Roadtrippers surfaces high-frequency marketing modals, OneTrust cookie shields, and trial iframes. To keep execution reliable yet fast, a non-blocking sequential recovery method was engineered inside `handlePopups()` using tailored 1.5-second `waitFor` timeouts paired with inline `.catch()` omissions. A native production enhancement would involve bypassing these panels completely by planting predetermined local storage flags and authorization tokens during a global test setup phase.
*   **Hardcoded Test Fixture Data:** Core location benchmarks (e.g., `'San Francisco'`, `'Los Angeles'`) are instantiated directly within the test file. To support localization or international data matrices in scale, these inputs would be moved to an external, type-safe JSON data layer.
*   **Dynamic Sequencing vs Canvas Grabs:** The core canvas element utilizes WebGL mapping configurations making traditional text node selectors unreadable. Rather than relying on extremely fragile browser pixel offset tracking (which breaks on differing screen distributions), automation priorities shifted to asserting against the structured, responsive DOM components of the itinerary panel—using advanced `.nth()` locator chaining arrays to validate exact round-trip position markers (e.g., confirming San Francisco switches sequence indexes dynamically from Stop `1` to Stop `3`).
