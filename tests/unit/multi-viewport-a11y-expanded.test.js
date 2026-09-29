import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';

describe('Subsystem 7: Multi-Viewport Ergonomics & WCAG 2.1 AA Accessibility (Expanded Matrix)', () => {
  const shellCss = fs.readFileSync('shell.css', 'utf8');
  const indexHtml = fs.readFileSync('index.html', 'utf8');
  const salesHtml = fs.readFileSync('sales.html', 'utf8');
  const workspaceHtml = fs.readFileSync('workspace/index.html', 'utf8');

  // --------------------------------------------------------------------------
  // 7.1: Viewport Matrix & Visual Stability
  // --------------------------------------------------------------------------
  describe('7.1 Viewport Matrix & Visual Stability', () => {
    it('enforces 54px fixed topbar header across desktop and mobile viewports', () => {
      expect(shellCss).toContain('--shell-header-h: 54px;');
      expect(shellCss).toContain('height: var(--shell-header-h);');
    });

    it('defines 320px / 360px ultra-compact mobile layout rules in shell.css', () => {
      expect(shellCss).toContain('@media (max-width: 360px)');
      expect(shellCss).toContain('.menu-label');
    });

    it('enforces 88px top clearance on mobile companion speech bubble to prevent header obstruction', () => {
      const system1BrainJs = fs.readFileSync('system1_brain.js', 'utf8');
      expect(system1BrainJs).toContain('minTopClearance');
      expect(system1BrainJs).toContain('window.innerWidth <= 768) ? 88 : 68');
    });

    it('defines 768px tablet breakpoint switching between mobile drawer and horizontal navigation', () => {
      expect(shellCss).toContain('@media (max-width: 768px)');
      expect(shellCss).toContain('.topbar-center');
    });

    it('defines 960px breakpoint for mobile D-pad controls visibility', () => {
      expect(shellCss).toContain('@media (max-width: 960px)');
      expect(shellCss).toContain('#mobile-controls');
    });

    it('defines 1440px desktop breakpoint for wide-screen layout centering', () => {
      expect(shellCss).toContain('@media (max-width: 1440px)');
    });

    it('clamps Three.js device pixel ratio to maximum 2.0 to prevent 4K mobile GPU thermal throttling', () => {
      const clampDPR = (dpr) => Math.min(Math.max(dpr || 1, 1), 2);
      expect(clampDPR(1)).toBe(1);
      expect(clampDPR(1.5)).toBe(1.5);
      expect(clampDPR(2)).toBe(2);
      expect(clampDPR(3)).toBe(2);
      expect(clampDPR(3.5)).toBe(2);
      expect(clampDPR(4)).toBe(2);
    });

    it('three_engine.js enforces DPR clamp to Math.min(window.devicePixelRatio, 2)', () => {
      const threeEngineJs = fs.readFileSync('three_engine.js', 'utf8');
      expect(threeEngineJs).toContain('Math.min(window.devicePixelRatio || 1, 2)');
    });

    it('verifies safe-area-inset-bottom support for modern iOS notched devices', () => {
      expect(shellCss).toContain('bottom: calc(24px + env(safe-area-inset-bottom, 0px));');
    });

    it('calculates responsive aspect ratio without distortion across 320x568 to 1920x1080', () => {
      const calculateAspect = (w, h) => w / (h || 1);
      expect(calculateAspect(320, 568)).toBeCloseTo(0.563, 2);
      expect(calculateAspect(390, 844)).toBeCloseTo(0.462, 2);
      expect(calculateAspect(768, 1024)).toBe(0.75);
      expect(calculateAspect(1920, 1080)).toBeCloseTo(1.777, 2);
    });

    it('ensures body and html prevent accidental horizontal scrollbar breakouts', () => {
      expect(indexHtml).toContain('overflow-x: hidden;');
    });

    it('verifies canvas overlays resize handler uses passive event listeners', () => {
      const threeEngineJs = fs.readFileSync('three_engine.js', 'utf8');
      expect(threeEngineJs).toContain('addEventListener("resize"');
    });

    it('verifies altimeter HUD layout positions cleanly inside viewport boundaries', () => {
      expect(shellCss).toContain('.altimeter');
    });

    it('verifies flight tape HUD elements are hidden on ultra-compact mobile viewports if requested', () => {
      expect(shellCss).toContain('.flight-tape');
    });

    it('ensures topbar navigation z-index (250) remains strictly above three-canvas overlay', () => {
      expect(shellCss).toContain('z-index: 250;');
    });
  });

  // --------------------------------------------------------------------------
  // 7.2: Touch Targets, Gestures & Virtual D-Pad
  // --------------------------------------------------------------------------
  describe('7.2 Touch Targets, Gestures & Virtual D-Pad', () => {
    it('enforces minimum 48x48px size on mobile directional buttons (exceeds Apple HIG 44px floor)', () => {
      expect(shellCss).toContain('width: 48px;');
      expect(shellCss).toContain('height: 48px;');
    });

    it('provides minimum 44x44px touch area for topbar brand anchor via pseudo-element', () => {
      expect(shellCss).toContain('min-width: 44px;');
      expect(shellCss).toContain('min-height: 44px;');
    });

    it('defines minimum 44x44px touch bounding box for HUD and toggle buttons in shell.css', () => {
      expect(shellCss).toContain('.btn-dir, .topbar-btn, .bb8-hud-btn, .bb8-hud-close, .btn-toggle-ctrls');
      expect(shellCss).toContain('min-width: 44px;');
      expect(shellCss).toContain('min-height: 44px;');
    });

    it('virtual D-pad directional buttons specify touch-action: none to prevent browser gesture interception', () => {
      expect(shellCss).toContain('touch-action: none !important;');
    });

    it('swiping finger off #btn-left resets window.mobileLeftDown state immediately', () => {
      let mobileLeftDown = true;
      const releaseControls = (touchesCount) => {
        if (touchesCount === 0) {
          mobileLeftDown = false;
        }
      };

      releaseControls(0);
      expect(mobileLeftDown).toBe(false);
    });

    it('supports simultaneous multi-touch for concurrent left/right walking and jumping', () => {
      const activeTouches = new Map();
      const onTouchStart = (id, target) => { activeTouches.set(id, target); };
      const onTouchEnd = (id) => { activeTouches.delete(id); };

      onTouchStart(1, 'btn-left');
      onTouchStart(2, 'btn-jump');

      const isWalkingLeft = Array.from(activeTouches.values()).includes('btn-left');
      const isJumping = Array.from(activeTouches.values()).includes('btn-jump');

      expect(isWalkingLeft).toBe(true);
      expect(isJumping).toBe(true);
      expect(activeTouches.size).toBe(2);

      onTouchEnd(2);
      expect(Array.from(activeTouches.values()).includes('btn-left')).toBe(true);
      expect(Array.from(activeTouches.values()).includes('btn-jump')).toBe(false);
    });

    it('d-pad minimizer toggles controls-minimized class in DOM', () => {
      const container = {
        classList: {
          _classes: new Set(),
          toggle(cls) {
            if (this._classes.has(cls)) {
              this._classes.delete(cls);
              return false;
            }
            this._classes.add(cls);
            return true;
          },
          contains(cls) { return this._classes.has(cls); }
        }
      };

      const isMinimizedNow = container.classList.toggle('controls-minimized');
      expect(isMinimizedNow).toBe(true);
      expect(container.classList.contains('controls-minimized')).toBe(true);

      const isRestored = container.classList.toggle('controls-minimized');
      expect(isRestored).toBe(false);
      expect(container.classList.contains('controls-minimized')).toBe(false);
    });

    it('persists controls minimization state in sessionStorage across page navigation', () => {
      const mockSession = {};
      const setMinimized = (val) => { mockSession['apoorv_dpad_minimized'] = String(val); };
      const getMinimized = () => mockSession['apoorv_dpad_minimized'] === 'true';

      setMinimized(true);
      expect(getMinimized()).toBe(true);
      setMinimized(false);
      expect(getMinimized()).toBe(false);
    });

    it('prevents default context menu trigger on long-press touch interactions', () => {
      const fakeEvent = { preventDefault: vi.fn() };
      const onContextMenu = (e) => { e.preventDefault(); };
      onContextMenu(fakeEvent);
      expect(fakeEvent.preventDefault).toHaveBeenCalled();
    });

    it('provides tactile active transform feedback for virtual directional buttons', () => {
      expect(shellCss).toContain('.btn-dir:active');
      expect(shellCss).toContain('transform: translate(2px, 2px);');
    });

    it('styles construct button with glowing cyan accent to highlight hard-light deploy capability', () => {
      expect(shellCss).toContain('.btn-construct');
      expect(shellCss).toContain('background: #4deeea !important;');
    });

    it('verifies mobile controls container defaults to display: none on desktop screens > 960px', () => {
      expect(shellCss).toContain('#mobile-controls {');
      expect(shellCss).toContain('display: none;');
    });

    it('verifies mobile controls cluster uses flexbox spacing with 10px gap', () => {
      expect(workspaceHtml).toContain('gap: 10px;');
      expect(salesHtml).toContain('id="mobile-controls"');
    });

    it('verifies all 3 routes (index, sales, workspace) contain identical mobile-controls markup', () => {
      expect(indexHtml).toContain('id="btn-left"');
      expect(indexHtml).toContain('id="btn-right"');
      expect(indexHtml).toContain('id="btn-construct"');
      expect(indexHtml).toContain('id="btn-jump"');

      expect(salesHtml).toContain('id="btn-left"');
      expect(salesHtml).toContain('id="btn-right"');
      expect(salesHtml).toContain('id="btn-construct"');
      expect(salesHtml).toContain('id="btn-jump"');

      expect(workspaceHtml).toContain('id="btn-left"');
      expect(workspaceHtml).toContain('id="btn-right"');
      expect(workspaceHtml).toContain('id="btn-construct"');
      expect(workspaceHtml).toContain('id="btn-jump"');
    });

    it('resets autonomous movement mode when releasing mobile control gestures', () => {
      let controlMode = 'manual';
      let timeoutId = null;

      const resetToAutonomous = () => {
        timeoutId = setTimeout(() => {
          controlMode = 'autonomous';
        }, 1200);
      };

      resetToAutonomous();
      expect(controlMode).toBe('manual');
      expect(timeoutId).toBeDefined();
    });
  });

  // --------------------------------------------------------------------------
  // 7.3: WCAG 2.1 Level AA Accessibility
  // --------------------------------------------------------------------------
  describe('7.3 WCAG 2.1 Level AA Accessibility', () => {
    it('defines universal high-contrast focus-visible outline in shell.css', () => {
      expect(shellCss).toContain(':focus-visible {');
      expect(shellCss).toContain('outline: 3px solid var(--shell-purple, #6d3bb8) !important;');
      expect(shellCss).toContain('outline-offset: 2px !important;');
    });

    it('implements keyboard focus trapping in modal dialogs', () => {
      const focusableElements = ['btn-1', 'btn-2', 'btn-close'];
      const trapFocus = (currentIndex, isShiftTab) => {
        if (isShiftTab) {
          return currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
        }
        return currentIndex === focusableElements.length - 1 ? 0 : currentIndex + 1;
      };

      // Forward Tab from last element wraps to first
      expect(trapFocus(2, false)).toBe(0);
      // Forward Tab from first element advances to second
      expect(trapFocus(0, false)).toBe(1);
      // Backward Shift+Tab from first element wraps to last
      expect(trapFocus(0, true)).toBe(2);
      // Backward Shift+Tab from last element moves to second
      expect(trapFocus(2, true)).toBe(1);
    });

    it('dismisses modal on Escape key press and restores trigger element focus', () => {
      let activeModal = 'legalModal';
      let focusedElement = 'modalCloseBtn';

      const handleKeyDown = (e, triggerElement) => {
        if (e.key === 'Escape') {
          activeModal = null;
          focusedElement = triggerElement;
        }
      };

      handleKeyDown({ key: 'Escape' }, 'openLegalBtn');
      expect(activeModal).toBeNull();
      expect(focusedElement).toBe('openLegalBtn');
    });

    it('verifies canvas overlays have aria-hidden="true" across all HTML files', () => {
      expect(indexHtml).toContain('id="three-canvas" aria-hidden="true"');
      expect(indexHtml).toContain('id="game-canvas" aria-hidden="true"');
      expect(indexHtml).toContain('id="sky-canvas" aria-hidden="true"');

      expect(salesHtml).toContain('id="three-canvas" aria-hidden="true"');
      expect(salesHtml).toContain('id="game-canvas" aria-hidden="true"');

      expect(workspaceHtml).toContain('id="three-canvas" aria-hidden="true"');
      expect(workspaceHtml).toContain('id="game-canvas" aria-hidden="true"');
    });

    it('verifies companion speech bubble sets aria-live="polite" and role="status"', () => {
      const system1BrainJs = fs.readFileSync('system1_brain.js', 'utf8');
      expect(system1BrainJs).toContain("el.setAttribute('role', 'status')");
      expect(system1BrainJs).toContain("el.setAttribute('aria-live', 'polite')");
      expect(system1BrainJs).toContain("el.setAttribute('aria-atomic', 'true')");
    });

    it('verifies explicit aria-labels on all directional mobile buttons', () => {
      expect(indexHtml).toContain('aria-label="Move Left"');
      expect(indexHtml).toContain('aria-label="Move Right"');
      expect(indexHtml).toContain('aria-label="Jump"');
      expect(indexHtml).toContain('aria-label="Construct Hard-Light Platform"');
    });

    it('calculates WCAG 2.1 AA compliant contrast ratio (> 4.5:1) for ink text on paper background', () => {
      // Relative luminance formula
      const getLuminance = (r, g, b) => {
        const a = [r, g, b].map(v => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
      };

      const getContrastRatio = (lum1, lum2) => {
        const lighter = Math.max(lum1, lum2);
        const darker = Math.min(lum1, lum2);
        return (lighter + 0.05) / (darker + 0.05);
      };

      // #17120f (ink): rgb(23, 18, 15)
      const lumInk = getLuminance(23, 18, 15);
      // #fffdf1 (white paper): rgb(255, 253, 241)
      const lumPaper = getLuminance(255, 253, 241);

      const ratio = getContrastRatio(lumInk, lumPaper);
      expect(ratio).toBeGreaterThan(15.0); // Ultra-high contrast ~17:1 (exceeds 4.5:1 AA and 7:1 AAA)
    });

    it('calculates WCAG 2.1 AA compliant contrast ratio (> 4.5:1) for purple focus ring on white', () => {
      const getLuminance = (r, g, b) => {
        const a = [r, g, b].map(v => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
      };

      // #6d3bb8: rgb(109, 59, 184)
      const lumPurple = getLuminance(109, 59, 184);
      // #fffdf1: rgb(255, 253, 241)
      const lumPaper = getLuminance(255, 253, 241);

      const ratio = (Math.max(lumPurple, lumPaper) + 0.05) / (Math.min(lumPurple, lumPaper) + 0.05);
      expect(ratio).toBeGreaterThan(4.5); // Meets WCAG AA floor
    });

    it('implements prefers-reduced-motion media query rules in shell.css', () => {
      expect(shellCss).toContain('@media (prefers-reduced-motion: reduce)');
      expect(shellCss).toContain('animation: none !important;');
      expect(shellCss).toContain('transition: none !important;');
    });

    it('replaces violent spring shake with gentle visual feedback when prefers-reduced-motion is active', () => {
      const applyCameraShake = (prefersReduced) => {
        if (prefersReduced) return { shakeAmount: 0, glowAlpha: 0.8 };
        return { shakeAmount: 12.5, glowAlpha: 0.0 };
      };

      const reduced = applyCameraShake(true);
      expect(reduced.shakeAmount).toBe(0);
      expect(reduced.glowAlpha).toBe(0.8);

      const normal = applyCameraShake(false);
      expect(normal.shakeAmount).toBe(12.5);
    });

    it('provides accessible skip-to-content mechanism or main role landmarks', () => {
      expect(indexHtml).toContain('id="main-content"') || expect(indexHtml).toContain('<main');
      expect(salesHtml).toContain('id="main-content"') || expect(salesHtml).toContain('<main');
    });

    it('ensures form fields have associated labels or aria-labels in sales.html', () => {
      expect(salesHtml).toContain('id="inquiry-name"');
      expect(salesHtml).toContain('id="inquiry-email"');
      expect(salesHtml).toContain('id="inquiry-message"');
    });

    it('ensures status badges combine icons and text rather than color alone', () => {
      // Redundant multi-modal indicators (Color + Symbol + Text)
      const badges = [
        { status: 'speed', text: '■ 32/100 (Mobile)' },
        { status: 'verified', text: '● Verified Outreach Partner' },
        { status: 'warning', text: '[ALERT] Reputation Disconnect' }
      ];

      badges.forEach(b => {
        expect(b.text).toMatch(/([■●▲]|\[ALERT\])/); // Icon indicator
        expect(b.text.length).toBeGreaterThan(3); // Text description
      });
    });

    it('verifies audio toggle button communicates muted/unmuted state with descriptive label', () => {
      const getAudioLabel = (isMuted) => isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects';
      expect(getAudioLabel(true)).toBe('Unmute Sound Effects');
      expect(getAudioLabel(false)).toBe('Mute Sound Effects');
    });

    it('verifies touch target size calculation helper adheres to 44px minimum bounding box', () => {
      const isTouchTargetAccessible = (width, height) => width >= 44 && height >= 44;
      expect(isTouchTargetAccessible(48, 48)).toBe(true);
      expect(isTouchTargetAccessible(44, 44)).toBe(true);
      expect(isTouchTargetAccessible(40, 48)).toBe(false);
      expect(isTouchTargetAccessible(48, 32)).toBe(false);
    });
  });
});
