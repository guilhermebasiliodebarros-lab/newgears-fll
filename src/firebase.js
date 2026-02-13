import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- AQUI ENTRA O CÓDIGO QUE VOCÊ COPIOU DO SITE ---
const firebaseConfig = {
  apiKey: "AIzaSyAeHmw9cMxzhu-nbXDIU21DxkcwZU0kKtM",
  authDomain: "gestao-new-gears.firebaseapp.com",
  projectId: "gestao-new-gears",
  storageBucket: "gestao-new-gears.firebasestorage.app",
  messagingSenderId: "230026094824",
  appId: "1:230026094824:web:fbc826414e299dba89815d"
};
// ---------------------------------------------------

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);