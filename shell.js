const portfolioScripts = [
  "kaboom.js?v=1001",
  "babylon_engine.js?v=1001",
  "player_3d.js?v=1001",
  "player.js?v=1001",
  "portfolio_engine.js?v=1001"
];

function isSalesRoute(pathname = window.location.pathname) {
  return pathname === "/sales" || pathname.startsWith("/sales/") || pathname.endsWith("/sales.html");
}

function setActiveNavigation(root = document) {
  const sales = isSalesRoute();
  root.querySelectorAll(".site-nav a").forEach((link) => {
    const target = link.getAttribute("href") || "";
    const active = sales ? target.includes("sales") : target === "/" || target === "index.html";
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
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

async function loadPortfolio() {
  for (const script of portfolioScripts) await loadScript(script);
  window.showUIButtons?.();
}

async function loadSalesRoute() {
  if (window.location.pathname.endsWith("/sales.html")) return;
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
    return this.setSession(await auth.signIn());
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

setActiveNavigation();
if (isSalesRoute()) {
  loadSalesRoute().catch((error) => {
    document.body.textContent = "Sales view unavailable.";
    console.error(error);
  });
} else {
  loadPortfolio().catch((error) => {
    const status = document.createElement("p");
    status.className = "shell-status";
    status.textContent = error.message;
    document.body.appendChild(status);
  });
}
