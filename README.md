# Level Devil 2.5D Spatial Portfolio Engine

> **Architect:** Apoorv A S ([@apoorv_xs](https://x.com/apoorv_xs) / [apoorv-xs](https://github.com/apoorv-xs)) — Creative Technologist & 3D WebUI Architect  
> **Production Core:** [https://apoorv.qzz.io](https://apoorv.qzz.io)  
> **Repository:** `B:\MAIN PORTFOLIO`  
> **Engineering Standard:** 60 FPS Floor (16.6ms frame budget), DPR Clamped, Sub-step Swept Vertical Kinematics, Procedural In-Memory Geometries, Zero Memory Leaks.

---

## 1. Architectural Overview

The **Level Devil 2.5D Spatial Engine** is a hybrid spatial web platform uniting native HTML DOM document flow with a synchronized dual-engine visual layer: a 3D WebGL Three.js projection canvas overlaid by an invisible, high-precision Kaboom.js 2D swept kinematic physics simulation.

Visitors navigate a continuous vertical descent across 5 distinct atmospheric strata (from Stratosphere at 10,000 FT down to Bedrock Touchdown at 0 FT), accompanied by an autonomous **BB-8 Astromech companion droid**. The droid is driven by an in-memory, non-autoregressive decision state machine (**System 1 Brain**) that dynamically classifies visitor intent, leads scrolling descents, avoids trap hazards, inspects contact form elements, and projects an interactive 3D Holographic Obsidian Knowledge Graph.

```
+-----------------------------------------------------------------------------------+
|  Layer 1: Three.js WebGL Canvas (#three-canvas, z-index: 1)                       |
|    - PerspectiveCamera, Sun DirectionalLight + Soft Shadows                      |
|    - Procedural Cel-Shaded BB-8 Mesh Hierarchy (Body, Head Dome, Lenses, Antennas)|
|    - 2D-to-3D Viewport Coordinate Projection Bridge (to3DX, to3DY, to3DVec)       |
|    - 3D Holographic Obsidian Knowledge Graph & Laser Projection Frustum           |
+-----------------------------------------------------------------------------------+
|  Layer 2: Native Semantic DOM Shell (main.portfolio-shell, z-index: 10)           |
|    - 5 Vertical Strata: Stratosphere, Mesosphere, Cloud City, Highlands, Ground   |
|    - Interactive Project Cards, Work Terminal Logs, Telemetry HUD, Contact Card   |
+-----------------------------------------------------------------------------------+
|  Layer 3: Kaboom.js 2D Physics Overlay (#game-canvas, z-index: 100)               |
|    - Transparent 2D Physics Simulation (pointer-events: none)                     |
|    - 3-Sub-Step Swept Vertical Integration, Gravity: 1600 px/s²                   |
|    - 51 Calibrated Landing Rails mapped to DOM elements                           |
+-----------------------------------------------------------------------------------+
|  Layer 4: System 1 Autonomous Companion Brain (system1_brain.js)                  |
|    - Non-autoregressive reactive state machine: 7 typed intent states             |
|    - 60 FPS Telemetry Evaluation: Pathfinding, Hurdle Jumps, Contextual Thoughts  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Core Engine Pillars

### 2.1 Cel-Shaded Three.js BB-8 Droid (`player_3d.js`)
- **Zero-Payload Procedural Construction**: All 3D geometries (17 BufferGeometries, 9 materials) are constructed procedurally in GPU memory. Zero external `.gltf`/`.bin` download latency or asset fetch roundtrips.
- **Visual Aesthetic**: Custom cel-shaded Astromech droid featuring warm retro orange accents (`#ff8c00`), metallic silver chassis panels (`#e0e0e8`), dark optical primary eye lens (`#111115`), secondary sensory photoreceptors (`#00ffff`), blinking antenna telemetry beacon (`#ffd700`), and real-time planar ground shadow receiver.
- **Kinematic Rolling & Head Inertia**:
  - Horizontal movement rotates the spherical chassis about the world X/Z axes proportional to traversed distance: $\Delta \theta = \frac{\Delta x}{R}$.
  - The semi-spherical head dome balances upright via spring-damper lerp physics, tilting into turns with dynamic angular lean and gazing toward mouse coordinates or interactive DOM targets.
- **Victory Emote**:
  - `celebrateVictory()` triggers a celebratory vertical parabolic leap ($h = 2.2$) and 360° spin animation over a 1.6s window with golden antenna beacon strobing, guarded against frame-by-frame timer clobbering.
- **Lifecycle Cleanliness**: Complete resource disposal lifecycle (`dispose()`) freeing all buffers, geometries, materials, and canvas handles upon route unmount.

### 2.2 System 1 Non-Autoregressive Decision Brain (`system1_brain.js`)
The companion acts autonomously via a deterministic, sub-millisecond evaluation loop operating across **7 typed intent states**:

| Intent State | Activation Condition | Actuator Response |
| :--- | :--- | :--- |
| `IDLE_PERCH` | Companion grounded on rail, user reading content | Perches on element, tracks cursor gaze, emits ambient status thoughts |
| `LEAD_DESCENT` | Visitor scrolls downwards or focus is $>100\text{px}$ below | Pathfinds to next lower rail, hops down across platforms to guide reader |
| `LEAD_ASCENT` | Visitor scrolls upwards or focus is $>180\text{px}$ above | Climbs upwards across rails to greet returning visitor |
| `INSPECT_FORM_INPUT`| Input/textarea focused on `/sales` or contact card | Leaps onto input label rail, tilts eye downward to inspect inquiry entry |
| `EVADE_HAZARD` | Grounded rail contains `trap: "spikes"` | Triggers immediate emergency high hurdle jump ($F_y > 600\text{px/s}$) |
| `CATCH_UP_SPRINT` | Companion falls $>450\text{px}$ offscreen | High-velocity horizontal sprint and descent pathfinding to regain viewport |
| `CELEBRATE` | Bedrock landing ($y \ge 3470$) or inquiry submission | Triggers 360° victory leap and celebratory telemetry dispatch |

### 2.3 51 Dual-Surface Calibrated Landing Rails (`ground_rails.json` & `portfolio_engine.js`)
- **Continuous 51-Rail Descent**: 51 calibrated collision rails spanning from the top header bar ($y = 54\text{px}$) down to the bedrock touchdown runway ($y = 3488\text{px}$).
- **3-Sub-Step Swept Vertical Integration**: Physics time delta is clamped to $50\text{ms}$ and solved across 3 discrete sub-steps per frame (`subDt = dt / 3`). Collisions use swept interval evaluation:
  $$y_{\text{prev}} \le y_{\text{rail}} + 0.1 \land y_{\text{rail}} \le y_{\text{next}} + 0.5$$
- **Jump-Through & Ejection Armor**: Upward motion ($v_y < 0$) passes freely through all platforms; swept collision applies strictly to downward falling ($v_y \ge 0$). Lateral horizontal collisions are ignored, completely eliminating side ejection glitches.
- **Reflow-Free Altimeter Telemetry**: Document scroll height and touchdown anchor bounding rectangles are cached during initialization, `syncDOM()`, and resize events. Zero synchronous layout recalculation or `getBoundingClientRect()` thrashing in the 60 FPS update loop.
- **Separation of Concerns**: Horizontal walking ($v_y = 0$) does not trigger downward auto-scrolling. Downward auto-scrolling strictly requires downward vertical velocity ($v_y > 10$) or intentional keyboard/touch down inputs.

### 2.4 Astromech Architect Engine (`player_3d.js` & `portfolio_engine.js`)
- **Player Construct Tool ('F' Hotkey / Laser Springboard)**: Materializes a floating hard-light platform (`width: ~160px`) directly beneath BB-8 with a 6-second decay lifetime, pulsed fade-out, laser audio-visual feedback, and retro thought bubble (`⚡ HARD-LIGHT RAIL DEPLOYED`).
- **Autonomous Chasm Laser Bridging**: Scans for voids between DOM cards (e.g. Maison Anima to Level Devil) and projects an emergency hard-light bridge with a 16px ledge overlap.
- **Autonomous LiDaR Surface Welding**: High-velocity neon spark bursts fire as BB-8 lands on un-scanned DOM elements, welding and locking physical landing rails into the active collision engine.
- **Zero-Leak Disposal**: Comprehensive Three.js mesh, material, and particle pool disposal lifecycles on despawn and route transitions.

---

## 3. Production Benchmarks & Quality Standards

- **Frame Budget**: Strictly locked to 16.6ms (60 FPS floor across desktop, tablet, and mobile).
- **Display Resolution**: Strict DPR clamp via `Math.min(window.devicePixelRatio || 1, 2)` preventing 4K retina fill-rate collapse.
- **Draw Calls**: $\le 50$ draw calls per scene (including shadow mapping).
- **Reflow Budget**: 0 DOM layout queries inside `onUpdate()` / `requestAnimationFrame()` loops.
- **Input Resilience**: Decoupled window-level keyboard listeners and pointer release handlers ensuring seamless manual override and eliminating sticky touch drag lockouts.
- **Content Security Policy**: Comprehensive Azure SWA and Vercel CSP configuration enabling Google Font caches, CDN Tailwind CSS, avatar services, and Discord webhook notifications without security compromise.

---

## 4. Repository Structure

```
B:\MAIN PORTFOLIO\
├── index.html                   # Production Home entry point (5-strata continuous landing)
├── sales.html                   # Dedicated Sales & Client Onboarding entry point
├── shell.js                     # Unified application shell bootstrap & SPA router
├── shell.css                    # Canonical retro terminal visual tokens & styling
├── portfolio_engine.js          # 2D Kaboom physics loop, 51 rails & input orchestration
├── three_engine.js              # Three.js 3D scene, lighting & camera projection bridge
├── player_3d.js                 # Procedural cel-shaded BB-8 mesh, architect & animation controller
├── system1_brain.js             # Non-autoregressive 7-intent autonomous companion brain
├── ground_rails.json            # Calibrated rail coordinates and DOM element bindings
├── fonts.css                    # Local font declarations (Press Start 2P, Courier Prime)
├── fonts/                       # Local preloaded WOFF2 binary fonts
├── workspace/                   # Enterprise CRM client dashboard & telemetry console
│   ├── index.html               # CRM UI layout
│   ├── app.js                   # CRM client state & search filtering
│   └── prospects_data.js        # Verified client intelligence data
├── api/                         # Backend API serverless functions & auth endpoints
├── tests/                       # Automated test suites
│   ├── unit/                    # Vitest unit test suite (game-config, shell, system1-brain)
│   ├── api/                     # Backend API endpoint validation
│   └── e2e/                     # Playwright headless browser end-to-end tests
├── build.js                     # Automated production distribution pipeline
├── package.json                 # Project dependencies & npm test scripts
├── playwright.config.js         # Playwright headless browser configuration
├── vitest.config.js             # Vitest unit test runner configuration
├── staticwebapp.config.json     # Azure Static Web Apps configuration & CSP headers
└── dist/                        # Clean production distribution build (generated)
```

---

## 5. Development & Verification

### Run Unit Test Suite
```bash
npm run test:unit
```
Executes 66 unit tests covering shell configurations, game physics constants, System 1 decision brain intent transitions, and backend API authentication.

### Run Production Build Pipeline
```bash
node build.js
```
Cleans `dist/`, filters out developer tools, test suites, and internal configs, and packages the production application.

### Run End-to-End Headless Browser Verification
```bash
npm run test:e2e
```
Runs Playwright across Chromium, validating WebGL context stability, companion movement, route navigation, and form interaction.
