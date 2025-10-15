import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDa_BxAafTaO5AvAe_2zfnD5Tlpq9czNYI",
  authDomain: "agnes-kitchen-legacy.firebaseapp.com",
  projectId: "agnes-kitchen-legacy",
  storageBucket: "agnes-kitchen-legacy.firebasestorage.app",
  messagingSenderId: "572329612571",
  appId: "1:572329612571:web:e3d78e10cc147e91726fbe"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;