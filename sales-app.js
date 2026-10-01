const API_BASE = window.SALES_PLATFORM_CONFIG?.apiBase || "/api";
const shell = window.APP_SHELL;
const workspace = document.getElementById("workspace");
const workspaceData = document.getElementById("workspace-data");
const workspaceRole = document.getElementById("workspace-role");
const authPlaceholder = document.getElementById("auth-placeholder");
const topbarSignIn = document.getElementById("topbar-sign-in");
const topbarUser = document.getElementById("topbar-user");
const topbarUserImg = document.getElementById("topbar-user-img");
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
        username: "Apoorv Client Radar",
        avatar_url: "https://apoorv.qzz.io/favicon.ico",
        embeds: [{
          title: "[INQUIRY] New Project Inquiry Received",
          color: 0xfce566,
          fields: [
            { name: "Client / Name", value: values.name || "N/A", inline: true },
            { name: "Email", value: values.email || "N/A", inline: true },
            { name: "Scope", value: values.scope || "N/A", inline: true },
            { name: "Budget Tier", value: values.budget || "N/A", inline: true },
            { name: "Message", value: values.message || "No message provided" }
          ],
          footer: { text: "Apoorv Client Radar • apoorv.qzz.io" },
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
  const consentCheckbox = form.querySelector('input[name="consent"]');
  if (consentCheckbox && !consentCheckbox.checked) {
    setStatus("Please accept the Terms of Engagement & DPDP Act consent before submitting.", true);
    consentCheckbox.focus();
    return;
  }
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
    if (typeof window !== "undefined" && typeof window.triggerHaptic === "function") {
      window.triggerHaptic(40);
    }
    if (window.Player3D && typeof window.Player3D.celebrateVictory === "function") {
      window.Player3D.celebrateVictory();
    }
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
      if (typeof window !== "undefined" && typeof window.triggerHaptic === "function") {
        window.triggerHaptic(40);
      }
      if (window.Player3D && typeof window.Player3D.celebrateVictory === "function") {
        window.Player3D.celebrateVictory();
      }
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
        titleDiv.textContent = "Direct Dispatch Fallback:";
        const descDiv = document.createElement("div");
        descDiv.style.cssText = "margin-bottom:10px; color:var(--ink); font-size:12px;";
        descDiv.textContent = "Network endpoint was unreachable, but your details are safely stored. Tap below to dispatch directly:";
        const wrapDiv = document.createElement("div");
        wrapDiv.style.cssText = "display:flex; gap:10px; flex-wrap:wrap;";
        const emailLink = document.createElement("a");
        emailLink.href = mailto;
        emailLink.style.cssText = "padding:6px 14px; background:var(--accent-yellow); border:2px solid var(--ink); color:var(--ink); text-decoration:none; font-weight:bold; font-size:12px; display:inline-flex; align-items:center; gap:6px;";
        emailLink.textContent = "Dispatch via Email";
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
  const photo = identity.photoURL || sessionUser?.photoURL || "";

  if (email || name) {
    // Form UI update
    if (formSignIn) formSignIn.style.display = "none";
    if (formAuthStatus) {
      formAuthStatus.textContent = "";
      const verifiedSpan = document.createElement("span");
      verifiedSpan.style.cssText = "color: #047857; font-weight: bold;";
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
    // Reset to logged out form state
    if (formSignIn) formSignIn.style.display = "inline-flex";
    if (formAuthStatus) {
      formAuthStatus.textContent = "Sign in with Google to auto-fill verified contact details.";
    }
  }

  // Universal topbar synchronization across routes
  window.APP_SHELL?.initUniversalTopbar?.();
}

let isSigningInGoogle = false;
async function handleGoogleSignIn() {
  if (isSigningInGoogle) return;
  isSigningInGoogle = true;
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
    isSigningInGoogle = false;
    if (topbarSignIn) topbarSignIn.disabled = false;
    if (formSignIn) formSignIn.disabled = false;
  }
}
window.handleGoogleSignIn = handleGoogleSignIn;

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
  if (fieldName === "consent") {
    setStatus("Please accept the Terms of Engagement & DPDP Act consent before submitting.", true);
  }
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

topbarSignOut?.addEventListener("click", async () => {
  shell?.session?.clear?.();
  if (window.SALES_PLATFORM_AUTH?.getAuth) {
    try {
      const auth = await window.SALES_PLATFORM_AUTH.getAuth();
      await auth.signOut?.();
    } catch (e) {}
  }
  await syncAuthState();
  if (workspace) workspace.hidden = true;
  setStatus("Signed out.");
});

// Real-time synchronization with Firebase Auth and cross-route localStorage
if (window.SALES_PLATFORM_AUTH?.getAuth) {
  window.SALES_PLATFORM_AUTH.getAuth().then((auth) => {
    auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        await shell?.session?.setSession?.(firebaseUser);
        await syncAuthState();
      } else {
        const saved = localStorage.getItem("sprintdial_user") || localStorage.getItem("sprintdial_google_user");
        if (!saved) {
          shell?.session?.clear?.();
          await syncAuthState();
        }
      }
    });
  }).catch(() => {});
}

window.addEventListener("storage", (e) => {
  if (e.key === "sprintdial_user" || e.key === "sprintdial_google_user") {
    syncAuthState();
  }
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

  const isSprint = scope === "Performance Sprint";
  const isFeature = scope === "3D Web Feature" || budget === "$5k - $15k";
  const isConfigurator = scope === "Product Configurator";
  const isEnterprise = scope === "Full Interactive Site" || budget === "$15k+" || budget === "$15k - $30k" || budget === "$30k+";

  let badgeText = "FLAGSHIP 3D BUILD";
  let turnaroundText = "2–3 Weeks Turnaround";
  let items = [
    { title: "[SLA] Rapid Response", desc: "Direct feedback & detailed architecture scoping within 24 hours." },
    { title: "[60FPS] Engine Guarantee", desc: "Strict 16.6ms frame budget, DPR clamp, and zero GPU memory leaks." },
    { title: "[KTX2] Featherweight Delivery", desc: "Sub-5MB Draco/KTX2 payloads designed for instant mobile 4G loads." },
    { title: "[ESCROW] Milestone Terms", desc: "Structured 50/25/25 milestone terms with staged preview environments." }
  ];

  if (isSprint) {
    badgeText = "60 FPS PERFORMANCE SPRINT";
    turnaroundText = "3–5 Business Days";
    items = [
      { title: "[SLA] Frame Budget Lock", desc: "Full render loop profiling to eliminate dropped frames and stutter." },
      { title: "[CWV] Core Web Vitals", desc: "Mobile LCP reduced under 1.2s and layout shifts (CLS) eradicated." },
      { title: "[MEM] Zero Memory Leaks", desc: "Full dispose() lifecycle hooks on all WebGL textures and buffers." },
      { title: "[BENCH] Empirical Verification", desc: "Side-by-side 24 FPS vs 60 FPS benchmarks delivered before handoff." }
    ];
  } else if (isFeature) {
    badgeText = "3D WEBUI & SHADER FEATURE";
    turnaroundText = "1–2 Weeks Turnaround";
    items = [
      { title: "[GLSL] Custom Shaders", desc: "Branchless procedural fragment math and custom post-processing." },
      { title: "[R3F] Interactive Choreography", desc: "Camera lerp damping and tactile scroll-linked spatial transitions." },
      { title: "[UI] Touch Optimization", desc: "Touch-safe gestures and adaptive DPR clamping across all devices." },
      { title: "[SPEC] Turnkey Delivery", desc: "Drop-in Three.js / WebGL component with clean API contracts." }
    ];
  } else if (isConfigurator) {
    badgeText = "3D PRODUCT CONFIGURATOR";
    turnaroundText = "2–3 Weeks Turnaround";
    items = [
      { title: "[PBR] Material Switcher", desc: "Physically-based rendering (PBR) with instant variant swaps." },
      { title: "[CAM] Orbit & Momentum", desc: "Fluid 3D manipulation with smooth inertia and limits." },
      { title: "[ASSET] Asset Pipeline", desc: "Meshopt + Draco geometry compression with KTX2 textures (< 5MB)." },
      { title: "[ESCROW] Milestone Terms", desc: "Structured 50/25/25 milestone terms with staged preview environments." }
    ];
  } else if (isEnterprise) {
    badgeText = "ENTERPRISE SPATIAL ECOSYSTEM";
    turnaroundText = "4–6 Weeks Sprint";
    items = [
      { title: "[WGSL] WebGPU Pipeline", desc: "Next-generation compute shaders and high-density particle systems." },
      { title: "[SPATIAL] Spatial Experience", desc: "Multi-scene architectural narrative with sound design integration." },
      { title: "[LOAD] Sub-5MB Payload", desc: "Maximum compression and streaming asset chunking." },
      { title: "[ALLOC] Engineering Allocation", desc: "Direct 1-on-1 architecture sprints with guaranteed 16.6ms SLA." }
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
      scopeChips.forEach((c) => {
        c.classList.remove("active");
        c.setAttribute("aria-checked", "false");
      });
      chip.classList.add("active");
      chip.setAttribute("aria-checked", "true");
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
        const isActive = c.dataset.val === scopeSelect.value;
        c.classList.toggle("active", isActive);
        c.setAttribute("aria-checked", isActive ? "true" : "false");
      });
      syncDeliverables();
    });
  }

  // Budget chips
  budgetChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const val = chip.dataset.val;
      budgetChips.forEach((c) => {
        c.classList.remove("active");
        c.setAttribute("aria-checked", "false");
      });
      chip.classList.add("active");
      chip.setAttribute("aria-checked", "true");
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
        const isActive = c.dataset.val === budgetSelect.value;
        c.classList.toggle("active", isActive);
        c.setAttribute("aria-checked", isActive ? "true" : "false");
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
function openConsultationModal(prefill = null) {
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

  // Pre-fill from active Trojan / Teardown or explicit prefill argument
  const activePrefill = prefill || window._activeTrojanData;
  if (activePrefill) {
    if (nameInp && (!nameInp.value || prefill)) {
      nameInp.value = activePrefill.dm || activePrefill.prospect || activePrefill.name || nameInp.value;
    }
    if (emailInp && activePrefill.email) emailInp.value = activePrefill.email;
    const urlInp = document.getElementById("consult-url");
    if (urlInp && activePrefill.site) urlInp.value = activePrefill.site;
    const notesInp = document.getElementById("consult-notes");
    if (notesInp && (!notesInp.value || prefill)) {
      notesInp.value = activePrefill.notes || `Executive 60 FPS Architectural Walkthrough for ${activePrefill.prospect || activePrefill.name} (Current LCP: ${activePrefill.lcp || 'slow on 4G'}).`;
    }
    // Set focus chip to "60 FPS Performance Audit"
    const focusVal = activePrefill.focus || "60 FPS Performance Audit";
    const chips = document.querySelectorAll("#consult-focus-chips .tier-chip");
    chips.forEach(c => {
      const match = c.dataset.val === focusVal;
      c.classList.toggle("active", match);
      c.setAttribute("aria-checked", match ? "true" : "false");
    });
    const hiddenFocus = document.getElementById("consult-focus");
    if (hiddenFocus) hiddenFocus.value = focusVal;
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

  window._consultReturnFocus = document.activeElement;

  if (!modal._hasTrapListener) {
    modal._hasTrapListener = true;
    modal.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeConsultationModal();
        return;
      }
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
  }

  if (nameInp) nameInp.focus();
}

function closeConsultationModal() {
  const modal = document.getElementById("consultationModal");
  if (modal) modal.classList.add("hidden");
  if (window._consultReturnFocus && typeof window._consultReturnFocus.focus === "function") {
    window._consultReturnFocus.focus();
    window._consultReturnFocus = null;
  } else {
    const triggerBtn = document.getElementById("btn-open-consultation");
    if (triggerBtn) triggerBtn.focus();
  }
}

function initConsultationChips() {
  const chips = document.querySelectorAll("#consult-focus-chips .tier-chip");
  const hiddenInp = document.getElementById("consult-focus");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => {
        c.classList.remove("active");
        c.setAttribute("aria-checked", "false");
      });
      chip.classList.add("active");
      chip.setAttribute("aria-checked", "true");
      const val = chip.getAttribute("data-val");
      if (hiddenInp && val) hiddenInp.value = val;
    });
  });
}

function generateGoogleCalendarUrl({ name, email, focus, url, datetime, notes }) {
  let startDate;
  if (datetime) {
    startDate = new Date(datetime);
  }
  if (!startDate || isNaN(startDate.getTime())) {
    startDate = new Date(Date.now() + 24 * 3600 * 1000);
    startDate.setHours(14, 0, 0, 0);
  }
  const endDate = new Date(startDate.getTime() + 15 * 60 * 1000); // 15 mins
  const formatGCalDate = d => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const title = encodeURIComponent(`15-Min Strategy Walkthrough: ${name || 'Client'} & Apoorv A S`);
  const details = encodeURIComponent(
    `15-Minute Engineering Strategy Consultation\n\n` +
    `Client: ${name || 'N/A'} (${email || 'N/A'})\n` +
    `Focus Area: ${focus || 'General 3D/Performance Exploration'}\n` +
    `Target URL/Repo: ${url || 'N/A'}\n` +
    `Objectives: ${notes || 'N/A'}\n\n` +
    `Host: Apoorv A S (apoorvxs@gmail.com)\n` +
    `Platform: Google Meet\n\n` +
    `Portfolio: https://apoorv.qzz.io`
  );
  const location = encodeURIComponent('Google Meet Video Call');
  const dates = `${formatGCalDate(startDate)}/${formatGCalDate(endDate)}`;
  let gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  if (email) gcalUrl += `&add=${encodeURIComponent(email)}`;
  gcalUrl += `&add=apoorvxs@gmail.com`;
  return gcalUrl;
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

  const notifyUser = (msg, type = "warning") => {
    if (typeof window.showNotification === "function") {
      window.showNotification(msg, type);
    } else {
      alert(msg);
    }
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    notifyUser("Please provide a valid email address so we can confirm the calendar invitation.", "warning");
    return;
  }

  const consentBox = document.getElementById("consult-consent");
  if (consentBox && !consentBox.checked) {
    notifyUser("Please accept the Terms & DPDP Act consent before confirming your consultation.", "warning");
    consentBox.focus();
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
        username: "Apoorv Client Radar",
        avatar_url: "https://apoorv.qzz.io/favicon.ico",
        embeds: [{
          title: "[MEETING] Strategy Walkthrough Requested",
          color: 0x6d3bb8,
          fields: [
            { name: "Client", value: name || "N/A", inline: true },
            { name: "Email", value: email || "N/A", inline: true },
            { name: "Focus", value: focus || "N/A", inline: true },
            { name: "⏰ Preferred Time", value: `${datetime} (${timezone})`, inline: true },
            { name: "Target URL", value: url || "None provided", inline: true },
            { name: "Notes", value: notes || "None provided" }
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
    const escapeHtml = window.escapeHTML || ((str) => String(str || "").replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])));
    const safeName = escapeHtml(name);
    const safeFocus = escapeHtml(focus);
    const safeDt = escapeHtml((datetime || "").replace('T', ' '));
    const safeTz = escapeHtml(timezone);
    confirmText.innerHTML = `Your walkthrough for <strong>${safeName}</strong> regarding <strong>${safeFocus}</strong> on <strong>${safeDt}</strong> (${safeTz}) is ready. Click below to add it to Google Calendar with pre-configured Google Meet coordinates.`;
  }

  // Switch to confirmation view
  const formBox = document.getElementById("consult-form-container");
  const confirmBox = document.getElementById("consult-confirmation");
  if (formBox) formBox.classList.add("hidden");
  if (confirmBox) confirmBox.classList.remove("hidden");

  // Haptic pulse & companion laser salute
  if (typeof window !== "undefined" && typeof window.triggerHaptic === "function") {
    window.triggerHaptic(40);
  }
  if (window.Player3D && typeof window.Player3D.celebrateVictory === "function") {
    window.Player3D.celebrateVictory();
  }

  // Companion celebration thought if active
  if (window.System1Brain?.emitThought) {
    window.System1Brain.emitThought("[SYS] Strategy walkthrough confirmed!");
  }
}

// Global modal dismiss on Escape key
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeConsultationModal();
  }
});

// ==========================================================================
// TROJAN 3D PERFORMANCE TEARDOWN (INTERACTIVE URL AUDIT)
// ==========================================================================
function initTrojanPitchFromUrl() {
  if (typeof window === "undefined" || !window.location) return;
  try {
    const params = new URLSearchParams(window.location.search);
    const prospect = params.get("prospect") || params.get("client") || params.get("target") || params.get("proposal") || params.get("teardown");
    if (!prospect) return;

    const dm = params.get("dm") || "";
    const lcp = params.get("lcp") || "4.4s";
    const speed = params.get("speed") || "35";
    const leak = params.get("leak") || "₹1,80,000/mo";
    const bleed = params.get("bleed") || "₹42,000/yr";
    const site = params.get("site") || "";
    const fee = params.get("fee") || "₹50,000";
    const partner = params.get("partner") || params.get("ref") || "";
    const isProposalFastTrack = Boolean(params.get("proposal"));

    if (partner) {
      try {
        localStorage.setItem("apoorv_partner_id", partner);
      } catch (e) {}
    }

    mountTrojanTeardown({ prospect, dm, lcp, speed, leak, bleed, site, fee, partner, isProposalFastTrack });
  } catch (err) {
    console.warn("[Trojan] URL parameter parsing failed:", err);
  }
}

function mountTrojanTeardown(data) {
  const section = document.getElementById("trojan-teardown-section");
  if (!section) return;

  const clientNameEl = document.getElementById("trojan-client-name");
  const entityNameEl = document.getElementById("trojan-entity-name");
  const lcpEl = document.getElementById("trojan-val-lcp");
  const speedEl = document.getElementById("trojan-val-speed");
  const leakEl = document.getElementById("trojan-val-leak");
  const bleedEl = document.getElementById("trojan-val-bleed");
  const dossierIdEl = document.getElementById("trojan-dossier-id");
  const partnerIdEl = document.getElementById("trojan-partner-id");

  if (clientNameEl) clientNameEl.textContent = data.prospect;
  if (entityNameEl) entityNameEl.textContent = data.prospect;
  if (lcpEl) lcpEl.textContent = `${data.lcp} (Failing INP)`;
  if (speedEl) speedEl.textContent = `${data.speed} / 100`;
  if (leakEl) leakEl.textContent = data.leak;
  if (bleedEl) bleedEl.textContent = data.bleed;

  const cleanProspectCode = (data.prospect || "CLIENT").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
  if (dossierIdEl) dossierIdEl.textContent = `RADAR-${cleanProspectCode || "STUDIO"}`;
  
  const savedPartner = (() => {
    try { return localStorage.getItem("apoorv_partner_id"); } catch (e) { return ""; }
  })();
  const activePartner = data.partner || savedPartner || "CORE-STUDIO";
  if (partnerIdEl) partnerIdEl.textContent = activePartner;

  section.classList.remove("hidden");
  window._activeTrojanData = { ...data, partner: activePartner };

  // Parse fee and select matching deal tier
  let initialTier = 1;
  const rawFeeNum = Number(String(data.fee || "").replace(/[^0-9]/g, ""));
  if (rawFeeNum >= 180000) {
    initialTier = 3;
  } else if (rawFeeNum >= 90000) {
    initialTier = 2;
  }
  selectPublicDealTier(initialTier);

  // Initialize Revenue Recovery Simulator
  calculateRevenueRecovery();

  // If directly opened as a proposal link (?proposal=...), auto-expand payment terminal
  if (data.isProposalFastTrack) {
    toggleTrojanPaymentView(true);
    setTimeout(() => {
      const paymentEl = document.getElementById("trojan-payment-view");
      if (paymentEl) paymentEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  }

  // Let BB-8 celebrate and emit diagnostic thought
  if (window.System1Brain?.emitThought) {
    window.System1Brain.emitThought(`[SYS] Diagnostic ready for ${data.prospect}!`);
  }
  if (window.Player3D && typeof window.Player3D.celebrateVictory === "function") {
    setTimeout(() => {
      window.Player3D.celebrateVictory();
    }, 400);
  }
}

function calculateRevenueRecovery() {
  const visitorsInp = document.getElementById("sim-visitors");
  const aovInp = document.getElementById("sim-aov");
  const visitorsVal = document.getElementById("sim-visitors-val");
  const aovVal = document.getElementById("sim-aov-val");
  const bleedVal = document.getElementById("sim-bleed-val");
  const recoveredVal = document.getElementById("sim-recovered-val");
  const paybackVal = document.getElementById("sim-payback-val");

  const visitors = Number(visitorsInp ? visitorsInp.value : 3000) || 3000;
  const aov = Number(aovInp ? aovInp.value : 2500) || 2500;

  if (visitorsVal) visitorsVal.textContent = `${visitors.toLocaleString('en-IN')} / mo`;
  if (aovVal) aovVal.textContent = `₹${aov.toLocaleString('en-IN')}`;

  // Conservative 5% conversion model on inbound footfall
  const monthlyOrders = visitors * 0.05;
  const grossMonthly = monthlyOrders * aov;
  // 20% aggregator take-rate / commission bleed
  const monthlyBleed = Math.round(grossMonthly * 0.20);
  const monthlyRecovered = monthlyBleed;

  const currentTierFee = window._activePublicTierFee || 50000;
  const dailySavings = monthlyBleed / 30;
  const paybackDays = dailySavings > 0 ? Math.max(1, Math.round((currentTierFee / dailySavings) * 10) / 10) : 10;

  if (bleedVal) bleedVal.textContent = `₹${monthlyBleed.toLocaleString('en-IN')} / mo`;
  if (recoveredVal) recoveredVal.textContent = `₹${monthlyRecovered.toLocaleString('en-IN')} / mo`;
  if (paybackVal) paybackVal.textContent = `${paybackDays} Days`;
}

function toggleTrojanPaymentView(forceState) {
  const paymentView = document.getElementById("trojan-payment-view");
  if (!paymentView) return;

  const isCurrentlyHidden = paymentView.classList.contains("hidden");
  const shouldOpen = typeof forceState === "boolean" ? forceState : isCurrentlyHidden;

  if (shouldOpen) {
    paymentView.classList.remove("hidden");
    if (typeof window.triggerHaptic === "function") window.triggerHaptic(25);
  } else {
    paymentView.classList.add("hidden");
  }
}

const PUBLIC_DEAL_TIERS = {
  1: {
    name: "Tier 1: Speed & Booking",
    total: 50000,
    advance: 25000,
    totalStr: "₹50,000",
    advStr: "₹25,000",
    tag: "Sub-0.8s LCP • 100% Direct Booking Engine"
  },
  2: {
    name: "Tier 2: 3D Spatial Showcase",
    total: 100000,
    advance: 50000,
    totalStr: "₹1,00,000",
    advStr: "₹50,000",
    tag: "Interactive Three.js Experience • Cel-shaded FX"
  },
  3: {
    name: "Tier 3: WebGPU Custom Engine",
    total: 200000,
    advance: 100000,
    totalStr: "₹2,00,000",
    advStr: "₹1,00,000",
    tag: "Proprietary WebGPU/GLSL Spatial Engine"
  }
};

function selectPublicDealTier(tierNum) {
  const tierConfig = PUBLIC_DEAL_TIERS[tierNum] || PUBLIC_DEAL_TIERS[1];
  window._activePublicTierNum = tierNum;
  window._activePublicTierFee = tierConfig.total;

  [1, 2, 3].forEach(num => {
    const btn = document.getElementById(`publicTier${num}`);
    if (btn) {
      const isActive = num === tierNum;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-checked", isActive ? "true" : "false");
    }
  });

  const totalEl = document.getElementById("publicSummaryTotal");
  const advanceEl = document.getElementById("publicSummaryAdvance");
  if (totalEl) totalEl.textContent = tierConfig.totalStr;
  if (advanceEl) advanceEl.textContent = tierConfig.advStr;

  const prospectName = window._activeTrojanData?.prospect || "Valued Client";
  const partnerId = window._activeTrojanData?.partner || "CORE-STUDIO";

  // Dynamic UPI Intent URL
  const upiId = window.SALES_PLATFORM_CONFIG?.upiId || "apoorvxs@okaxis";
  const note = `50% Advance - ${prospectName} (${tierConfig.name})`;
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=Apoorv%20A%20S&am=${tierConfig.advance}&cu=INR&tn=${encodeURIComponent(note)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

  const qrImg = document.getElementById("publicUpiQrImg");
  if (qrImg) qrImg.src = qrUrl;
  const upiIdTextEl = document.getElementById("publicUpiIdText");
  if (upiIdTextEl) upiIdTextEl.textContent = upiId;

  // WhatsApp Proof / Confirmation Link
  const whatsAppBtn = document.getElementById("btnPublicWhatsAppProof");
  if (whatsAppBtn) {
    const message = 
      `50% ADVANCE DEPOSIT CONFIRMATION\n` +
      `Client: ${prospectName}\n` +
      `Tier: ${tierConfig.name}\n` +
      `Total Scope: ${tierConfig.totalStr}\n` +
      `50% Advance Locked: ${tierConfig.advStr}\n` +
      `Attributed Partner: ${partnerId}\n` +
      `UPI Reference / Screenshot: [Attached Below]\n` +
      `SLA Guarantee: 100% Refund if < 60 FPS on Mobile.`;
    whatsAppBtn.href = `https://wa.me/919495462450?text=${encodeURIComponent(message)}`;
  }

  // Recalculate payback in simulator
  calculateRevenueRecovery();
}

function copyPublicUpiId() {
  const upiId = window.SALES_PLATFORM_CONFIG?.upiId || "apoorvxs@okaxis";
  if (typeof window.triggerHaptic === "function") window.triggerHaptic([30, 20, 30]);
  if (typeof window.copyToClipboard === "function") {
    window.copyToClipboard(upiId, `[COPIED] UPI ID '${upiId}' copied to clipboard`);
  } else if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(upiId).then(() => {
      if (typeof window.showNotification === "function") {
        window.showNotification(`[COPIED] UPI ID '${upiId}' copied to clipboard`, "success");
      } else {
        alert(`[COPIED] UPI ID '${upiId}' copied to clipboard`);
      }
    }).catch(() => {
      prompt("Copy UPI ID:", upiId);
    });
  } else {
    prompt("Copy UPI ID:", upiId);
  }
}

function toggleTrojanFps(targetFps) {
  const btnUnopt = document.getElementById("btn-fps-unopt");
  const btnOpt = document.getElementById("btn-fps-opt");
  const feedback = document.getElementById("trojan-fps-feedback");
  const liveFps = document.getElementById("live-fps");

  if (targetFps === 24) {
    if (btnUnopt) {
      btnUnopt.classList.add("active");
      btnUnopt.setAttribute("aria-checked", "true");
    }
    if (btnOpt) {
      btnOpt.classList.remove("active");
      btnOpt.setAttribute("aria-checked", "false");
    }
    if (feedback) {
      feedback.textContent = "[UNOPTIMIZED] 24 FPS Throttle: Sluggish touch drag, dropped frames on 4G, and high visitor drop-off.";
      feedback.style.color = "#dc2626";
    }
    if (liveFps) liveFps.textContent = "22.4";
    if (typeof window !== "undefined" && typeof window.triggerHaptic === "function") {
      window.triggerHaptic([60, 40, 60]);
    }
  } else {
    if (btnOpt) {
      btnOpt.classList.add("active");
      btnOpt.setAttribute("aria-checked", "true");
    }
    if (btnUnopt) {
      btnUnopt.classList.remove("active");
      btnUnopt.setAttribute("aria-checked", "false");
    }
    if (feedback) {
      feedback.textContent = "[LOCKED] 60 FPS Verified: Silky smooth response, zero frame drops, 0.8s instant mobile paint.";
      feedback.style.color = "var(--purple-dark)";
    }
    if (liveFps) liveFps.textContent = "60.0";
    if (typeof window !== "undefined" && typeof window.triggerHaptic === "function") {
      window.triggerHaptic(30);
    }
    if (window.Player3D && typeof window.Player3D.celebrateVictory === "function") {
      window.Player3D.celebrateVictory();
    }
  }
}

function claimTrojanConsultation() {
  if (typeof window !== "undefined" && typeof window.triggerHaptic === "function") {
    window.triggerHaptic([40, 30, 40]);
  }
  openConsultationModal(window._activeTrojanData);
}

// Initial initialization
initChipGroups();
initLiveValidation();
initConsultationChips();
syncAuthState();
initTrojanPitchFromUrl();

// Export controllers for global / inline access
if (typeof window !== "undefined") {
  window.openConsultationModal = openConsultationModal;
  window.closeConsultationModal = closeConsultationModal;
  window.handleConsultationSubmit = handleConsultationSubmit;
  window.generateGoogleCalendarUrl = generateGoogleCalendarUrl;
  window.initTrojanPitchFromUrl = initTrojanPitchFromUrl;
  window.mountTrojanTeardown = mountTrojanTeardown;
  window.toggleTrojanFps = toggleTrojanFps;
  window.claimTrojanConsultation = claimTrojanConsultation;
  window.calculateRevenueRecovery = calculateRevenueRecovery;
  window.toggleTrojanPaymentView = toggleTrojanPaymentView;
  window.selectPublicDealTier = selectPublicDealTier;
  window.copyPublicUpiId = copyPublicUpiId;
}



