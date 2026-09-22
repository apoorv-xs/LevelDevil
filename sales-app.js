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
  if (submit) submit.disabled = true;

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
    const fallbackBox = form.querySelector(".inquiry-fallback-box");
    if (fallbackBox) fallbackBox.remove();
  } catch (error) {
    if (webhookDelivered) {
      form.reset();
      setStatus("Inquiry dispatched via notification rail! Apoorv will follow up within 24 hours.");
    } else {
      setStatus(error instanceof Error ? error.message : "Unable to submit the form.", true);
      if (path === "/inquiry") {
        const subject = encodeURIComponent(`Project Inquiry: ${values.scope || "Creative Engineering"} - ${values.name || "Client"}`);
        const body = encodeURIComponent(`Hi Apoorv,\n\nName: ${values.name || ""}\nEmail: ${values.email || ""}\nScope: ${values.scope || ""}\nBudget: ${values.budget || ""}\n\nMessage:\n${values.message || ""}\n`);
        const mailto = `mailto:${window.SALES_PLATFORM_CONFIG?.directEmail || "apoorvworkid@gmail.com"}?subject=${subject}&body=${body}`;

        let fallbackBox = form.querySelector(".inquiry-fallback-box");
        if (!fallbackBox) {
          fallbackBox = document.createElement("div");
          fallbackBox.className = "inquiry-fallback-box";
          fallbackBox.style.cssText = "margin-top:14px; padding:12px; background:var(--white); border:2px solid var(--ink); box-shadow:3px 3px 0 var(--ink); font-family:'Courier Prime',monospace; font-size:13px; text-align:left;";
          form.appendChild(fallbackBox);
        }
        fallbackBox.innerHTML = `
          <div style="font-weight:bold; color:var(--ink); margin-bottom:6px;">⚡ Direct Dispatch Fallback:</div>
          <div style="margin-bottom:10px; color:var(--ink); font-size:12px;">Network endpoint was unreachable, but your details are safely stored. Tap below to dispatch directly:</div>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <a href="${mailto}" style="padding:6px 14px; background:var(--accent-yellow); border:2px solid var(--ink); color:var(--ink); text-decoration:none; font-weight:bold; font-size:12px; display:inline-flex; align-items:center; gap:6px;">✉️ Dispatch via Email</a>
          </div>
        `;
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
      formAuthStatus.innerHTML = `<span style="color: #10b981; font-weight: bold;">✓ Verified with Google:</span> <span>${email}</span>`;
    }
    // Auto-fill inquiry form inputs
    if (inquiryForm) {
      const nameInput = inquiryForm.querySelector('input[name="name"]');
      const emailInput = inquiryForm.querySelector('input[name="email"]');
      if (nameInput && (!nameInput.value || nameInput.value === "") && name) {
        nameInput.value = name;
      }
      if (emailInput && (!emailInput.value || emailInput.value === "") && email) {
        emailInput.value = email;
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

// Initial sync
syncAuthState();

