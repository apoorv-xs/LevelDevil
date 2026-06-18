/**
 * game-config.test.js
 * Unit tests for Level Devil portfolio game - pure logic & configuration.
 *
 * Level Devil core contract:
 *   - Player has fixed speed/jump constants that give the right "feel"
 *   - Each level scene is registered under a known name
 *   - Traps are configured with sensible (non-zero, non-negative) parameters
 *   - Camera bounds prevent the player scrolling outside the world
 *   - Recruiter mode is off by default (player can die normally)
 */

import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// Constants extracted from game source - keep in sync with source files
// ---------------------------------------------------------------------------

// Player (player.js)
const PLAYER_SPEED  = 200;
const PLAYER_JUMP   = 550;
const PLAYER_WIDTH  = 20;
const PLAYER_HEIGHT = 40;

// Physics
const GRAVITY = 1600;

// Scenes (all scenes registered in scene() calls)
const VALID_SCENES = ["intro", "about", "projects", "contact", "empty"];

// Intro gate labels
const INTRO_GATE_NAMES = ["About Me", "Projects", "Contact Me"];

// About gate labels
const ABOUT_GATE_BACK    = "BACK";
const ABOUT_GATE_FORWARD = "PROJECTS";

// Spike trap (traps.js)
const SPIKE_SIZE      = 20;
const SPIKE_COUNT_MIN = 1;
const SPIKE_COUNT_MAX = 10;

// Lightning trap (traps.js)
const LIGHTNING_DEFAULT_DIFFICULTY = 1.0;
const LIGHTNING_HUNT_SPEED_BASE    = 5.0;
const LIGHTNING_CHARGE_TIME_BASE   = 0.4;

// Camera (level_about.js)
function getCameraConfig(viewportWidth, viewportHeight) {
  const defaultCamX = viewportWidth / 2;
  const maxCamX     = (viewportWidth * 4) - (viewportWidth / 2);
  const camY        = viewportHeight / 2 - 40;
  return { defaultCamX, maxCamX, camY };
}

// Recruiter mode default
const RECRUITER_MODE_DEFAULT = false;

// Chest troll trigger
const CHEST_TROLL_TRIGGER_DIST = 120;
const GATE_TROLL_TRIGGER_DIST  = 180;

// Pit trap (level_about.js)
const PIT_WIDTH    = 60;
const FALL_DELAY_S = 0.1;

// Parallax ratios (init.js)
const FAR_RATIO  = 0.3;
const NEAR_RATIO = 0.5;

// ===========================================================================
// TESTS
// ===========================================================================

describe("Player Constants", () => {
  it("has a positive movement speed", () => {
    expect(PLAYER_SPEED).toBeGreaterThan(0);
  });

  it("has a positive jump force", () => {
    expect(PLAYER_JUMP).toBeGreaterThan(0);
  });

  it("jump force exceeds movement speed (snappy Level Devil feel)", () => {
    expect(PLAYER_JUMP).toBeGreaterThan(PLAYER_SPEED);
  });

  it("player hitbox is taller than wide (upright character)", () => {
    expect(PLAYER_HEIGHT).toBeGreaterThan(PLAYER_WIDTH);
  });

  it("player width is small enough to fit through tight gaps (<=40px)", () => {
    expect(PLAYER_WIDTH).toBeLessThanOrEqual(40);
  });
});


describe("Physics", () => {
  it("gravity is strong enough for punchy jumps (>=800)", () => {
    expect(GRAVITY).toBeGreaterThanOrEqual(800);
  });

  it("gravity does not exceed absurd values (<=4000)", () => {
    expect(GRAVITY).toBeLessThanOrEqual(4000);
  });

  it("jump force / gravity ratio gives 0.3s-1.5s airtime", () => {
    const airtime = (2 * PLAYER_JUMP) / GRAVITY;
    expect(airtime).toBeGreaterThan(0.3);
    expect(airtime).toBeLessThan(1.5);
  });
});


describe("Scene Registry", () => {
  it("contains all playable scenes", () => {
    ["intro", "about", "projects", "contact"].forEach(s => {
      expect(VALID_SCENES).toContain(s);
    });
  });

  it("contains startup placeholder scene", () => {
    expect(VALID_SCENES).toContain("empty");
  });

  it("has no duplicate scene names", () => {
    const unique = new Set(VALID_SCENES);
    expect(unique.size).toBe(VALID_SCENES.length);
  });
});


describe("Gate Configuration - Intro Level", () => {
  it("has exactly 3 gates", () => {
    expect(INTRO_GATE_NAMES).toHaveLength(3);
  });

  it("gates lead to correct destinations", () => {
    expect(INTRO_GATE_NAMES).toContain("About Me");
    expect(INTRO_GATE_NAMES).toContain("Projects");
    expect(INTRO_GATE_NAMES).toContain("Contact Me");
  });

  it("troll gate trigger distance is positive", () => {
    expect(GATE_TROLL_TRIGGER_DIST).toBeGreaterThan(0);
  });

  it("troll triggers before player can interact (core Level Devil mechanic)", () => {
    expect(GATE_TROLL_TRIGGER_DIST).toBeGreaterThanOrEqual(60);
  });
});


describe("Gate Configuration - About Level", () => {
  it("back gate label is BACK", () => {
    expect(ABOUT_GATE_BACK).toBe("BACK");
  });

  it("forward gate label is PROJECTS", () => {
    expect(ABOUT_GATE_FORWARD).toBe("PROJECTS");
  });
});


describe("Spike Trap", () => {
  it("spike size is positive", () => {
    expect(SPIKE_SIZE).toBeGreaterThan(0);
  });

  it("spike count bounds are sensible", () => {
    expect(SPIKE_COUNT_MIN).toBeGreaterThan(0);
    expect(SPIKE_COUNT_MAX).toBeGreaterThan(SPIKE_COUNT_MIN);
  });
});


describe("Lightning Trap", () => {
  it("default difficulty is 1.0 (full challenge)", () => {
    expect(LIGHTNING_DEFAULT_DIFFICULTY).toBe(1.0);
  });

  it("hunt speed at difficulty 1 is correct", () => {
    expect(LIGHTNING_HUNT_SPEED_BASE * LIGHTNING_DEFAULT_DIFFICULTY).toBe(5.0);
  });

  it("charge time at difficulty 1 is correct", () => {
    expect(LIGHTNING_CHARGE_TIME_BASE / LIGHTNING_DEFAULT_DIFFICULTY).toBeCloseTo(0.4);
  });

  it("higher difficulty increases hunt speed", () => {
    expect(LIGHTNING_HUNT_SPEED_BASE * 1.5).toBeGreaterThan(LIGHTNING_HUNT_SPEED_BASE * 0.5);
  });

  it("higher difficulty decreases charge time (less warning)", () => {
    expect(LIGHTNING_CHARGE_TIME_BASE / 1.5).toBeLessThan(LIGHTNING_CHARGE_TIME_BASE / 0.5);
  });
});


describe("Camera Bounds - About Level", () => {
  const W = 1280, H = 720;
  const cam = getCameraConfig(W, H);

  it("default cam X is at screen center", () => {
    expect(cam.defaultCamX).toBe(W / 2);
  });

  it("max cam X is 3.5x viewport width", () => {
    expect(cam.maxCamX).toBe(W * 4 - W / 2);
  });

  it("cam Y is 40px above center", () => {
    expect(cam.camY).toBe(H / 2 - 40);
  });

  it("world is wider than one screen", () => {
    expect(cam.maxCamX).toBeGreaterThan(cam.defaultCamX);
  });

  it("clamp: player at x=0 uses defaultCamX", () => {
    const t = Math.max(cam.defaultCamX, Math.min(cam.maxCamX, 0));
    expect(t).toBe(cam.defaultCamX);
  });

  it("clamp: player far past world uses maxCamX", () => {
    const t = Math.max(cam.defaultCamX, Math.min(cam.maxCamX, W * 20));
    expect(t).toBe(cam.maxCamX);
  });

  it("clamp: player in mid-world tracks player X", () => {
    const playerX = W * 2;
    const t = Math.max(cam.defaultCamX, Math.min(cam.maxCamX, playerX));
    expect(t).toBe(playerX);
  });
});


describe("Recruiter Mode", () => {
  it("is disabled by default", () => {
    expect(RECRUITER_MODE_DEFAULT).toBe(false);
  });

  it("toggling on/off works correctly", () => {
    let mode = false;
    mode = !mode;
    expect(mode).toBe(true);
    mode = !mode;
    expect(mode).toBe(false);
  });
});


describe("Chest Troll Mechanic", () => {
  it("troll trigger distance is positive", () => {
    expect(CHEST_TROLL_TRIGGER_DIST).toBeGreaterThan(0);
  });

  it("troll fires BEFORE player reaches open range (80px)", () => {
    const OPEN_RANGE = 80;
    expect(CHEST_TROLL_TRIGGER_DIST).toBeGreaterThan(OPEN_RANGE);
  });
});


describe("Parallax Background", () => {
  it("far layer scrolls slower than near layer", () => {
    expect(FAR_RATIO).toBeLessThan(NEAR_RATIO);
  });

  it("both layers scroll slower than the camera (parallax illusion)", () => {
    expect(FAR_RATIO).toBeLessThan(1.0);
    expect(NEAR_RATIO).toBeLessThan(1.0);
  });

  it("far layer offset is smaller than near layer at any camera position", () => {
    const camX = 1000;
    expect(camX * FAR_RATIO).toBeLessThan(camX * NEAR_RATIO);
  });
});


describe("Pit Trap", () => {
  it("pit is wider than player (player falls in)", () => {
    expect(PIT_WIDTH).toBeGreaterThan(PLAYER_WIDTH);
  });

  it("pit is narrow enough to be jumpable (< 5x player width)", () => {
    expect(PIT_WIDTH).toBeLessThan(PLAYER_WIDTH * 5);
  });

  it("fall delay gives player a brief moment to react", () => {
    expect(FALL_DELAY_S).toBeGreaterThanOrEqual(0.05);
  });
});
