const API_BASE = window.SALES_PLATFORM_CONFIG?.apiBase || "/api";
const shell = window.APP_SHELL;
const workspace = document.getElementById("workspace");
const workspaceData = document.getElementById("workspace-data");
const workspaceRole = document.getElementById("workspace-role");
const authPlaceholder = document.getElementById("auth-placeholder");
const topbarSignIn = document.getElementById("topbar-sign-in");
const topbarUser = document.getElementById("topbar-user");
const topbarUserEmail = document.getElementById("topbar-user-email");
const topbarSignOut = document.getElementById("topbar-sign-out");
const formSignIn = document.getElementById("sign-in");
const formAuthStatus = document.getElementById("form-auth-status");
const inquiryForm = document.getElementById("inquiry-form");

function setStatus(message, isError = false) {
  shell?.status?.set(message, isError);
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (shell?.session?.idToken) headers.Authorization = `Bearer ${shell.session.idToken}`;
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error?.message || payload.message || "Request failed");
  return payload;
}

function saveInquiryLocally(data) {
  try {
    const existing = JSON.parse(localStorage.getItem("apoorv_inquiries") || "[]");
    existing.unshift({ id: `inq_${Date.now()}`, timestamp: new Date().toISOString(), ...data });
    localStorage.setItem("apoorv_inquiries", JSON.stringify(existing.slice(0, 50)));
  } catch (err) {
    console.warn("Failed to persist inquiry locally", err);
  }
}

async function dispatchWebhook(values) {
  const webhookUrl = window.SALES_PLATFORM_CONFIG?.webhookUrl;
  if (!webhookUrl) return false;
  try {
    let body;
    if (webhookUrl.includes("discord.com/api/webhooks")) {
      body = JSON.stringify({
        username: "Apoorv Studio Radar",
        avatar_url: "https://apoorv.qzz.io/favicon.ico",
        embeds: [{
          title: "🚀 New Project Inquiry Received!",
          color: 0xfce566,
          fields: [
            { name: "👤 Client / Name", value: values.name || "N/A", inline: true },
            { name: "✉️ Email", value: values.email || "N/A", inline: true },
            { name: "🎯 Scope", value: values.scope || "N/A", inline: true },
            { name: "💰 Budget Tier", value: values.budget || "N/A", inline: true },
            { name: "📝 Message", value: values.message || "No message provided" }
          ],
          footer: { text: "Apoorv Studio Sales Platform • apoorv.qzz.io" },
          timestamp: new Date().toISOString()
        }]
      });
    } else {
      body = JSON.stringify({ ...values, timestamp: new Date().toISOString(), source: "apoorv.qzz.io/sales" });
    }

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body
    });
    return res.ok;
  } catch (err) {
    console.warn("Webhook dispatch error:", err);
    return false;
  }
}

async function submitPublicForm(event, path, successMessage) {
  event.preventDefault();
  const form = event.currentTarget;
  const values = Object.fromEntries(new FormData(form));
  const submit = form.querySelector('button[type="submit"]');
  setStatus("Dispatching inquiry...");
  form.setAttribute("aria-busy", "true");
  if (submit) {
    submit.disabled = true;
    submit.dataset.origText = submit.textContent;
    submit.textContent = "[ ⚡ DISPATCHING... ]";
  }

  if (path === "/inquiry") {
    saveInquiryLocally(values);
  }

  let webhookDelivered = false;
  if (window.SALES_PLATFORM_CONFIG?.webhookUrl) {
    webhookDelivered = await dispatchWebhook(values);
  }

  try {
    await request(path, { method: "POST", body: JSON.stringify(values) });
    form.reset();
    setStatus(successMessage);
    if (submit) {
      submit.classList.add("success");
      submit.textContent = "[ ✓ INQUIRY DISPATCHED ]";
      setTimeout(() => {
        submit.classList.remove("success");
        submit.textContent = submit.dataset.origText || "Send inquiry";
      }, 4000);
    }
    // Reset field feedbacks
    document.querySelectorAll(".field-feedback").forEach(el => { el.textContent = ""; el.className = "field-feedback"; });
    document.querySelectorAll("#inquiry-form input, #inquiry-form textarea").forEach(el => el.classList.remove("is-valid", "is-invalid"));
    const fallbackBox = form.querySelector(".inquiry-fallback-box");
    if (fallbackBox) fallbackBox.remove();
  } catch (error) {
    if (webhookDelivered) {
      form.reset();
      setStatus("Inquiry dispatched via notification rail! Apoorv will follow up within 24 hours.");
      if (submit) {
        submit.classList.add("success");
        submit.textContent = "[ ✓ INQUIRY DISPATCHED ]";
        setTimeout(() => {
          submit.classList.remove("success");
          submit.textContent = submit.dataset.origText || "Send inquiry";
        }, 4000);
      }
    } else {
      setStatus(error instanceof Error ? error.message : "Unable to submit the form.", true);
      if (submit) {
        submit.textContent = submit.dataset.origText || "Send inquiry";
      }
      if (path === "/inquiry") {
        const subject = encodeURIComponent(`Project Inquiry: ${values.scope || "Creative Engineering"} - ${values.name || "Client"}`);
        const body = encodeURIComponent(`Hi Apoorv,\n\nName: ${values.name || ""}\nEmail: ${values.email || ""}\nScope: ${values.scope || ""}\nBudget: ${values.budget || ""}\n\nMessage:\n${values.message || ""}\n`);
        const mailto = `mailto:${window.SALES_PLATFORM_CONFIG?.directEmail || "apoorvxs@gmail.com"}?subject=${subject}&body=${body}`;

        let fallbackBox = form.querySelector(".inquiry-fallback-box");
        if (!fallbackBox) {
          fallbackBox = document.createElement("div");
          fallbackBox.className = "inquiry-fallback-box";
          fallbackBox.style.cssText = "margin-top:14px; padding:12px; background:var(--white); border:2px solid var(--ink); box-shadow:3px 3px 0 var(--ink); font-family:'Courier Prime',monospace; font-size:13px; text-align:left;";
          form.appendChild(fallbackBox);
        }
        fallbackBox.textContent = "";
        const titleDiv = document.createElement("div");
        titleDiv.style.cssText = "font-weight:bold; color:var(--ink); margin-bottom:6px;";
        titleDiv.textContent = "⚡ Direct Dispatch Fallback:";
        const descDiv = document.createElement("div");
        descDiv.style.cssText = "margin-bottom:10px; color:var(--ink); font-size:12px;";
        descDiv.textContent = "Network endpoint was unreachable, but your details are safely stored. Tap below to dispatch directly:";
        const wrapDiv = document.createElement("div");
        wrapDiv.style.cssText = "display:flex; gap:10px; flex-wrap:wrap;";
        const emailLink = document.createElement("a");
        emailLink.href = mailto;
        emailLink.style.cssText = "padding:6px 14px; background:var(--accent-yellow); border:2px solid var(--ink); color:var(--ink); text-decoration:none; font-weight:bold; font-size:12px; display:inline-flex; align-items:center; gap:6px;";
        emailLink.textContent = "✉️ Dispatch via Email";
        wrapDiv.appendChild(emailLink);
        fallbackBox.appendChild(titleDiv);
        fallbackBox.appendChild(descDiv);
        fallbackBox.appendChild(wrapDiv);
      }
    }
  } finally {
    form.removeAttribute("aria-busy");
    if (submit) submit.disabled = false;
  }
}

async function syncAuthState() {
  const identity = await shell?.session?.getIdentity?.() || {};
  const sessionUser = shell?.session?.user || null;
  const email = identity.email || sessionUser?.email || "";
  const name = identity.displayName || sessionUser?.displayName || "";

  if (email || name) {
    // Topbar UI update
    if (topbarSignIn) topbarSignIn.style.display = "none";
    if (topbarUser) {
      topbarUser.style.display = "inline-flex";
      if (topbarUserEmail) topbarUserEmail.textContent = email || name;
    }
    // Form UI update
    if (formSignIn) formSignIn.style.display = "none";
    if (formAuthStatus) {
      formAuthStatus.textContent = "";
      const verifiedSpan = document.createElement("span");
      verifiedSpan.style.cssText = "color: #10b981; font-weight: bold;";
      verifiedSpan.textContent = "✓ Verified with Google: ";
      const emailSpan = document.createElement("span");
      emailSpan.textContent = email;
      formAuthStatus.appendChild(verifiedSpan);
      formAuthStatus.appendChild(emailSpan);
    }
    // Auto-fill inquiry form inputs
    if (inquiryForm) {
      const nameInput = inquiryForm.querySelector('input[name="name"]');
      const emailInput = inquiryForm.querySelector('input[name="email"]');
      if (nameInput && (!nameInput.value || nameInput.value === "") && name) {
        nameInput.value = name;
        nameInput.dispatchEvent(new Event("input"));
      }
      if (emailInput && (!emailInput.value || emailInput.value === "") && email) {
        emailInput.value = email;
        emailInput.dispatchEvent(new Event("input"));
      }
    }
  } else {
    // Reset to logged out
    if (topbarSignIn) topbarSignIn.style.display = "inline-flex";
    if (topbarUser) topbarUser.style.display = "none";
    if (formSignIn) formSignIn.style.display = "inline-flex";
    if (formAuthStatus) {
      formAuthStatus.textContent = "Sign in with Google to auto-fill verified contact details.";
    }
  }
}

async function handleGoogleSignIn() {
  try {
    setStatus("Opening Google sign-in...");
    if (topbarSignIn) topbarSignIn.disabled = true;
    if (formSignIn) formSignIn.disabled = true;
    await shell.session.signIn();
    await syncAuthState();
    setStatus("Signed in with Google.");
    await loadWorkspace().catch(() => {});
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Sign-in was cancelled.", true);
  } finally {
    if (topbarSignIn) topbarSignIn.disabled = false;
    if (formSignIn) formSignIn.disabled = false;
  }
}

async function loadWorkspace() {
  try {
    const payload = await request("/workspace");
    const workspacePayload = payload.data || payload;
    const sessionUser = await shell?.session?.getIdentity?.() || {};
    const user = { ...sessionUser, ...(payload.user || {}), ...(workspacePayload.user || {}) };
    const records = workspacePayload.data || workspacePayload;
    const identity = user.displayName || user.email || user.uid || "authenticated user";
    const role = user.role || workspacePayload.role || "authorized user";
    if (authPlaceholder) authPlaceholder.hidden = true;
    if (workspace) workspace.hidden = false;
    if (workspaceRole) workspaceRole.textContent = `Signed in as ${identity} (${role})`;
    const recordEntries = Object.entries(records).filter(([, value]) => Array.isArray(value));
    if (workspaceData) {
      workspaceData.textContent = recordEntries.length && recordEntries.some(([, value]) => value.length)
        ? JSON.stringify(records, null, 2)
        : role === "owner"
          ? "No applications yet. New project inquiries will appear here."
          : "No workspace records yet.";
    }
  } catch (error) {
    if (authPlaceholder) authPlaceholder.hidden = false;
    if (workspace) workspace.hidden = true;
  }
}

inquiryForm?.addEventListener("invalid", (event) => {
  const target = event.target;
  const fieldName = target.getAttribute("name") || "contact";
  window.System1Brain?.onValidationFail?.(fieldName.charAt(0).toUpperCase() + fieldName.slice(1));
}, true);

inquiryForm?.addEventListener("submit", (event) => {
  const form = event.currentTarget;
  const name = form.querySelector('input[name="name"]')?.value?.trim();
  const email = form.querySelector('input[name="email"]')?.value?.trim();
  const msg = form.querySelector('textarea[name="message"]')?.value?.trim();

  if (!name) {
    window.System1Brain?.onValidationFail?.("Name");
  } else if (!email) {
    window.System1Brain?.onValidationFail?.("Email");
  } else if (!msg) {
    window.System1Brain?.onValidationFail?.("Message");
  }

  submitPublicForm(event, "/inquiry", "Inquiry received. Apoorv will follow up within 24 hours.");
});


document.getElementById("application-form")?.addEventListener("submit", (event) => {
  submitPublicForm(event, "/application", "Application received for review.");
});

topbarSignIn?.addEventListener("click", handleGoogleSignIn);
formSignIn?.addEventListener("click", handleGoogleSignIn);

topbarSignOut?.addEventListener("click", () => {
  shell?.session?.clear?.();
  syncAuthState();
  if (workspace) workspace.hidden = true;
  setStatus("Signed out.");
});

document.getElementById("refresh-workspace")?.addEventListener("click", loadWorkspace);

if (shell?.session?.resumeRedirect) {
  shell.session.resumeRedirect()
    .then((resumed) => {
      if (resumed) {
        syncAuthState();
        return loadWorkspace();
      }
    })
    .catch((error) => setStatus(error instanceof Error ? error.message : "Unable to resume sign-in.", true));
}

function updateDeliverablesChecklist(scope = "Performance Sprint", budget = "$5k - $15k") {
  const container = document.getElementById("engagement-deliverables-list");
  const badge = document.getElementById("deliverables-tier-badge");
  const turnaround = document.getElementById("deliverables-turnaround-badge");
  if (!container) return;

  const isSprint = scope === "Performance Sprint" || budget === "Under $1k";
  const isFeature = scope === "3D Web Feature" || budget === "$1k - $5k";
  const isConfigurator = scope === "Product Configurator";
  const isEnterprise = scope === "Full Interactive Site" || budget === "$15k+";

  let badgeText = "FLAGSHIP 3D BUILD";
  let turnaroundText = "2–3 Weeks Turnaround";
  let items = [
    { title: "⚡ Rapid Response", desc: "Direct feedback & detailed architecture scoping within 24 hours." },
    { title: "🎯 60 FPS Guarantee", desc: "Strict 16.6ms frame budget, DPR clamp, and zero GPU memory leaks." },
    { title: "📦 Featherweight Delivery", desc: "Sub-5MB Draco/KTX2 payloads designed for instant mobile 4G loads." },
    { title: "🛡 Milestone Security", desc: "Structured 50/25/25 milestone terms with staged preview environments." }
  ];

  if (isSprint) {
    badgeText = "60 FPS PERFORMANCE SPRINT";
    turnaroundText = "3–5 Business Days";
    items = [
      { title: "⚡ Frame Budget Lock", desc: "Full render loop profiling to eliminate dropped frames and stutter." },
      { title: "🎯 Core Web Vitals", desc: "Mobile LCP reduced under 1.2s and layout shifts (CLS) eradicated." },
      { title: "📦 Zero Memory Leaks", desc: "Full dispose() lifecycle hooks on all WebGL textures and buffers." },
      { title: "🛡 Empirical Verification", desc: "Side-by-side 24 FPS vs 60 FPS benchmarks delivered before handoff." }
    ];
  } else if (isFeature) {
    badgeText = "3D WEBUI & SHADER FEATURE";
    turnaroundText = "1–2 Weeks Turnaround";
    items = [
      { title: "⚡ Custom GLSL Shaders", desc: "Branchless procedural fragment math and custom post-processing." },
      { title: "🎯 Interactive Choreography", desc: "Camera lerp damping and tactile scroll-linked spatial transitions." },
      { title: "📦 Mobile Touch Optimization", desc: "Touch-safe gestures and adaptive DPR clamping across all devices." },
      { title: "🛡 Turnkey Delivery", desc: "Drop-in Three.js / WebGL component with clean API contracts." }
    ];
  } else if (isConfigurator) {
    badgeText = "3D PRODUCT CONFIGURATOR";
    turnaroundText = "2–3 Weeks Turnaround";
    items = [
      { title: "⚡ Real-Time Material Switcher", desc: "Physically-based rendering (PBR) with instant variant swaps." },
      { title: "🎯 Orbit & Momentum Damping", desc: "Fluid 3D manipulation with smooth inertia and limits." },
      { title: "📦 Featherweight Asset Pipeline", desc: "Meshopt + Draco geometry compression with KTX2 textures (< 5MB)." },
      { title: "🛡 Milestone Security", desc: "Structured 50/25/25 milestone terms with staged preview environments." }
    ];
  } else if (isEnterprise) {
    badgeText = "ENTERPRISE SPATIAL ECOSYSTEM";
    turnaroundText = "4–6 Weeks Sprint";
    items = [
      { title: "⚡ Ground-Up WebGPU Pipeline", desc: "Next-generation compute shaders and high-density particle systems." },
      { title: "🎯 Bespoke Spatial Experience", desc: "Multi-scene architectural narrative with sound design integration." },
      { title: "📦 Sub-5MB Enterprise Payload", desc: "Maximum compression and streaming asset chunking." },
      { title: "🛡 Dedicated Senior Engineering", desc: "Direct weekly architecture reviews and guaranteed SLA." }
    ];
  }

  if (badge) badge.textContent = badgeText;
  if (turnaround) turnaround.textContent = turnaroundText;

  container.innerHTML = items.map(item => `
    <div data-kaboom-body="true" style="padding:10px 12px; background:var(--cream); border:2px solid var(--ink);">
      <strong>${item.title}:</strong> ${item.desc}
    </div>
  `).join("");
}

// --- 1-CLICK CHIP GROUPS & LIVE VALIDATION WORKFLOWS ---
function initChipGroups() {
  // Scope chips
  const scopeSelect = document.getElementById("inquiry-scope");
  const scopeChips = document.querySelectorAll("#scope-chips .tier-chip");
  const budgetSelect = document.getElementById("inquiry-budget");
  const budgetChips = document.querySelectorAll("#budget-chips .tier-chip");

  const syncDeliverables = () => {
    updateDeliverablesChecklist(scopeSelect?.value, budgetSelect?.value);
  };

  scopeChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const val = chip.dataset.val;
      scopeChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      if (scopeSelect) {
        scopeSelect.value = val;
        scopeSelect.dispatchEvent(new Event("change"));
      }
      syncDeliverables();
    });
  });
  if (scopeSelect) {
    scopeSelect.addEventListener("change", () => {
      scopeChips.forEach((c) => {
        c.classList.toggle("active", c.dataset.val === scopeSelect.value);
      });
      syncDeliverables();
    });
  }

  // Budget chips
  budgetChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const val = chip.dataset.val;
      budgetChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      if (budgetSelect) {
        budgetSelect.value = val;
        budgetSelect.dispatchEvent(new Event("change"));
      }
      syncDeliverables();
    });
  });
  if (budgetSelect) {
    budgetSelect.addEventListener("change", () => {
      budgetChips.forEach((c) => {
        c.classList.toggle("active", c.dataset.val === budgetSelect.value);
      });
      syncDeliverables();
    });
  }

  syncDeliverables();
}

function initLiveValidation() {
  const nameInp = document.getElementById("inquiry-name");
  const emailInp = document.getElementById("inquiry-email");
  const msgInp = document.getElementById("inquiry-message");
  const fbName = document.getElementById("feedback-name");
  const fbEmail = document.getElementById("feedback-email");
  const fbMsg = document.getElementById("feedback-message");

  const validateName = () => {
    if (!nameInp) return;
    const val = nameInp.value.trim();
    if (!val) {
      nameInp.classList.remove("is-valid", "is-invalid");
      if (fbName) { fbName.textContent = ""; fbName.className = "field-feedback"; }
    } else if (val.length >= 2) {
      nameInp.classList.remove("is-invalid");
      nameInp.classList.add("is-valid");
      if (fbName) { fbName.textContent = "✓ READY"; fbName.className = "field-feedback valid"; }
    }
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validateEmail = () => {
    if (!emailInp) return;
    const val = emailInp.value.trim();
    if (!val) {
      emailInp.classList.remove("is-valid", "is-invalid");
      if (fbEmail) { fbEmail.textContent = ""; fbEmail.className = "field-feedback"; }
    } else if (emailRegex.test(val)) {
      emailInp.classList.remove("is-invalid");
      emailInp.classList.add("is-valid");
      if (fbEmail) { fbEmail.textContent = "✓ VERIFIED"; fbEmail.className = "field-feedback valid"; }
    } else {
      emailInp.classList.remove("is-valid");
      emailInp.classList.add("is-invalid");
      if (fbEmail) { fbEmail.textContent = "INVALID EMAIL"; fbEmail.className = "field-feedback invalid"; }
    }
  };

  const validateMessage = () => {
    if (!msgInp) return;
    const val = msgInp.value.trim();
    if (!val) {
      msgInp.classList.remove("is-valid", "is-invalid");
      if (fbMsg) { fbMsg.textContent = ""; fbMsg.className = "field-feedback"; }
    } else if (val.length >= 10) {
      msgInp.classList.remove("is-invalid");
      msgInp.classList.add("is-valid");
      if (fbMsg) { fbMsg.textContent = `✓ ${val.length} CHARS`; fbMsg.className = "field-feedback valid"; }
    } else {
      msgInp.classList.remove("is-valid");
      if (fbMsg) { fbMsg.textContent = `${val.length}/10 MIN`; fbMsg.className = "field-feedback"; }
    }
  };

  nameInp?.addEventListener("input", validateName);
  emailInp?.addEventListener("input", validateEmail);
  msgInp?.addEventListener("input", validateMessage);
  nameInp?.addEventListener("blur", validateName);
  emailInp?.addEventListener("blur", validateEmail);
  msgInp?.addEventListener("blur", validateMessage);
}

// ============================================================================
// DIRECT 15-MINUTE STRATEGY CONSULTATION CONTROLLER (GOOGLE MEET / CALENDAR)
// ============================================================================
function openConsultationModal() {
  const modal = document.getElementById("consultationModal");
  if (!modal) return;
  modal.classList.remove("hidden");

  // Reset confirmation state if re-opening
  const formBox = document.getElementById("consult-form-container");
  const confirmBox = document.getElementById("consult-confirmation");
  if (formBox) formBox.classList.remove("hidden");
  if (confirmBox) confirmBox.classList.add("hidden");

  // Auto-fill from signed-in user if available
  const nameInp = document.getElementById("consult-name");
  const emailInp = document.getElementById("consult-email");
  const user = shell?.session?.user || window.currentUser;
  if (user) {
    if (nameInp && !nameInp.value) nameInp.value = user.displayName || user.name || "";
    if (emailInp && !emailInp.value) emailInp.value = user.email || "";
  }

  // Detect and display user timezone
  const tzInp = document.getElementById("consult-timezone");
  if (tzInp) {
    try {
      tzInp.value = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch (e) {
      tzInp.value = "UTC";
    }
  }

  // Pre-fill tomorrow 14:00 if empty
  const dtInp = document.getElementById("consult-datetime");
  if (dtInp && !dtInp.value) {
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
    tomorrow.setHours(14, 0, 0, 0);
    const pad = n => String(n).padStart(2, '0');
    dtInp.value = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`;
    dtInp.min = new Date().toISOString().slice(0, 16);
  }

  if (nameInp) nameInp.focus();
}

function closeConsultationModal() {
  const modal = document.getElementById("consultationModal");
  if (modal) modal.classList.add("hidden");
  const triggerBtn = document.getElementById("btn-open-consultation");
  if (triggerBtn) triggerBtn.focus();
}

function initConsultationChips() {
  const chips = document.querySelectorAll("#consult-focus-chips .tier-chip");
  const hiddenInp = document.getElementById("consult-focus");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      const val = chip.getAttribute("data-val");
      if (hiddenInp && val) hiddenInp.value = val;
    });
  });
}

function generateGoogleCalendarUrl({ name, email, focus, url, datetime, notes }) {
  let startDate = new Date(datetime);
  if (isNaN(startDate.getTime())) {
    startDate = new Date(Date.now() + 24 * 3600 * 1000);
  }
  const endDate = new Date(startDate.getTime() + 15 * 60 * 1000); // 15 mins
  const formatGCalDate = d => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const title = encodeURIComponent(`15-Min Strategy Walkthrough: ${name} & Apoorv A S`);
  const details = encodeURIComponent(
    `15-Minute Engineering Strategy Consultation\n\n` +
    `Client: ${name} (${email})\n` +
    `Focus Area: ${focus || 'General 3D/Performance Exploration'}\n` +
    `Target URL/Repo: ${url || 'N/A'}\n` +
    `Objectives: ${notes || 'N/A'}\n\n` +
    `Host: Apoorv A S (apoorvxs@gmail.com)\n` +
    `Platform: Google Meet\n\n` +
    `Portfolio: https://apoorv.qzz.io`
  );
  const dates = `${formatGCalDate(startDate)}/${formatGCalDate(endDate)}`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&add=${encodeURIComponent(email)}&add=apoorvxs@gmail.com`;
}

async function handleConsultationSubmit(event) {
  event.preventDefault();
  const name = document.getElementById("consult-name")?.value?.trim() || "";
  const email = document.getElementById("consult-email")?.value?.trim() || "";
  const focus = document.getElementById("consult-focus")?.value || "60 FPS Performance Audit";
  const url = document.getElementById("consult-url")?.value?.trim() || "";
  const datetime = document.getElementById("consult-datetime")?.value || "";
  const timezone = document.getElementById("consult-timezone")?.value || "UTC";
  const notes = document.getElementById("consult-notes")?.value?.trim() || "";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Please provide a valid email address so we can confirm the calendar invitation.");
    return;
  }

  const consultData = { name, email, focus, url, datetime, timezone, notes, timestamp: new Date().toISOString() };

  // Save locally
  try {
    const saved = JSON.parse(localStorage.getItem("apoorv_consultations") || "[]");
    saved.unshift(consultData);
    localStorage.setItem("apoorv_consultations", JSON.stringify(saved.slice(0, 20)));
  } catch (e) {}

  // Dispatch webhook notification if available
  const webhookUrl = window.SALES_PLATFORM_CONFIG?.webhookUrl;
  if (webhookUrl && webhookUrl.includes("discord.com/api/webhooks")) {
    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Apoorv Strategy Radar",
        avatar_url: "https://apoorv.qzz.io/favicon.ico",
        embeds: [{
          title: "📅 15-Minute Strategy Walkthrough Requested!",
          color: 0x6d3bb8,
          fields: [
            { name: "👤 Client", value: name || "N/A", inline: true },
            { name: "✉️ Email", value: email || "N/A", inline: true },
            { name: "🎯 Focus", value: focus || "N/A", inline: true },
            { name: "⏰ Preferred Time", value: `${datetime} (${timezone})`, inline: true },
            { name: "🔗 Target URL", value: url || "None provided", inline: true },
            { name: "📝 Notes", value: notes || "None provided" }
          ],
          footer: { text: "Direct Strategy Engine • apoorv.qzz.io/sales" },
          timestamp: new Date().toISOString()
        }]
      })
    }).catch(() => {});
  }

  // Generate Google Calendar Link
  const calUrl = generateGoogleCalendarUrl(consultData);
  const calLink = document.getElementById("consult-calendar-link");
  if (calLink) calLink.href = calUrl;

  const confirmText = document.getElementById("consult-confirm-text");
  if (confirmText) {
    confirmText.innerHTML = `Your walkthrough for <strong>${name}</strong> regarding <strong>${focus}</strong> on <strong>${datetime.replace('T', ' ')}</strong> (${timezone}) is ready. Click below to add it to Google Calendar with pre-configured Google Meet coordinates.`;
  }

  // Switch to confirmation view
  const formBox = document.getElementById("consult-form-container");
  const confirmBox = document.getElementById("consult-confirmation");
  if (formBox) formBox.classList.add("hidden");
  if (confirmBox) confirmBox.classList.remove("hidden");

  // Companion celebration if active
  if (window.System1Brain?.emitThought) {
    window.System1Brain.emitThought("⚡ Strategy walkthrough confirmed!");
  }
}

// Global modal dismiss on Escape key
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeConsultationModal();
  }
});

// Initial initialization
initChipGroups();
initLiveValidation();
initConsultationChips();
syncAuthState();

// Export controllers for global / inline access
if (typeof window !== "undefined") {
  window.openConsultationModal = openConsultationModal;
  window.closeConsultationModal = closeConsultationModal;
  window.handleConsultationSubmit = handleConsultationSubmit;
  window.generateGoogleCalendarUrl = generateGoogleCalendarUrl;
}


