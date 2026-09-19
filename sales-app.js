const API_BASE = window.SALES_PLATFORM_CONFIG?.apiBase || "/api";
const shell = window.APP_SHELL;
const workspace = document.getElementById("workspace");
const workspaceData = document.getElementById("workspace-data");
const workspaceRole = document.getElementById("workspace-role");

function setStatus(message, isError = false) {
  shell?.status?.set(message, isError);
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (shell?.session?.idToken) headers.Authorization = `Bearer ${shell.session.idToken}`;
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || "Request failed");
  return payload;
}

async function submitPublicForm(event, path, successMessage) {
  event.preventDefault();
  const form = event.currentTarget;
  const values = Object.fromEntries(new FormData(form));
  setStatus("Sending...");
  try {
    await request(path, { method: "POST", body: JSON.stringify(values) });
    form.reset();
    setStatus(successMessage);
  } catch (error) {
    setStatus(error.message, true);
  }
}

async function loadWorkspace() {
  setStatus("Loading workspace...");
  try {
    const payload = await request("/workspace");
    workspace.hidden = false;
    workspaceRole.textContent = `Signed in as ${payload.role}`;
    workspaceData.textContent = JSON.stringify(payload, null, 2);
    setStatus("Workspace loaded.");
  } catch (error) {
    workspace.hidden = true;
    setStatus(error.message, true);
  }
}

document.getElementById("inquiry-form").addEventListener("submit", (event) => {
  submitPublicForm(event, "/inquiries", "Inquiry received. The owner will follow up.");
});
document.getElementById("application-form").addEventListener("submit", (event) => {
  submitPublicForm(event, "/applications", "Application received for owner review.");
});
document.getElementById("sign-in").addEventListener("click", async () => {
  try {
    setStatus("Opening secure sign-in...");
    await shell.session.signIn();
    await loadWorkspace();
  } catch (error) {
    setStatus(error.message || "Sign-in was cancelled.", true);
  }
});
document.getElementById("refresh-workspace").addEventListener("click", loadWorkspace);
