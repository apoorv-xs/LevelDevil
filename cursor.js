/**
 * Level Devil Tactical Avionics Reticle Cursor Engine
 * 60 FPS hardware-synchronized targeting reticle with corner brackets & telemetry micro-badge.
 * Strictly active on fine pointer devices; zero touch interference.
 */
(function() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  // Touch guard: Never run on touch/mobile devices
  const isFinePointer = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!isFinePointer) return;

  function initTacticalCursor() {
    if (document.getElementById("tactical-cursor")) return;

    // Create cursor DOM element
    const container = document.createElement("div");
    container.id = "tactical-cursor";
    container.className = "tactical-cursor";
    container.setAttribute("aria-hidden", "true");

    container.innerHTML = `
      <div class="cursor-dot"></div>
      <div class="cursor-reticle">
        <span class="reticle-bracket tl"></span>
        <span class="reticle-bracket tr"></span>
        <span class="reticle-bracket bl"></span>
        <span class="reticle-bracket br"></span>
      </div>
      <div class="cursor-badge"><span class="badge-text" id="cursor-badge-text">SCAN</span></div>
    `;

    document.body.appendChild(container);

    const dot = container.querySelector(".cursor-dot");
    const reticle = container.querySelector(".cursor-reticle");
    const badge = container.querySelector(".cursor-badge");
    const badgeText = document.getElementById("cursor-badge-text");

    let mouseX = -100;
    let mouseY = -100;
    let reticleX = -100;
    let reticleY = -100;
    let isVisible = false;

    // Direct mouse tracking (Zero lag on primary target dot)
    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        container.classList.add("visible");
        reticleX = mouseX;
        reticleY = mouseY;
      }
    }, { passive: true });

    window.addEventListener("mouseleave", () => {
      isVisible = false;
      container.classList.remove("visible");
    });

    window.addEventListener("mouseenter", () => {
      isVisible = true;
      container.classList.add("visible");
    });

    window.addEventListener("mousedown", () => {
      container.classList.add("clicking");
    });

    window.addEventListener("mouseup", () => {
      container.classList.remove("clicking");
    });

    // Interactive element detection via event delegation
    document.addEventListener("mouseover", (e) => {
      const target = e.target;
      if (!target) return;

      const interactive = target.closest("a, button, input, textarea, select, [data-trap], .topbar-btn, .cta-btn-primary, .cta-btn-secondary, .tech-pill, .status-dot, .trojan-card, [role='button']");
      if (interactive) {
        container.classList.add("hovering");

        if (interactive.matches("input, textarea, select")) {
          container.classList.add("input-mode");
          badgeText.textContent = "INPUT";
        } else if (interactive.matches(".cta-btn-primary, #btnDepositNow, [data-trap='cta']")) {
          container.classList.add("lock-mode");
          badgeText.textContent = "LOCK ↗";
        } else {
          container.classList.remove("lock-mode", "input-mode");
          const customText = interactive.getAttribute("data-cursor") || "ENGAGE";
          badgeText.textContent = customText;
        }
      } else {
        container.classList.remove("hovering", "lock-mode", "input-mode");
        badgeText.textContent = "SCAN";
      }
    }, { passive: true });

    // 60 FPS Lerp Loop for organic physical momentum
    function renderLoop() {
      if (isVisible) {
        // Hardware dot: 1:1 instantaneous position
        dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

        // Reticle follows with tight physical spring (lerp factor 0.35)
        reticleX += (mouseX - reticleX) * 0.35;
        reticleY += (mouseY - reticleY) * 0.35;
        reticle.style.transform = `translate3d(${reticleX}px, ${reticleY}px, 0)`;
        badge.style.transform = `translate3d(${reticleX + 16}px, ${reticleY - 14}px, 0)`;
      }
      requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);

    // Apply cursor: none to body when active
    document.documentElement.classList.add("has-tactical-cursor");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTacticalCursor);
  } else {
    initTacticalCursor();
  }
})();
