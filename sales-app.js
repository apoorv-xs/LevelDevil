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

// --- 1-CLICK CHIP GROUPS & LIVE VALIDATION WORKFLOWS ---
function initChipGroups() {
  // Scope chips
  const scopeSelect = document.getElementById("inquiry-scope");
  const scopeChips = document.querySelectorAll("#scope-chips .tier-chip");
  scopeChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const val = chip.dataset.val;
      scopeChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      if (scopeSelect) {
        scopeSelect.value = val;
        scopeSelect.dispatchEvent(new Event("change"));
      }
    });
  });
  if (scopeSelect) {
    scopeSelect.addEventListener("change", () => {
      scopeChips.forEach((c) => {
        c.classList.toggle("active", c.dataset.val === scopeSelect.value);
      });
    });
  }

  // Budget chips
  const budgetSelect = document.getElementById("inquiry-budget");
  const budgetChips = document.querySelectorAll("#budget-chips .tier-chip");
  budgetChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const val = chip.dataset.val;
      budgetChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      if (budgetSelect) {
        budgetSelect.value = val;
        budgetSelect.dispatchEvent(new Event("change"));
      }
    });
  });
  if (budgetSelect) {
    budgetSelect.addEventListener("change", () => {
      budgetChips.forEach((c) => {
        c.classList.toggle("active", c.dataset.val === budgetSelect.value);
      });
    });
  }
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

// Initial initialization
initChipGroups();
initLiveValidation();
syncAuthState();


