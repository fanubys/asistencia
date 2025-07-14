import { initializeApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore, enableIndexedDbPersistence } from "firebase/firestore";

// Firebase configuration usando variables de entorno de Vite
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
  // Validar presencia de variables obligatorias
  const { measurementId, ...requiredConfig } = firebaseConfig;

  const missingKeys = Object.entries(requiredConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    throw new Error(`Faltan variables de configuración de Firebase. Por favor, añadí las siguientes claves en tu archivo '.env' y en Netlify: ${missingKeys.join(', ')}.`);
  }

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Firebase persistence failed: múltiples pestañas abiertas.");
    } else if (err.code === 'unimplemented') {
      console.warn("Firebase persistence no disponible en este navegador.");
    }
  });
} catch (error) {
  firebaseInitializationError = error as Error;
  console.error("Error al inicializar Firebase:", firebaseInitializationError.message);
  // Los contextos pueden manejar auth y db indefinidos.
}

export { db, auth, firebaseInitializationError };
