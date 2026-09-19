(function configureSalesAuth() {
  if (window.SALES_PLATFORM_AUTH?.signIn) return;
  const firebaseConfig = window.SALES_PLATFORM_CONFIG?.firebase;
  if (!firebaseConfig?.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) return;

  const sdkBase = "https://www.gstatic.com/firebasejs/10.14.1";
  const load = (src) => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${sdkBase}/${src}`;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Unable to load secure sign-in."));
    document.head.appendChild(script);
  });

  let authPromise;
  async function getAuth() {
    if (!authPromise) {
      authPromise = Promise.all([
        load("firebase-app-compat.js"),
        load("firebase-auth-compat.js"),
      ]).then(() => {
        const app = window.firebase.apps.length
          ? window.firebase.app()
          : window.firebase.initializeApp(firebaseConfig);
        return window.firebase.auth(app);
      });
    }
    return authPromise;
  }

  window.SALES_PLATFORM_AUTH = {
    async signIn() {
      const auth = await getAuth();
      const provider = new window.firebase.auth.GoogleAuthProvider();
      try {
        const redirectResult = await auth.getRedirectResult();
        if (redirectResult.user) return redirectResult;
        return await auth.signInWithPopup(provider);
      } catch (error) {
        if (["auth/popup-blocked", "auth/operation-not-supported"].includes(error.code)) {
          await auth.signInWithRedirect(provider);
          throw new Error("Redirecting to secure sign-in...");
        }
        throw new Error(error.code === "auth/popup-closed-by-user" ? "Sign-in was cancelled." : "Secure sign-in failed. Please try again.");
      }
    },
  };
})();
