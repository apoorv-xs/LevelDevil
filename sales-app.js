const API_BASE = window.SALES_PLATFORM_CONFIG?.apiBase || "/api";
const shell = window.APP_SHELL;
const workspace = document.getElementById("workspace");
const workspaceData = document.getElementById("workspace-data");
const workspaceRole = document.getElementById("workspace-role");
const authPlaceholder = document.getElementById("auth-placeholder");

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

async function loadWorkspace() {
  setStatus("Loading workspace...");
  try {
    const payload = await request("/workspace");
    authPlaceholder.hidden = true;
    workspace.hidden = false;
    workspaceRole.textContent = `Signed in as ${payload.role}`;
    workspaceData.textContent = JSON.stringify(payload, null, 2);
    setStatus("Workspace loaded.");
  } catch (error) {
    authPlaceholder.hidden = false;
    workspace.hidden = true;
    setStatus(error instanceof Error ? error.message : "Unable to load the workspace.", true);
  }
}

document.getElementById("inquiry-form").addEventListener("submit", (event) => {
  submitPublicForm(event, "/inquiry", "Inquiry received. The owner will follow up.");
});
document.getElementById("application-form").addEventListener("submit", (event) => {
  submitPublicForm(event, "/application", "Application received for owner review.");
});
document.getElementById("sign-in").addEventListener("click", async () => {
  const signIn = document.getElementById("sign-in");
  try {
    setStatus("Opening secure sign-in...");
    signIn.disabled = true;
    await shell.session.signIn();
    await loadWorkspace();
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Sign-in was cancelled.", true);
  } finally {
    signIn.disabled = false;
  }
});
document.getElementById("refresh-workspace").addEventListener("click", loadWorkspace);
