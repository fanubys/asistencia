import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import {
  getFirestore,
  enableIndexedDbPersistence,
  Firestore
} from "firebase/firestore";

// ✅ Usar import.meta.env en lugar de process.env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let firebaseInitializationError: Error | null = null;

try {
  const { measurementId, ...requiredConfig } = firebaseConfig;

  const missingKeys = Object.entries(requiredConfig)
    .filter(([, value]) => !value)
    .map(([key]) => `VITE_${key.toUpperCase()}`);

  if (missingKeys.length > 0) {
    throw new Error(`Faltan variables de configuración de Firebase. Por favor, configuralas en tu archivo .env o en Netlify: ${missingKeys.join(', ')}.`);
  }

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistencia rechazada: hay otra pestaña activa.');
    } else if (err.code === 'unimplemented') {
      console.warn('Persistencia no soportada en este navegador.');
    }
  });

} catch (error) {
  firebaseInitializationError = error as Error;
  console.error("Error al inicializar Firebase:", firebaseInitializationError.message);
}

export { db, auth, firebaseInitializationError };
