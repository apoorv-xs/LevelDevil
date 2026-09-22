# PROJECT SPECIFICATION: Level Devil 2.5D Spatial Portfolio Engine

**Target Root**: `B:\MAIN PORTFOLIO`  
**Version**: 1.0.0  
**Architect**: Apoorv A S (`@apoorv_xs`)  
**Core Domain**: Creative Technology, 2.5D Spatial Interfaces, WebGL & Three.js Systems  

---

## 1. High-Level Vision & Architecture Overview

The **Level Devil 2.5D Spatial Portfolio** is an interactive, hybrid WebGL/DOM web experience. It merges arcade 2D platformer kinematics (built on Kaboom.js) with a real-time cel-shaded 3D Three.js companion (BB-8 droid), synchronized across a continuous 5-strata sky-to-ground vertical descent on the primary route (`/`).

### System Component Architecture

```
+-----------------------------------------------------------------------------------+
|                                 BROWSER VIEWPORT                                  |
+-----------------------------------------------------------------------------------+
|  Layer 1: Three.js Canvas (#three-canvas, z-index: 1)                             |
|    - PerspectiveCamera, Sun DirectionalLight + ShadowMap, Parallax Background     |
|    - 3D BB-8 Mesh Hierarchy: Body sphere, Head dome, Eye lenses, Antennas        |
|    - Coordinate Projection Bridge: to3DX(), to3DY(), to3DVec()                    |
+-----------------------------------------------------------------------------------+
|  Layer 2: DOM Content Shell (main.portfolio-shell, z-index: 10)                   |
|    - 5 Vertical Strata: Stratosphere, Mesosphere, Cloud City, Highlands, Ground   |
|    - Interactive Project Cards, Terminal Logs, Audio Visualizers, Forms           |
+-----------------------------------------------------------------------------------+
|  Layer 3: Kaboom.js Physics Overlay (#game-canvas, z-index: 100)                  |
|    - Transparent 2D Physics Canvas (pointer-events: none)                         |
|    - Player Kinematics: 3-sub-step swept vertical integration, gravity 1600 px/s²|
|    - 51 Calibrated Landing Rails mapped to DOM elements                           |
+-----------------------------------------------------------------------------------+
|  Layer 4: System 1 Autonomous Companion Brain (system1_brain.js)                 |
|    - Non-autoregressive reactive state machine: 7 intent states                    |
|    - Telemetry evaluation loop at 60 FPS: pathfinding, jump force, thought bubbles |
+-----------------------------------------------------------------------------------+
```

---

## 2. Core Subsystems & Technical Invariants

### 2.1 2D Physics & DOM Rail Alignment
- **Hitbox Dimensions**: `36px × 70px` (`rect(36, 70)`, `anchor("bot")`) anchored at bottom-center of the companion.
- **Sub-Step Swept Collision**: 3 sub-steps per frame (`subDt = clampedDt / 3`) with swept vertical bounding:
  $$\text{Collision Condition}: y_{\text{prev}} \le \text{rail.y} + 0.1 \land \text{rail.y} \le y_{\text{next}} + 0.5$$
- **Ground Rails**: 51 calibrated physical rails on `/` mapped to heading tags, project cards, and terminal blocks. Dynamic DOM bounding box rails on `/sales` and `/workspace/`.
- **Form Typing Isolation**: Any typing inside `<input>`, `<textarea>`, or contenteditable fields must block manual movement controls to prevent unintended player actions.

### 2.2 3D Rendering & Companion Synchronization
- **Renderer Settings**: WebGLRenderer with `antialias: true`, `alpha: true`, `powerPreference: "high-performance"`.
- **DPR Clamping Invariant**: Pixel ratio must be strictly clamped via `Math.min(window.devicePixelRatio || 1, 2)`.
- **Coordinate Projection**:
  $$X_{3D} = (X_{2D} - W/2) \cdot \text{scaleX}$$
  $$Y_{3D} = -(Y_{2D} - H/2) \cdot \text{scaleY}$$
- **Draw Call Budget**: $\le 50$ draw calls per scene (including shadow passes).
- **Procedural Construction**: All 3D meshes (BB-8 body, head, eye, antennas, shadow receiver) are procedurally constructed in memory via BufferGeometry without external GLTF downloads.

### 2.3 System 1 Autonomous Companion Brain
- **Intent States**:
  - `IDLE_PERCH`: Companion rests on current rail and surveys surrounding elements.
  - `LEAD_DESCENT`: Downward pathfinding between consecutive vertical rails.
  - `LEAD_ASCENT`: Climbing back up when user scrolls toward the top.
  - `INSPECT_FORM_INPUT`: Interacting with input labels on the `/sales` inquiry form.
  - `EVADE_HAZARD`: Avoiding trap zones.
  - `CELEBRATE`: Victory emote upon reaching the true bedrock touchdown zone ($y \ge 3470$).
  - `CATCH_UP_SPRINT`: High-speed sprint when lagging behind viewport scroll.

### 2.4 Application Shell & Client Routes
- `/` (Home): Continuous 5-strata sky-to-ground interactive landing.
- `/sales` (Sales/Contact): Dedicated client onboarding, project estimation calculator, and lead inquiry form.
- `/workspace/` (Enterprise CRM): Private client intelligence dashboard and telemetry console.

---

## 3. Code Layout & Directory Structure

```
B:\MAIN PORTFOLIO\
├── index.html                   # Root HTML entry point (Home route)
├── sales.html                   # Standalone Sales/Contact entry point
├── shell.js                     # Application shell bootstrap, script loader & SPA router
├── shell.css                    # Global container layout & overlay styling
├── portfolio_engine.js          # Kaboom 2D physics loop, 51 calibrated rails & input orchestration
├── three_engine.js              # Three.js scene, camera projection bridge & lighting
├── player_3d.js                 # 3D BB-8 procedural mesh, materials & procedural animations
├── system1_brain.js             # Non-autoregressive autonomous decision brain
├── ground_rails.json            # Calibrated rail coordinates and DOM bindings
├── kaboom.js                    # Minified Kaboom.js 2D physics engine
├── three.min.js                 # Minified Three.js r128 UMD distribution
├── fonts.css                    # Local font declarations & font-face definitions
├── fonts/                       # Local WOFF2 binary fonts
│   ├── press-start-2p.woff2
│   ├── courier-prime-400.woff2
│   └── courier-prime-700.woff2
├── workspace/                   # Workspace client CRM application
│   ├── index.html               # CRM dashboard UI
│   ├── app.js                   # CRM frontend application logic
│   ├── prospects_data.js        # Mock client intelligence dataset
│   └── manifest.json            # Workspace PWA manifest
├── tests/                       # Automated test suites
│   ├── unit/                    # Vitest unit test suite (game-config, shell-config, system1-brain)
│   ├── api/                     # Backend API & auth route verification
│   └── e2e/                     # Playwright end-to-end headless browser tests
├── build.js                     # Production asset copy & packaging script
├── package.json                 # Project dependencies & npm test scripts
├── playwright.config.js         # Playwright headless browser configuration
├── vitest.config.js             # Vitest unit testing configuration
├── vercel.json                  # Vercel deployment & routing rules
├── staticwebapp.config.json     # Azure Static Web Apps configuration & CSP headers
├── dist/                        # Production build output directory (generated)
├── AUDIT_REPORT.md              # 360° Comprehensive Technical & Performance Audit Report
├── PROJECT.md                   # This project architecture specification
└── .agents/                     # Multi-agent coordination metadata and survey handoffs
```

---

## 4. Verification & Tooling Invariants

### 4.1 Automated Unit Tests
- **Runner**: Vitest v4.1.9
- **Command**: `npm run test:unit`
- **Coverage**: 66 unit tests spanning game physics constants, shell lazy loading, System 1 brain intents, and backend API routing.
- **Standard**: All tests must pass with 0 failures under 500ms execution time.

### 4.2 Production Build Packaging
- **Command**: `node build.js`
- **Output**: Clean compilation into `dist/`.
- **Standard**: `dist/` must exclude all development scripts (`build.js`, `playwright.config.js`, `vitest.config.js`, `collision_editor.js`), test screenshots, and orphaned legacy files.

### 4.3 End-to-End Headless Verification
- **Framework**: Playwright (Chromium)
- **Command**: `npx playwright test`
- **Standard**: Zero WebGL context crashes, zero console errors, full keyboard movement capture, and zero frame-dropping leaks during route navigation.

---

## 5. Architectural Quality Gate & Audit Integration

All code changes and feature expansions must adhere to the remediation specifications defined in `B:\MAIN PORTFOLIO\AUDIT_REPORT.md`:
1. **Memory Lifecycle**: All Three.js objects must expose explicit `dispose()` methods.
2. **DPR Clamping**: All canvas overlays must clamp resolution to `Math.min(window.devicePixelRatio, 2)`.
3. **Event Decoupling**: Keyboard controls must listen on `window` to prevent focus starvation from transparent canvas overlays.
4. **Clean Distribution**: `build.js` must execute recursive cleaning before copying production assets.
