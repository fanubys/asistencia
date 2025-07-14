import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { 
  getFirestore,
  enableMultiTabIndexedDbPersistence,
  Firestore
} from "firebase/firestore/bundle";

/// <reference types="vite/client" />

// Your web app's Firebase configuration is now loaded from environment variables
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
  // Create a temporary config object without the optional measurementId for validation
  const { measurementId, ...requiredConfig } = firebaseConfig;
  
  // Helper to convert camelCase to SNAKE_UPPER_CASE
  const toSnakeUpperCase = (str: string) => str.replace(/([A-Z])/g, '_$1').toUpperCase();

  // Check which specific environment variables are missing
  const missingKeys = Object.entries(requiredConfig)
    .filter(([key, value]) => !value && key !== 'authDomain') // authDomain can be undefined for some services
    .map(([key]) => `VITE_${toSnakeUpperCase(key)}`); 

  if (missingKeys.length > 0) {
    // Provide a more descriptive error message to guide the user.
    throw new Error(`Faltan variables de configuración de Firebase. Por favor, configura las siguientes claves en tu archivo .env o en tu entorno de despliegue: ${missingKeys.join(', ')}.`);
  }

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  // Initialize Firestore and then enable multi-tab persistence
  db = getFirestore(app);
  enableMultiTabIndexedDbPersistence(db)
    .catch((err) => {
      console.warn(`Firebase multi-tab persistence could not be enabled: ${err.code}`);
    });

} catch (error) {
  firebaseInitializationError = error as Error;
  console.error("Firebase initialization error:", firebaseInitializationError.message);
  // Let db and auth be undefined, the contexts will handle it.
}

export { db, auth, firebaseInitializationError };