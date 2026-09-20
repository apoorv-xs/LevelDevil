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

async function submitPublicForm(event, path, successMessage) {
  event.preventDefault();
  const form = event.currentTarget;
  const values = Object.fromEntries(new FormData(form));
  const submit = form.querySelector('button[type="submit"]');
  setStatus("Sending...");
  form.setAttribute("aria-busy", "true");
  if (submit) submit.disabled = true;
  try {
    await request(path, { method: "POST", body: JSON.stringify(values) });
    form.reset();
    setStatus(successMessage);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Unable to submit the form.", true);
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

inquiryForm?.addEventListener("submit", (event) => {
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

