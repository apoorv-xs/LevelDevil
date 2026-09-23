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
      authPromise = (async () => {
        await load("firebase-app-compat.js");
        await load("firebase-auth-compat.js");
        const app = window.firebase.apps.length
          ? window.firebase.app()
          : window.firebase.initializeApp(firebaseConfig);
        return window.firebase.auth(app);
      })();
    }
    return authPromise;
  }

  let firestorePromise;
  async function getFirestore() {
    if (!firestorePromise) {
      firestorePromise = (async () => {
        await getAuth();
        if (!window.firebase?.firestore) {
          await load("firebase-firestore-compat.js");
        }
        const app = window.firebase.app();
        const db = window.firebase.firestore(app);
        try {
          await db.enablePersistence({ synchronizeTabs: true });
        } catch (e) {
          // Fallback gracefully if indexedDB persistence is active in another tab
        }
        return db;
      })();
    }
    return firestorePromise;
  }

  window.SALES_PLATFORM_AUTH = {
    getAuth,
    getFirestore,
    async resume() {
      const auth = await getAuth();
      const result = await auth.getRedirectResult();
      return result.user ? result : null;
    },
    async signIn() {
      const auth = await getAuth();
      const provider = new window.firebase.auth.GoogleAuthProvider();
      await auth.signInWithRedirect(provider);
    },
  };
})();
