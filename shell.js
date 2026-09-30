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

function triggerHaptic(pattern = 15) {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(pattern);
    } catch (e) {}
  }
}
if (typeof window !== "undefined") {
  window.triggerHaptic = triggerHaptic;
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
        sCanvas.setAttribute("aria-hidden", "true");
        document.body.insertBefore(sCanvas, document.body.firstChild);
      }
    } else {
      const existingSky = document.getElementById("sky-canvas");
      if (existingSky) existingSky.remove();
      if (window.SkyEngine && typeof window.SkyEngine.dispose === "function") {
        window.SkyEngine.dispose();
      }
    }
    if (!isWorkspaceRoute()) {
      if (!document.getElementById("three-canvas")) {
        const canvas = document.createElement("canvas");
        canvas.id = "three-canvas";
        canvas.setAttribute("aria-hidden", "true");
        document.body.appendChild(canvas);
      }
      if (!document.getElementById("game-container")) {
        const container = document.createElement("div");
        container.id = "game-container";
        const gCanvas = document.createElement("canvas");
        gCanvas.id = "game-canvas";
        gCanvas.setAttribute("aria-hidden", "true");
        container.appendChild(gCanvas);
        document.body.appendChild(container);
      }
    }

    if (!isWorkspaceRoute() && typeof THREE === "undefined") {
      await loadScript(resolveScriptPath("three.min.js"));
    }

    const scriptsToLoad = isWorkspaceRoute()
      ? []  // No 3D companion on workspace — BB-8 is exclusively Home & Sales
      : isHomeRoute()
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
  window.PortfolioEngine?.dispose?.();
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

window.isApoorvOwnerEmail = function(email) {
  if (!email || typeof email !== "string") return false;
  const clean = email.toLowerCase().trim();
  return clean === "apoorvxs@gmail.com" || clean === "apoorv-xs@users.noreply.github.com";
};

window.APP_SHELL.session = {
  idToken: "",
  user: null,
  getUser() {
    if (this.user) return this.user;
    try {
      const saved = localStorage.getItem("sprintdial_user") || localStorage.getItem("sprintdial_google_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.email || parsed.name || parsed.displayName)) {
          return {
            uid: parsed.sub || parsed.uid || "saved_user",
            email: parsed.email || "",
            displayName: parsed.displayName || parsed.name || (parsed.email ? parsed.email.split("@")[0] : "User"),
            photoURL: parsed.photoURL || parsed.picture || "",
            picture: parsed.picture || parsed.photoURL || "",
            role: parsed.role || (window.isApoorvOwnerEmail(parsed.email) ? "owner" : "caller")
          };
        }
      }
    } catch (e) {}
    return null;
  },
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
    if (this.user) {
      try {
        const u = this.user;
        const email = u.email || "";
        const photo = u.photoURL || u.picture || (u.providerData && u.providerData[0]?.photoURL) || "";
        const displayName = u.displayName || u.name || (email ? email.split("@")[0] : "User");
        const record = {
          name: displayName,
          displayName: displayName,
          email: email,
          picture: photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=fff1bd&color=17120f`,
          photoURL: photo || "",
          role: window.isApoorvOwnerEmail(email) ? "owner" : (u.role || "caller"),
          sub: u.uid || Date.now().toString()
        };
        localStorage.setItem("sprintdial_user", JSON.stringify(record));
        localStorage.setItem("sprintdial_google_user", JSON.stringify(record));
        window.APP_SHELL?.syncShieldOwnerExemption?.();
      } catch (e) {}
    }
    return this.idToken;
  },
  async signIn() {
    if (this._inFlightSignIn) return this._inFlightSignIn;
    this._inFlightSignIn = (async () => {
      const auth = window.SALES_PLATFORM_AUTH;
      if (!auth?.signIn) throw new Error("Authenticated entry is not configured in this public build. Contact the owner for workspace access.");
      const session = await auth.signIn();
      if (session?.user) {
        await this.setSession(session);
      }
      return session;
    })().finally(() => {
      this._inFlightSignIn = null;
    });
    return this._inFlightSignIn;
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
    const user = this.getUser();
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
      photoURL: user.photoURL,
      role: role || (window.isApoorvOwnerEmail(user.email) ? "owner" : "caller"),
    };
  },
  clear() {
    this.idToken = "";
    this.user = null;
    localStorage.removeItem("sprintdial_user");
    localStorage.removeItem("sprintdial_google_user");
    try { sessionStorage.removeItem("sprintdial_owner_unlocked"); } catch (e) {}
    window.APP_SHELL?.syncShieldOwnerExemption?.();
  }
};

// --- UNIVERSAL TOPBAR & AUTH SYNCHRONIZATION ---
window.APP_SHELL.initUniversalTopbar = function() {
  if (typeof document === "undefined") return;
  window.APP_SHELL?.syncShieldOwnerExemption?.();
  const user = window.APP_SHELL.session.getUser();
  const signInBtns = document.querySelectorAll("#topbar-sign-in, #workspaceSignInBtnHeader");
  const userChips = document.querySelectorAll("#topbar-user, #userChipHeader");
  const adminBtns = document.querySelectorAll("#adminBtnHeader, #dropdownAdminBtn");
  
  const isOwner = user && window.isApoorvOwnerEmail(user.email);

  if (user && (user.email || user.displayName)) {
    document.body.classList.add("has-session");
    const inquireBtn = document.getElementById("topbar-inquire-btn");
    if (inquireBtn) {
      inquireBtn.style.display = "none";
      inquireBtn.classList.add("hidden");
    }

    // Hide all Sign In buttons
    signInBtns.forEach(btn => {
      btn.style.display = "none";
      btn.classList.add("hidden");
    });

    // Show all User Chips
    userChips.forEach(chip => {
      chip.style.display = "inline-flex";
      chip.classList.remove("hidden");
    });

    // Update Avatar URLs
    const photoUrl = user.photoURL || user.picture || (user.providerData && user.providerData[0]?.photoURL) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.name || user.email || "User")}&background=fff1bd&color=17120f`;
    document.querySelectorAll("#topbar-user-img, #userImg, #dropdownUserImg").forEach(img => {
      img.referrerPolicy = "no-referrer";
      img.src = photoUrl;
    });

    // Update Email
    const emailText = user.email || user.displayName || "";
    document.querySelectorAll("#topbar-user-email, #userEmail, #dropdownUserEmail").forEach(el => {
      el.textContent = emailText;
      el.title = emailText;
    });

    // Update Display Name (in topbar trigger chip and dropdown header)
    const nameText = user.displayName || user.name || (emailText ? emailText.split("@")[0] : "User");
    document.querySelectorAll("#userName, #dropdownUserName, #topbar-user-name, #userTopName, .topbar-user-name").forEach(el => {
      el.textContent = nameText;
      el.title = nameText;
    });

    // Hide role badge on trigger button ("owner term is not necessary" on topbar)
    document.querySelectorAll("#topbar-user-role, #userRoleBadge").forEach(badge => {
      badge.style.display = "none";
    });

    // Update Role Badges in dropdown
    const roleText = isOwner ? "OWNER" : (user.role === "caller" ? "PARTNER" : (user.role?.toUpperCase() || "PARTNER"));
    document.querySelectorAll("#dropdownRolePill").forEach(badge => {
      badge.textContent = roleText;
    });

    // Update Admin Triggers
    adminBtns.forEach(btn => {
      if (isOwner) {
        btn.classList.remove("hidden");
        btn.style.display = "inline-flex";
      } else {
        btn.classList.add("hidden");
        btn.style.display = "none";
      }
    });

    // Synchronize Mobile Drawer Status
    const drawerAuthText = document.getElementById("drawer-auth-text");
    const drawerAuthBtn = document.getElementById("drawer-auth-btn");
    if (drawerAuthText) {
      drawerAuthText.textContent = `${nameText} (${roleText})`;
    }
    if (drawerAuthBtn) {
      const statusSpan = drawerAuthBtn.querySelector(".drawer-btn-status");
      if (statusSpan) statusSpan.textContent = "LOGOUT";
    }
  } else {
    // Reset to Logged-Out Guest
    document.body.classList.remove("has-session");
    const inquireBtn = document.getElementById("topbar-inquire-btn");
    if (inquireBtn) {
      inquireBtn.style.display = "";
      inquireBtn.classList.remove("hidden");
    }

    signInBtns.forEach(btn => {
      btn.style.display = "inline-flex";
      btn.classList.remove("hidden");
    });
    userChips.forEach(chip => {
      chip.style.display = "none";
      chip.classList.add("hidden");
    });
    adminBtns.forEach(btn => {
      btn.classList.add("hidden");
      btn.style.display = "none";
    });

    // Reset Mobile Drawer
    const drawerAuthText = document.getElementById("drawer-auth-text");
    const drawerAuthBtn = document.getElementById("drawer-auth-btn");
    if (drawerAuthText) {
      drawerAuthText.textContent = "CLIENT / OWNER AUTH";
    }
    if (drawerAuthBtn) {
      const statusSpan = drawerAuthBtn.querySelector(".drawer-btn-status");
      if (statusSpan) statusSpan.textContent = "LOGIN";
    }
  }
};

window.APP_SHELL.toggleProfileDropdown = function() {
  const dropdown = document.getElementById("userProfileDropdown");
  const trigger = document.getElementById("userProfileTrigger");
  const carets = document.querySelectorAll("#profileDropdownCaret, .topbar-user-caret");
  if (!dropdown) return;
  const isHidden = dropdown.classList.contains("hidden");
  if (isHidden) {
    if (typeof window.updateProfileDropdownUI === "function") {
      window.updateProfileDropdownUI();
    }
    dropdown.classList.remove("hidden");
    if (trigger) trigger.setAttribute("aria-expanded", "true");
    carets.forEach(c => c.classList.add("rotate-180"));
  } else {
    window.APP_SHELL.closeProfileDropdown();
  }
};

window.APP_SHELL.closeProfileDropdown = function() {
  const dropdown = document.getElementById("userProfileDropdown");
  const trigger = document.getElementById("userProfileTrigger");
  const carets = document.querySelectorAll("#profileDropdownCaret, .topbar-user-caret");
  if (!dropdown) return;
  dropdown.classList.add("hidden");
  if (trigger) trigger.setAttribute("aria-expanded", "false");
  carets.forEach(c => c.classList.remove("rotate-180"));
};

window.APP_SHELL.signOut = async function() {
  window.APP_SHELL.session.clear();
  window.APP_SHELL.closeProfileDropdown();
  window.APP_SHELL.initUniversalTopbar();

  if (window.SALES_PLATFORM_AUTH?.getAuth) {
    try {
      const auth = await window.SALES_PLATFORM_AUTH.getAuth();
      await auth.signOut?.();
    } catch (e) {}
  }
  if (typeof window.firebase?.auth === "function") {
    try { window.firebase.auth().signOut(); } catch (e) {}
  }

  if (isWorkspaceRoute()) {
    if (typeof window.openAuthGate === "function") {
      window.openAuthGate();
    } else {
      window.location.reload();
    }
  } else if (isSalesRoute()) {
    if (typeof window.syncAuthState === "function") {
      await window.syncAuthState();
    }
    const formAuthStatus = document.getElementById("form-auth-status");
    if (formAuthStatus) formAuthStatus.textContent = "Sign in with Google to auto-fill verified contact details.";
    const formSignIn = document.getElementById("form-sign-in");
    if (formSignIn) formSignIn.style.display = "inline-flex";
  }
};

window.APP_SHELL.openAuth = function() {
  if (isWorkspaceRoute()) {
    if (typeof window.openAuthGate === "function") window.openAuthGate();
  } else if (isSalesRoute()) {
    if (typeof window.handleGoogleSignIn === "function") {
      window.handleGoogleSignIn();
    }
  } else {
    window.location.href = "/sales#signin";
  }
};

window.APP_SHELL.openAdmin = function() {
  if (isWorkspaceRoute()) {
    if (typeof window.openAdminModal === "function") window.openAdminModal();
  } else {
    window.location.href = "/workspace/?admin=1";
  }
};

// Global aliases for backward compatibility across scripts & tests
window.toggleProfileDropdown = window.APP_SHELL.toggleProfileDropdown;
window.closeProfileDropdown = window.APP_SHELL.closeProfileDropdown;
window.openProfileDropdown = () => {
  const dropdown = document.getElementById("userProfileDropdown");
  if (dropdown && dropdown.classList.contains("hidden")) {
    window.APP_SHELL.toggleProfileDropdown();
  }
};
window.signOutGoogle = window.APP_SHELL.signOut;

// Global outside-click dismiss listener for profile dropdown
window.addEventListener("click", (e) => {
  const trigger = document.getElementById("userProfileTrigger");
  const dropdown = document.getElementById("userProfileDropdown");
  if (dropdown && !dropdown.classList.contains("hidden")) {
    if (trigger && !trigger.contains(e.target) && !dropdown.contains(e.target)) {
      window.APP_SHELL.closeProfileDropdown();
    }
  }
});

// Reactively synchronize topbar if session changes in another tab
window.addEventListener("storage", (e) => {
  if (e.key === "sprintdial_user" || e.key === "sprintdial_google_user") {
    window.APP_SHELL.initUniversalTopbar();
    window.APP_SHELL?.syncShieldOwnerExemption?.();
  }
});

// Real-time synchronization with Firebase Google Auth (live DP and name)
if (typeof window !== "undefined" && !window._shellAuthListenerAttached) {
  window._shellAuthListenerAttached = true;
  const attachAuthListener = () => {
    if (window.SALES_PLATFORM_AUTH?.getAuth) {
      window.SALES_PLATFORM_AUTH.getAuth().then(auth => {
        auth.onAuthStateChanged(async (firebaseUser) => {
          if (firebaseUser) {
            await window.APP_SHELL.session.setSession(firebaseUser);
            window.APP_SHELL.initUniversalTopbar();
          }
        });
      }).catch(() => {});
    }
  };
  if (window.SALES_PLATFORM_AUTH) {
    attachAuthListener();
  } else {
    window.addEventListener("load", attachAuthListener, { once: true });
  }
}

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
            <button id="drawer-install-btn" class="mobile-drawer-btn hidden" onclick="window.closeMobileMenu(); window.handleInstallAppClick?.()">
              <span class="drawer-btn-icon">📲</span>
              <span class="drawer-btn-label">INSTALL MOBILE APP</span>
              <span class="drawer-btn-status">PWA</span>
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
    window._drawerReturnFocus = document.activeElement;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    const triggerBtn = document.getElementById("mobile-menu-btn");
    if (triggerBtn) triggerBtn.setAttribute("aria-expanded", "true");
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

    const drawerInstall = document.getElementById("drawer-install-btn");
    if (drawerInstall) {
      if (typeof window.isInstallAppEligible === "function" && window.isInstallAppEligible()) {
        drawerInstall.classList.remove("hidden");
        drawerInstall.style.display = "flex";
      } else {
        drawerInstall.classList.add("hidden");
        drawerInstall.style.display = "none";
      }
    }
    const muted = window.SFX?.isMuted?.();
    const drawerIcon = document.getElementById("drawer-sfx-icon");
    const drawerText = document.getElementById("drawer-sfx-text");
    if (drawerIcon) drawerIcon.textContent = muted ? "🔇" : "🔊";
    if (drawerText) drawerText.textContent = muted ? "SOUND FX: MUTED" : "SOUND FX: ACTIVE";
    window.SFX?.playClick?.();
    const closeBtn = drawer.querySelector(".mobile-drawer-close");
    if (closeBtn) closeBtn.focus();
  };

  window.closeMobileMenu = () => {
    const drawer = document.getElementById("mobile-menu-drawer");
    if (!drawer) return;
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    const triggerBtn = document.getElementById("mobile-menu-btn");
    if (triggerBtn) triggerBtn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("drawer-open");
    window.SFX?.playClick?.();
    if (window._drawerReturnFocus && typeof window._drawerReturnFocus.focus === "function") {
      window._drawerReturnFocus.focus();
      window._drawerReturnFocus = null;
    }
  };

  window.toggleMobileMenu = () => {
    const drawer = document.getElementById("mobile-menu-drawer");
    if (drawer && drawer.classList.contains("open")) {
      window.closeMobileMenu();
    } else {
      window.openMobileMenu();
    }
  };


  window.toggleDrawerSFX = () => {
    if (window.SFX?.toggle) {
      window.SFX.toggle();
    }
  };

  window.openDrawerAuth = () => {
    window.closeMobileMenu();
    const user = window.APP_SHELL?.session?.getUser?.();
    if (user) {
      if (confirm(`Signed in as ${user.email || user.displayName}. Sign out?`)) {
        window.APP_SHELL?.signOut?.();
      }
      return;
    }
    window.APP_SHELL?.openAuth?.();
  };

  window.addEventListener("keydown", (e) => {
    const drawer = document.getElementById("mobile-menu-drawer");
    if (!drawer || !drawer.classList.contains("open")) return;

    if (e.key === "Escape") {
      window.closeMobileMenu();
      return;
    }

    if (e.key === "Tab") {
      const focusable = drawer.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
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

// --- UNIVERSAL RETRO BRUTALIST LEGAL MODAL ENGINE ---
window.APP_SHELL.legalContent = {
  privacy: {
    title: "🛡️ PRIVACY POLICY (DPDP ACT 2023 & GDPR)",
    html: `
      <h3>DIGITAL PERSONAL DATA PROTECTION ACT (DPDP) 2023 & GDPR PRIVACY NOTICE</h3>
      <div class="legal-clause-box">
        <strong>DATA CONTROLLER &amp; FIDUCIARY:</strong><br>
        Apoorv A S (Creative Technologist &amp; 3D WebUI Architect)<br>
        Operating Scope: Global / Remote (Worldwide Availability)<br>
        Direct Inquiries &amp; Privacy Requests: <a href="mailto:apoorvxs@gmail.com" style="color:var(--shell-purple,#6d3bb8); font-weight:bold;">apoorvxs@gmail.com</a><br>
        Response Commitment: Direct resolution guaranteed within 48 hours.
      </div>
      <h4>1. Categories of Personal Data Collected</h4>
      <p>We process only digital personal data that you explicitly provide through affirmative interaction:</p>
      <ul>
        <li><strong>Project Inquiries (/sales):</strong> Full Name, Business/Work Email, Project Scope requirements, Budget Tier, and Brief details.</li>
        <li><strong>Strategy Consultations (/sales modal):</strong> Name, Work Email, Architecture Focus, Target Launch Timelines, and booking timeslot coordinates.</li>
        <li><strong>Google Single Sign-On Authentication:</strong> Display Name, verified Google Email, Google Profile Avatar URL (lh3.googleusercontent.com), and cryptographic OAuth Subject UID.</li>
        <li><strong>B2B Lead Cockpit (/workspace/):</strong> Public business contact coordinates processed for legitimate B2B outreach by authorized referral partners.</li>
      </ul>
      <h4>2. Statutory Purpose Limitation (DPDP Sec 4-6)</h4>
      <p>Your personal data is processed strictly for:</p>
      <ul>
        <li>Evaluating incoming technical requirements, feasibility, and drafting bespoke 60 FPS proposals.</li>
        <li>Scheduling 1-on-1 strategy screen-shares and engineering consultation sessions.</li>
        <li>Cryptographic session maintenance across portfolio viewports and client workspace cockpits.</li>
      </ul>
      <p><strong>Zero Data Brokering:</strong> We do NOT sell, rent, monetize, or disclose your personal data to any third-party marketing broker or advertising network. Zero cross-site tracking pixels are deployed on this domain.</p>
      <h4>3. Data Principal Rights (DPDP Sec 11-13 & GDPR Art 15-21)</h4>
      <p>As a Data Principal / Subject, you hold enforceable statutory rights:</p>
      <ul>
        <li><strong>Right to Access & Summary:</strong> Request an itemized export of all personal coordinates stored in our active records.</li>
        <li><strong>Right to Correction & Erasure:</strong> Request immediate rectification of inaccurate data or permanent deletion of your inquiry dossier.</li>
        <li><strong>Right to Withdraw Consent:</strong> You may withdraw consent at any time by emailing the Data Fiduciary. Data will be purged within 7 business days.</li>
        <li><strong>Right to Grievance Redressal:</strong> Direct statutory inquiries or concerns directly to Apoorv for resolution within 48 hours.</li>
      </ul>
      <h4>4. Direct Data Erasure &amp; Removal Requests</h4>
      <p>To request immediate deletion of your contact details or withdraw consent, simply email <a href="mailto:apoorvxs@gmail.com" style="color:var(--shell-purple,#6d3bb8); font-weight:bold;">apoorvxs@gmail.com</a>. Requests are verified and completed directly by Apoorv within 48 hours in compliance with Section 13 of the DPDP Act 2023 and Rule 3(2) of the Information Technology Rules 2021.</p>
      <h4>5. Security &amp; Encryption Safeguards</h4>
      <p>All data transmissions are protected via TLS 1.3 encryption in transit. Authentication tokens are managed cryptographically with zero plain-text storage of third-party credentials.</p>
    `
  },
  terms: {
    title: "📜 TERMS OF ENGAGEMENT & INTELLECTUAL PROPERTY",
    html: `
      <h3>COMMERCIAL TERMS OF ENGAGEMENT</h3>
      <div class="legal-clause-box">
        <strong>PRACTICE MANDATE:</strong> High-margin creative engineering, WebGPU architecture, and locked 60 FPS interactive systems delivered directly by Apoorv without agency overhead.
      </div>
      <h4>1. Scope of Engagement & Statement of Work (SOW)</h4>
      <p>All client commissions are governed by a mutually executed SOW detailing deliverables, performance budgets (16.6ms frame budget floor, Draco compression, DPR clamping), and sprint schedules.</p>
      <h4>2. Asymmetric Alpha & Intellectual Property Rights</h4>
      <ul>
        <li><strong>Proprietary Engine Kernels:</strong> Apoorv retains exclusive intellectual property rights and moral ownership over the core Level Devil spatial engine, ERAVEX WebGPU framework, Astromech companion systems, and proprietary procedural GLSL shader standard libraries.</li>
        <li><strong>Client Deliverables License:</strong> Upon 100% final settlement of all milestone invoices, the client receives an irrevocable, perpetual, worldwide commercial license to their bespoke project code and 3D visual assets.</li>
        <li><strong>Pre-Settlement Reservation:</strong> No commercial license or intellectual property rights transfer occurs prior to receipt of final milestone payment in full.</li>
      </ul>
      <h4>3. Milestone Structure & Retainers</h4>
      <ul>
        <li><strong>50% Upfront Retainer:</strong> Required to lock calendar priority and initiate engineering scaffolding.</li>
        <li><strong>25% Beta Staging Milestone:</strong> Due upon interactive delivery on private staging with verified 60 FPS mobile telemetry.</li>
        <li><strong>25% Final Production Milestone:</strong> Due upon final asset handover and production domain deployment.</li>
      </ul>
      <h4>4. Scope Armor & Addendum Sprints</h4>
      <p>Revisions outside the approved architectural blueprint are gated at a $3,500 / sprint addendum floor to safeguard engineering velocity and prevent scope degradation.</p>
      <h4>5. Governing Law &amp; Jurisdiction</h4>
      <p>All client commissions and milestone deliverables are formalized via a mutual Statement of Work (SOW) prior to project commencement.</p>
    `
  },
  refunds: {
    title: "💳 REFUND, MILESTONE & CANCELLATION POLICY",
    html: `
      <h3>REFUND & CANCELLATION CONDITIONS</h3>
      <div class="legal-clause-box">
        <strong>COMMERCIAL CLARITY:</strong> We build bespoke mathematical software systems. Because dedicated GPU engineering compute and schedule slots are reserved in advance, our refund framework is strictly milestone-based.
      </div>
      <h4>1. 50% Upfront Advance Deposits</h4>
      <p>The 50% deposit secures exclusive engineering allocation. Once preliminary technical research, architectural blueprinting, or repository scaffolding has commenced, the deposit is strictly non-refundable.</p>
      <h4>2. Pre-Sprint Written Cancellation</h4>
      <p>If a client requests project cancellation in writing before any technical sprint or asset preparation has started, the deposit will be refunded minus a 10% administrative processing fee and any direct software/asset licensing fees already incurred.</p>
      <h4>3. Milestone Acceptance & Non-Reversibility</h4>
      <p>Formal written approval or staging sign-off on any milestone sprint (e.g. Beta Staging approval) constitutes irreversible acceptance of that sprint's deliverables, and subsequent fees for that milestone are non-refundable.</p>
      <h4>4. Dispute & Resolution Protocol</h4>
      <p>In the event of an engineering impasse, both parties agree to a 14-day technical audit sprint to remedy any documented deviation from the agreed SOW benchmarks before initiating formal resolution.</p>
      <h4>5. Refund Processing Rail</h4>
      <p>Approved refunds are processed strictly to the originating payment rail (UPI, Razorpay, or Stripe) within 7 business days of written settlement.</p>
    `
  },
  accessibility: {
    title: "♿ DIGITAL ACCESSIBILITY & WCAG 2.1 AA STATEMENT",
    html: `
      <h3>ACCESSIBILITY & INCLUSION STATEMENT</h3>
      <div class="legal-clause-box">
        <strong>STANDARD:</strong> We are committed to ensuring digital accessibility for individuals with diverse abilities, adhering to the Web Content Accessibility Guidelines (WCAG 2.1 Level AA) and India's Rights of Persons with Disabilities (RPwD) Act, 2016.
      </div>
      <h4>1. Spatial 3D Engine Keyboard Navigation</h4>
      <p>Our 2.5D spatial canvas engine is fully controllable without a mouse:</p>
      <ul>
        <li><code>WASD</code> / <code>Arrow Keys</code>: Pilot the BB-8 companion droid horizontally across the spatial canvas.</li>
        <li><code>Space</code> / <code>W</code> / <code>Up</code>: Vertical jump to land on content card rails.</li>
        <li><code>F</code>: Materialize a hard-light laser springboard platform.</li>
        <li><code>Tab</code> / <code>Shift + Tab</code>: Sequentially navigate all interactive DOM cards, links, and forms.</li>
        <li><code>Escape</code>: Instantly dismiss any active modal, HUD, profile dropdown, or mobile drawer.</li>
      </ul>
      <h4>2. Assistive Features Built-In</h4>
      <ul>
        <li><strong>Skip-to-Content:</strong> Press Tab on initial page load to bypass navigation and jump straight to main content.</li>
        <li><strong>Screen Reader Tagging:</strong> Decorative WebGL canvas layers are explicitly isolated with <code>aria-hidden="true"</code> to prevent screen reader noise.</li>
        <li><strong>High Contrast Visuals:</strong> High-contrast retro brutalist palette with rich text contrast ratios meeting or exceeding 4.5:1.</li>
      </ul>
      <h4>3. Accessibility Feedback</h4>
      <p>If you encounter an accessibility barrier or require an alternative document format, please email <a href="mailto:apoorvxs@gmail.com" style="color:var(--shell-purple,#6d3bb8); font-weight:bold;">apoorvxs@gmail.com</a>. Remediations are prioritized within 48 hours.</p>
    `
  },
  cookies: {
    title: "🍪 LOCAL STORAGE & COOKIE MANAGEMENT",
    html: `
      <h3>LOCAL STORAGE, COOKIES & TRANSPARENCY</h3>
      <div class="legal-clause-box">
        <strong>ZERO AD TRACKING:</strong> This website does NOT deploy tracking cookies, Google Analytics marketing tags, or third-party behavioral trackers.
      </div>
      <h4>1. Essential Local Client Storage Keys</h4>
      <p>We use modern browser <code>localStorage</code> exclusively to preserve essential functional state on your device:</p>
      <ul>
        <li><code>sprintdial_user</code> / <code>sprintdial_google_user</code>: Holds your verified Google display name and profile picture URL for cross-route session synchronization between Home, Sales, and Workspace.</li>
        <li><code>sprintdial_sound_muted</code>: Remembers whether you have muted the procedural 0 KB droid audio synthesizer.</li>
        <li><code>sprintdial_dials_today</code>: Tracks local outreach progress and daily discovery counters in the client workspace cockpit.</li>
        <li><code>apoorv_custom_rails_v4</code>: Remembers custom physical landing platforms deployed during exploration.</li>
      </ul>
      <h4>2. 1-Click Client Storage Purge</h4>
      <p>You can instantly wipe all local data, cached preferences, and active credentials stored on this device by clicking the button below:</p>
      <div style="margin: 20px 0;">
        <button type="button" onclick="window.APP_SHELL?.clearAllLocalData?.()" class="footer-legal-btn" style="background:#f8d7da; color:#721c24; border-color:#721c24;">
          [ 🧹 CLEAR ALL LOCAL DATA & RESET SESSION ]
        </button>
      </div>
      <p style="font-size:11px; opacity:0.8;">Note: Clicking the purge button will clear all local storage keys and reload the page as an anonymous guest.</p>
    `
  }
};

window.APP_SHELL.openLegalModal = function(tabName) {
  let modal = document.getElementById("universalLegalModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "universalLegalModal";
    modal.className = "legal-modal-backdrop hidden";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "legalModalHeaderTitle");
    modal.innerHTML = `
      <div class="legal-modal-card" data-kaboom-body="true">
        <div class="legal-modal-header">
          <div id="legalModalHeaderTitle" class="legal-modal-title">// LEGAL &amp; PRIVACY POLICIES</div>
          <button type="button" class="legal-modal-close-btn" onclick="window.APP_SHELL.closeLegalModal()" aria-label="Close Legal Modal">[ ✕ ESC ]</button>
        </div>
        <div class="legal-modal-body">
          <nav class="legal-modal-nav" aria-label="Legal document tabs">
            <button type="button" class="legal-modal-tab-btn" data-tab="privacy" onclick="window.APP_SHELL.switchLegalTab('privacy')">🛡️ PRIVACY POLICY</button>
            <button type="button" class="legal-modal-tab-btn" data-tab="terms" onclick="window.APP_SHELL.switchLegalTab('terms')">📜 TERMS OF SOW</button>
            <button type="button" class="legal-modal-tab-btn" data-tab="refunds" onclick="window.APP_SHELL.switchLegalTab('refunds')">💳 REFUNDS & DEPOSITS</button>
            <button type="button" class="legal-modal-tab-btn" data-tab="accessibility" onclick="window.APP_SHELL.switchLegalTab('accessibility')">♿ ACCESSIBILITY</button>
            <button type="button" class="legal-modal-tab-btn" data-tab="cookies" onclick="window.APP_SHELL.switchLegalTab('cookies')">🍪 COOKIES & STORAGE</button>
          </nav>
          <div class="legal-modal-content-area" id="legalModalContent"></div>
        </div>
      </div>
    `;
    modal.addEventListener("click", (e) => {
      if (e.target === modal) window.APP_SHELL.closeLegalModal();
    });
    modal.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
    document.body.appendChild(modal);
  }

  window._legalReturnFocus = document.activeElement;
  window.APP_SHELL.switchLegalTab(tabName || "privacy");
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  const closeBtn = modal.querySelector(".legal-modal-close-btn");
  if (closeBtn) closeBtn.focus();
};

window.APP_SHELL.closeLegalModal = function() {
  const modal = document.getElementById("universalLegalModal");
  if (modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
    if (window._legalReturnFocus && typeof window._legalReturnFocus.focus === "function") {
      window._legalReturnFocus.focus();
      window._legalReturnFocus = null;
    }
  }
};

window.APP_SHELL.switchLegalTab = function(tabKey) {
  const contentArea = document.getElementById("legalModalContent");
  const tabData = window.APP_SHELL.legalContent[tabKey] || window.APP_SHELL.legalContent.privacy;
  if (contentArea) {
    contentArea.innerHTML = tabData.html;
    contentArea.scrollTop = 0;
  }
  const titleEl = document.getElementById("legalModalHeaderTitle");
  if (titleEl) {
    titleEl.textContent = `// ${tabData.title}`;
  }
  document.querySelectorAll(".legal-modal-tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-tab") === tabKey);
  });
};

window.APP_SHELL.clearAllLocalData = function() {
  if (confirm("Are you sure you want to clear all stored sessions, cookies, audio preferences, and custom platforms?")) {
    try {
      localStorage.clear();
      sessionStorage.clear();
      alert("✅ All local client storage and credentials purged.");
      window.location.reload();
    } catch (e) {
      console.warn("Storage clearance error:", e);
    }
  }
};

// Global Escape listener for legal modal
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const modal = document.getElementById("universalLegalModal");
    if (modal && !modal.classList.contains("hidden")) {
      window.APP_SHELL.closeLegalModal();
    }
  }
});

function initUniversalFPS() {
  if (typeof window === "undefined" || window._fpsTrackerActive) return;
  const fpsEl = document.getElementById("live-fps");
  if (!fpsEl) return;
  window._fpsTrackerActive = true;
  let lastTime = performance.now();
  let frames = 0;
  function updateFPS(now) {
    frames++;
    if (now >= lastTime + 1000) {
      const currentFPS = (frames * 1000) / (now - lastTime);
      const fpsStr = currentFPS.toFixed(1);
      const el = document.getElementById("live-fps");
      if (el) el.textContent = fpsStr;
      const capEl = document.getElementById("capability-fps");
      if (capEl) capEl.textContent = fpsStr;
      frames = 0;
      lastTime = now;
    }
    requestAnimationFrame(updateFPS);
  }
  requestAnimationFrame(updateFPS);
}

/* ==========================================================================
   ASYMMETRIC ALPHA CONTENT SHIELD ENGINE
   Anti-Copy, Anti-Extraction, Screenshot Deterrence & Anti-Snipping Blur
   ========================================================================== */

function showShieldNotice(text) {
  if (typeof document === "undefined") return;
  let toast = document.getElementById("shieldNoticeToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "shieldNoticeToast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.add("visible");
  if (window._shieldToastTimer) clearTimeout(window._shieldToastTimer);
  window._shieldToastTimer = setTimeout(() => {
    toast.classList.remove("visible");
  }, 2800);
}

function triggerShieldStrobe() {
  if (typeof document === "undefined") return;
  let strobe = document.getElementById("shieldStrobeOverlay");
  if (!strobe) {
    strobe = document.createElement("div");
    strobe.id = "shieldStrobeOverlay";
    strobe.className = "shield-strobe-overlay";
    strobe.setAttribute("aria-hidden", "true");
    document.body.appendChild(strobe);
  }
  strobe.classList.add("flash");
  setTimeout(() => {
    strobe.classList.remove("flash");
  }, 140);
}

function isShieldExempt() {
  if (typeof window === "undefined") return false;
  try {
    const user = window.APP_SHELL?.session?.getUser?.();
    if (user?.email && typeof window.isApoorvOwnerEmail === "function" && window.isApoorvOwnerEmail(user.email)) {
      return true;
    }
    const saved = localStorage.getItem("sprintdial_user") || localStorage.getItem("sprintdial_google_user");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.email && typeof window.isApoorvOwnerEmail === "function" && window.isApoorvOwnerEmail(parsed.email)) {
        return true;
      }
    }
  } catch (e) {}
  return false;
}

function syncShieldOwnerExemption() {
  if (typeof document === "undefined") return;
  const exempt = isShieldExempt();
  if (document.body) document.body.classList.toggle("shield-owner-exempt", exempt);
  if (document.documentElement) document.documentElement.classList.toggle("shield-owner-exempt", exempt);
  if (exempt) {
    const shieldEl = document.getElementById("antiSnippingShield");
    if (shieldEl) shieldEl.classList.remove("active");
    const cockpit = document.getElementById("workspaceCockpitContainer");
    if (cockpit) cockpit.classList.remove("anti-snipping-blurred");
  }
}

function initContentShield() {
  if (typeof window === "undefined" || window._contentShieldInitialized) return;
  window._contentShieldInitialized = true;
  syncShieldOwnerExemption();

  // 1. Asset Drag Protection
  document.addEventListener("dragstart", (e) => {
    if (isShieldExempt()) return;
    const target = e.target;
    if (!target) return;
    if (
      target.tagName === "IMG" ||
      target.tagName === "CANVAS" ||
      (typeof target.closest === "function" && target.closest(".shield-protected"))
    ) {
      e.preventDefault();
    }
  });

  // 2. Context Menu (Right Click) Guard
  document.addEventListener("contextmenu", (e) => {
    if (isShieldExempt()) return;
    const target = e.target;
    // Allow standard right-click context menu within input and textarea elements
    if (
      target &&
      (target.tagName === "INPUT" ||
       target.tagName === "TEXTAREA" ||
       target.isContentEditable)
    ) {
      return;
    }
    const isProtected =
      isWorkspaceRoute() ||
      (typeof target?.closest === "function" &&
        (target.closest(".shield-protected") ||
         target.closest("#three-canvas") ||
         target.closest("#game-canvas")));

    if (isProtected) {
      e.preventDefault();
      showShieldNotice("🔒 Security Shield: Context inspection is disabled on protected surfaces.");
    }
  });

  // 3. Selective Copy Event Interception & Attribution Poisoning
  document.addEventListener("copy", (e) => {
    if (isShieldExempt()) return;
    const activeEl = document.activeElement;
    // Usability Invariant: Typing or editing inside inputs/textareas must copy freely
    if (
      activeEl &&
      (activeEl.tagName === "INPUT" ||
       activeEl.tagName === "TEXTAREA" ||
       activeEl.isContentEditable)
    ) {
      return;
    }

    const selection = window.getSelection ? window.getSelection() : null;
    const selectedText = selection ? selection.toString() : "";
    const anchorNode = selection && selection.anchorNode ? selection.anchorNode : null;
    const parentEl = anchorNode ? (anchorNode.nodeType === 1 ? anchorNode : anchorNode.parentElement) : null;

    const isInsideProtected =
      isWorkspaceRoute() ||
      (parentEl && typeof parentEl.closest === "function" && parentEl.closest(".shield-protected"));

    if (isInsideProtected && selectedText.length > 0) {
      e.preventDefault();
      const legalAttribution =
        "CONFIDENTIAL & PROPRIETARY // APOORV A S (apoorv.qzz.io). Unauthorized reproduction, scraping, or distribution is prohibited under the IT Act 2000 & Asymmetric Alpha Protocol.";
      if (e.clipboardData) {
        e.clipboardData.setData("text/plain", legalAttribution);
      }
      showShieldNotice("🛡️ Content Protected: Proprietary material cannot be extracted.");
      if (window.System1Brain && typeof window.System1Brain.emitThought === "function") {
        window.System1Brain.emitThought("🛡️ Content protected by Asymmetric Alpha Shield!", 2500);
      }
    }
  });

  // 4. PrintScreen Key Detection & Clipboard Purge
  window.addEventListener("keyup", (e) => {
    if (isShieldExempt()) return;
    if (e.key === "PrintScreen" || e.keyCode === 44) {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        navigator.clipboard.writeText("").catch(() => {});
      }
      triggerShieldStrobe();
      showShieldNotice("📸 Screen Capture Restricted // Clipboard purged.");
    }
  });

  // 5. Shortcut Traps (Print, Save Page, View Source, DevTools on Workspace)
  window.addEventListener("keydown", (e) => {
    if (isShieldExempt()) return;
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    const key = e.key ? e.key.toLowerCase() : "";

    // Trap Print (Ctrl+P / Cmd+P)
    if (isCtrlOrCmd && key === "p") {
      e.preventDefault();
      showShieldNotice("🖨️ Printing and PDF export are restricted.");
      return;
    }

    // Trap Save Page (Ctrl+S / Cmd+S)
    if (isCtrlOrCmd && key === "s") {
      // Allow saving if user is typing inside an input/textarea
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")) {
        return;
      }
      e.preventDefault();
      showShieldNotice("💾 Source page saving is restricted.");
      return;
    }

    // Trap View Source (Ctrl+U / Cmd+U)
    if (isCtrlOrCmd && key === "u") {
      e.preventDefault();
      showShieldNotice("🔒 Source inspection is restricted.");
      return;
    }

    // DevTools Lock strictly on /workspace/ route (keep public routes unblocked for prospective tech buyers)
    if (isWorkspaceRoute()) {
      if (
        e.key === "F12" ||
        (isCtrlOrCmd && e.shiftKey && (key === "i" || key === "j" || key === "c"))
      ) {
        e.preventDefault();
        showShieldNotice("🔒 Developer tools disabled on confidential cockpit.");
      }
    }
  });

  // 6. Anti-Snipping Window Focus-Loss Blur (Active on Workspace)
  function handleWindowBlur() {
    if (isShieldExempt() || !isWorkspaceRoute()) {
      const shieldEl = document.getElementById("antiSnippingShield");
      if (shieldEl) shieldEl.classList.remove("active");
      const cockpit = document.getElementById("workspaceCockpitContainer");
      if (cockpit) cockpit.classList.remove("anti-snipping-blurred");
      return;
    }
    const shieldEl = document.getElementById("antiSnippingShield");
    if (shieldEl) shieldEl.classList.add("active");
    const cockpit = document.getElementById("workspaceCockpitContainer");
    if (cockpit) cockpit.classList.add("anti-snipping-blurred");
  }

  function handleWindowFocus() {
    if (!isWorkspaceRoute() || isShieldExempt()) {
      const shieldEl = document.getElementById("antiSnippingShield");
      if (shieldEl) shieldEl.classList.remove("active");
      const cockpit = document.getElementById("workspaceCockpitContainer");
      if (cockpit) cockpit.classList.remove("anti-snipping-blurred");
      return;
    }
    const shieldEl = document.getElementById("antiSnippingShield");
    if (shieldEl) shieldEl.classList.remove("active");
    const cockpit = document.getElementById("workspaceCockpitContainer");
    if (cockpit) cockpit.classList.remove("anti-snipping-blurred");
  }

  window.addEventListener("blur", handleWindowBlur);
  window.addEventListener("focus", handleWindowFocus);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      handleWindowBlur();
    } else {
      handleWindowFocus();
    }
  });
}

if (window.APP_SHELL) {
  window.APP_SHELL.initContentShield = initContentShield;
  window.APP_SHELL.showShieldNotice = showShieldNotice;
  window.APP_SHELL.triggerShieldStrobe = triggerShieldStrobe;
  window.APP_SHELL.isShieldExempt = isShieldExempt;
  window.APP_SHELL.syncShieldOwnerExemption = syncShieldOwnerExemption;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initMobileDrawer();
    initUniversalFPS();
    initContentShield();
    window.APP_SHELL?.initUniversalTopbar?.();
  });
} else {
  initMobileDrawer();
  initUniversalFPS();
  initContentShield();
  window.APP_SHELL?.initUniversalTopbar?.();
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

