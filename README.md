# Grand Theatre — Interactive Venue Ticketing System (WM1 Project)

An interactive front-end web application for venue ticket selection built using HTML5, CSS3, and Vanilla JavaScript. The system dynamically generates an auditorium-style theatre map from a JavaScript data model, allowing users to inspect seats, manage a cart, navigate the layout, and persist state via `localStorage`.

---

## Key Features

- **Dynamic Seat Map Rendering:** Generates sections, rows, and seats programmatically from a JavaScript data structure.
- **Seat States & Inspection Panel:** Supports four distinct seat states (`available`, `inspected`, `in-cart`, `unavailable`). Clicking an available seat displays details prior to cart addition.
- **Cart Management & Synchronization:** Adds seats to a cart with duplicate prevention, calculates total price, and synchronizes deletion back to the seat map.
- **State Persistence:** Preserves selected tickets and map states across page refreshes using browser `localStorage`.
- **Venue Navigation Controls:** Interactive controls for zooming (`Zoom In`, `Zoom Out`), directional panning (`Up`, `Down`, `Left`, `Right`), and view resetting (`Reset View`).
- **Responsive Layout:** Adaptive design optimized for desktop, tablet, and mobile device viewports.
- **Bonus Interaction (+10%):** Mouse-wheel zooming and click-and-drag map panning functionality.

---

## Project Structure

interactive-venue-ticketing/
├── index.html   # Main HTML layout structure
├── style.css    # Layout styling, responsive rules, and seat state color themes
├── app.js       # Core venue data model, DOM rendering, cart logic, and event handling
└── README.md    # Project documentation and setup guide

---

## How to Run

1. Clone or download this repository.
2. Open `index.html` directly in any modern web browser.
3. No external dependencies, npm modules, or backend server installation required.