import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  persistentMultipleTabManager
} from "firebase/firestore";

// --- AQUI ENTRA O CÓDIGO QUE VOCÊ COPIOU DO SITE ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAeHmw9cMxzhu-nbXDIU21DxkcwZU0kKtM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gestao-new-gears.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gestao-new-gears",
  storageBucket: "gestao-new-gears.firebasestorage.app",
  messagingSenderId: "230026094824",
  appId: "1:230026094824:web:fbc826414e299dba89815d"
};
// ---------------------------------------------------

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const FIREBASE_AUTH_ENABLED = import.meta.env.VITE_FIREBASE_AUTH_ENABLED === 'true';

const createFirestore = () => {
  const canUsePersistentCache =
    typeof window !== "undefined" &&
    typeof indexedDB !== "undefined";

  if (!canUsePersistentCache) {
    return initializeFirestore(app, {
      localCache: memoryLocalCache()
    });
  }

  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
  } catch (error) {
    console.warn("Cache persistente indisponivel, usando cache em memoria.", error);
    return initializeFirestore(app, {
      localCache: memoryLocalCache()
    });
  }
};

export const db = createFirestore();
