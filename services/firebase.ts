import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";

// CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

let app;
let authExport;
let googleProviderExport;
let appleProviderExport;

try {
    // Only initialize if config is present, otherwise app might crash on load
    // For production, you MUST ensure these variables are present.
    if (firebaseConfig.apiKey) {
        app = initializeApp(firebaseConfig);
        authExport = getAuth(app);
        googleProviderExport = new GoogleAuthProvider();
        appleProviderExport = new OAuthProvider('apple.com');
        appleProviderExport.addScope('email');
        appleProviderExport.addScope('name');
    } else {
        console.warn("Firebase Config missing. Auth will not work.");
    }
} catch (e) {
    console.error("Firebase Initialization Error:", e);
}

export const auth = authExport!; // Non-null assertion, we expect keys in prod
export const googleProvider = googleProviderExport!;
export const appleProvider = appleProviderExport!;