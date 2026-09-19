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
    async resume() {
      const auth = await getAuth();
      const result = await auth.getRedirectResult();
      return result.user ? result : null;
    },
    async signIn() {
      const auth = await getAuth();
      const provider = new window.firebase.auth.GoogleAuthProvider();
      try {
        return await auth.signInWithPopup(provider);
      } catch (error) {
        if (["auth/popup-blocked", "auth/operation-not-supported", "auth/web-storage-unsupported"].includes(error.code)) {
          try {
            await auth.signInWithRedirect(provider);
            throw new Error("Redirecting to secure sign-in...");
          } catch (redirectError) {
            if (redirectError.message === "Redirecting to secure sign-in...") throw redirectError;
            throw new Error("Popup sign-in was blocked and redirect sign-in could not start. Check browser permissions and try again.");
          }
        }
        if (["auth/popup-closed-by-user", "auth/cancelled-popup-request"].includes(error.code)) {
          throw new Error("Sign-in was cancelled. Select the button to try again.");
        }
        if (error.code === "auth/unauthorized-domain") {
          throw new Error("This site is not enabled for Google sign-in. Contact the owner.");
        }
        throw new Error("Secure sign-in failed. Check your Google account and try again.");
      }
    },
  };
})();
