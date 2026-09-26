const portfolioScripts = [
  "sfx_synth.js?v=1022",
  "sky_engine.js?v=1022",
  "kaboom.js?v=1022",
  "system1_brain.js?v=1022",
  "three_engine.js?v=1022",
  "player_3d.js?v=1022",
  "player.js?v=1022",
  "portfolio_engine.js?v=1022",
  "collision_editor.js?v=1022"
];

function isSalesRoute(pathname = window.location.pathname) {
  return pathname === "/sales" || pathname.startsWith("/sales/") || pathname.endsWith("/sales.html");
}

function isWorkspaceRoute(pathname = window.location.pathname) {
  return pathname === "/workspace" || pathname.startsWith("/workspace/") || pathname.endsWith("/workspace/index.html");
}

function isHomeRoute(pathname = window.location.pathname) {
  return !isSalesRoute(pathname) && !isWorkspaceRoute(pathname);
}

function setActiveNavigation(root = document) {
  const sales = isSalesRoute();
  const workspace = isWorkspaceRoute();
  root.querySelectorAll(".site-nav a").forEach((link) => {
    const target = link.getAttribute("href") || "";
    let active = false;
    if (workspace) {
      active = target.includes("workspace");
    } else if (sales) {
      active = target.includes("sales") || target.includes("contact");
    } else {
      active = target === "/" || target === "index.html";
    }
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function resolveScriptPath(src) {
  if (src.startsWith("/") || src.startsWith("http")) return src;
  return "/" + src;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Unable to load portfolio module: ${src}`));
    document.body.appendChild(script);
  });
}

let portfolioLoadPromise = null;

async function loadPortfolio() {
  if (portfolioLoadPromise) return portfolioLoadPromise;

  portfolioLoadPromise = (async () => {
    // Sky canvas is exclusively for the main portfolio platformer route
    if (isHomeRoute()) {
      if (!document.getElementById("sky-canvas")) {
        const sCanvas = document.createElement("canvas");
        sCanvas.id = "sky-canvas";
        document.body.insertBefore(sCanvas, document.body.firstChild);
      }
    } else {
      const existingSky = document.getElementById("sky-canvas");
      if (existingSky) existingSky.remove();
      if (window.SkyEngine && typeof window.SkyEngine.dispose === "function") {
        window.SkyEngine.dispose();
      }
    }
    if (!document.getElementById("three-canvas")) {
      const canvas = document.createElement("canvas");
      canvas.id = "three-canvas";
      document.body.appendChild(canvas);
    }
    if (!document.getElementById("game-container")) {
      const container = document.createElement("div");
      container.id = "game-container";
      const gCanvas = document.createElement("canvas");
      gCanvas.id = "game-canvas";
      container.appendChild(gCanvas);
      document.body.appendChild(container);
    }

    if (typeof THREE === "undefined") {
      await loadScript(resolveScriptPath("three.min.js"));
    }

    const scriptsToLoad = isHomeRoute()
      ? portfolioScripts
      : portfolioScripts.filter(s => !s.includes("sky_engine"));

    for (const script of scriptsToLoad) {
      if (script.includes("collision_editor")) {
        await loadScript(resolveScriptPath(script)).catch((err) => {
          console.warn(`Optional module failed to load: ${script}`, err);
        });
      } else {
        await loadScript(resolveScriptPath(script));
      }
    }
    window.SFX?.initUI?.();
    window.showUIButtons?.();
  })();

  return portfolioLoadPromise;
}

async function loadSalesRoute() {
  if (document.body?.classList?.contains("sales-page") || window.location.pathname.endsWith("/sales.html")) return;
  window.Player3D?.dispose?.();
  window.Engine3D?.destroy?.();
  window.SkyEngine?.dispose?.();
  const existingSky = document.getElementById("sky-canvas");
  if (existingSky) existingSky.remove();
  portfolioLoadPromise = null;
  const response = await fetch("/sales.html");
  if (!response.ok) throw new Error("Sales view unavailable");
  const html = await response.text();
  const parsed = new DOMParser().parseFromString(html, "text/html");
  document.title = parsed.title;
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = "/sales.css";
  document.head.appendChild(stylesheet);
  document.body.replaceChildren(...parsed.body.children);
  await loadScript("/sales-config.js");
  await loadScript("/sales-auth.js");
  const module = document.createElement("script");
  module.type = "module";
  module.src = `/sales-app.js?v=${Date.now()}`;
  document.body.appendChild(module);
}

window.APP_SHELL = { isSalesRoute, setActiveNavigation };
window.APP_SHELL.status = {
  element: null,
  set(message, isError = false) {
    if (!this.element) {
      this.element = document.getElementById("status") || document.querySelector(".shell-status");
    }
    if (!this.element) return;
    this.element.textContent = message;
    this.element.classList.toggle("error", isError);
  }
};
window.APP_SHELL.session = {
  idToken: "",
  user: null,
  async setSession(session) {
    if (typeof session === "string") {
      this.idToken = session;
    } else if (typeof session?.getIdToken === "function") {
      this.idToken = await session.getIdToken();
    } else if (typeof session?.user?.getIdToken === "function") {
      this.idToken = await session.user.getIdToken();
    } else {
      throw new Error("Sign-in did not return a valid session.");
    }
    this.user = session?.user || (typeof session?.getIdToken === "function" ? session : null);
    return this.idToken;
  },
  async signIn() {
    const auth = window.SALES_PLATFORM_AUTH;
    if (!auth?.signIn) throw new Error("Authenticated entry is not configured in this public build. Contact the owner for workspace access.");
    const session = await auth.signIn();
    if (session?.user) {
      await this.setSession(session);
    }
    return session;
  },
  async resumeRedirect() {
    const auth = window.SALES_PLATFORM_AUTH;
    if (!auth?.resume) return false;
    const session = await auth.resume();
    if (!session) return false;
    await this.setSession(session);
    return true;
  },
  async getIdentity() {
    const user = this.user;
    if (!user) return {};
    let role = user.role || user.claims?.role;
    if (!role && typeof user.getIdTokenResult === "function") {
      const token = await user.getIdTokenResult();
      role = token?.claims?.role;
    }
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role,
    };
  },
  clear() {
    this.idToken = "";
    this.user = null;
  }
};

// --- RETRO BRUTALIST MOBILE ARCADE DRAWER ---
function initMobileDrawer() {
  if (typeof document === "undefined") return;
  if (!document.getElementById("mobile-menu-drawer") && document.body) {
    const isSales = isSalesRoute();
    const isWs = isWorkspaceRoute();
    const isHome = isHomeRoute();

    const drawer = document.createElement("div");
    drawer.id = "mobile-menu-drawer";
    drawer.className = "mobile-menu-drawer";
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-modal", "true");
    drawer.setAttribute("aria-label", "Navigation Menu");
    drawer.setAttribute("aria-hidden", "true");

    drawer.innerHTML = `
      <div class="mobile-drawer-backdrop" onclick="window.closeMobileMenu()"></div>
      <div class="mobile-drawer-panel">
        <div class="mobile-drawer-header">
          <div class="mobile-drawer-title">// ARCADE NAV SYSTEM</div>
          <button class="mobile-drawer-close" onclick="window.closeMobileMenu()" aria-label="Close Navigation Menu">[ ✕ CLOSE ]</button>
        </div>

        <nav class="mobile-drawer-nav" aria-label="Mobile Primary Navigation">
          <a href="/" class="mobile-drawer-link ${isHome ? 'active' : ''}" data-route="home">
            <span class="drawer-link-num">01</span>
            <span class="drawer-link-title">HOME PORTFOLIO</span>
            <span class="drawer-link-tag">[ 2.5D SKY ]</span>
          </a>
          <a href="/sales" class="mobile-drawer-link ${isSales ? 'active' : ''}" data-route="sales">
            <span class="drawer-link-num">02</span>
            <span class="drawer-link-title">CONTACT & INQUIRIES</span>
            <span class="drawer-link-tag">[ BRIEF ]</span>
          </a>
          <a href="/workspace/" class="mobile-drawer-link ${isWs ? 'active' : ''}" data-route="workspace">
            <span class="drawer-link-num">03</span>
            <span class="drawer-link-title">CLIENT WORKSPACE</span>
            <span class="drawer-link-tag">[ COCKPIT ]</span>
          </a>
        </nav>

        <div class="mobile-drawer-footer">
          <div class="drawer-footer-title">// HARDWARE PROTOCOLS</div>
          <div class="drawer-footer-actions">
            <button id="drawer-bb8-guide" class="mobile-drawer-btn" onclick="window.openDrawerGuide()">
              <span class="drawer-btn-icon">🤖</span>
              <span class="drawer-btn-label">BB-8 CO-PILOT HUD</span>
              <span class="drawer-btn-status">READY</span>
            </button>
            <button id="drawer-sfx-toggle" class="mobile-drawer-btn" onclick="window.toggleDrawerSFX()">
              <span id="drawer-sfx-icon" class="drawer-btn-icon">${window.SFX?.isMuted?.() ? '🔇' : '🔊'}</span>
              <span id="drawer-sfx-text" class="drawer-btn-label">${window.SFX?.isMuted?.() ? 'SOUND FX: MUTED' : 'SOUND FX: ACTIVE'}</span>
              <span class="drawer-btn-status">TOGGLE</span>
            </button>
            <button id="drawer-auth-btn" class="mobile-drawer-btn" onclick="window.openDrawerAuth()">
              <span class="drawer-btn-icon">🔑</span>
              <span id="drawer-auth-text" class="drawer-btn-label">CLIENT / OWNER AUTH</span>
              <span class="drawer-btn-status">LOGIN</span>
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(drawer);
  }

  window.openMobileMenu = () => {
    const drawer = document.getElementById("mobile-menu-drawer");
    if (!drawer) return;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("drawer-open");
    const isSales = isSalesRoute();
    const isWs = isWorkspaceRoute();
    const isHome = isHomeRoute();
    drawer.querySelectorAll(".mobile-drawer-link").forEach(link => {
      const r = link.getAttribute("data-route");
      if ((r === "home" && isHome) || (r === "sales" && isSales) || (r === "workspace" && isWs)) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
    const muted = window.SFX?.isMuted?.();
    const drawerIcon = document.getElementById("drawer-sfx-icon");
    const drawerText = document.getElementById("drawer-sfx-text");
    if (drawerIcon) drawerIcon.textContent = muted ? "🔇" : "🔊";
    if (drawerText) drawerText.textContent = muted ? "SOUND FX: MUTED" : "SOUND FX: ACTIVE";
    window.SFX?.playClick?.();
  };

  window.closeMobileMenu = () => {
    const drawer = document.getElementById("mobile-menu-drawer");
    if (!drawer) return;
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("drawer-open");
    window.SFX?.playClick?.();
  };

  window.toggleMobileMenu = () => {
    const drawer = document.getElementById("mobile-menu-drawer");
    if (drawer && drawer.classList.contains("open")) {
      window.closeMobileMenu();
    } else {
      window.openMobileMenu();
    }
  };

  window.openDrawerGuide = () => {
    window.closeMobileMenu();
    setTimeout(() => {
      window.System1Brain?.showGuidanceHUD?.();
    }, 150);
  };

  window.toggleDrawerSFX = () => {
    if (window.SFX?.toggle) {
      window.SFX.toggle();
    }
  };

  window.openDrawerAuth = () => {
    window.closeMobileMenu();
    if (isWorkspaceRoute()) {
      if (typeof window.openAuthGate === "function") window.openAuthGate();
    } else if (isSalesRoute()) {
      const signInBtn = document.getElementById("topbar-sign-in");
      if (signInBtn) signInBtn.click();
    } else {
      window.location.href = "/workspace/";
    }
  };

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const drawer = document.getElementById("mobile-menu-drawer");
      if (drawer && drawer.classList.contains("open")) {
        window.closeMobileMenu();
      }
    }
  });

  document.querySelectorAll("#mobile-menu-btn, .mobile-menu-btn").forEach(btn => {
    btn.onclick = (e) => {
      if (e) e.preventDefault();
      window.toggleMobileMenu();
    };
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMobileDrawer);
} else {
  initMobileDrawer();
}

setActiveNavigation();
if (isSalesRoute()) {
  loadSalesRoute().then(() => {
    initMobileDrawer();
    return loadPortfolio();
  }).catch((error) => {
    console.warn("[Shell] 3D companion scripts failed to load, degrading gracefully:", error);
    // Keep the Sales form interactive — do NOT destroy the DOM
  });
} else {
  loadPortfolio().then(() => {
    initMobileDrawer();
  }).catch((error) => {
    const status = document.createElement("p");
    status.className = "shell-status";
    status.textContent = error.message;
    document.body.appendChild(status);
  });
}

