/// <reference types="vite/client" />

import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import * as firestore from "firebase/firestore";

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
let db: firestore.FirebaseFirestore;
let firebaseInitializationError: Error | null = null;

try {
  // Create a temporary config object without the optional measurementId for validation
  const { measurementId, ...requiredConfig } = firebaseConfig;
  
  // Check which specific environment variables are missing
  const missingKeys = Object.entries(requiredConfig)
    .filter(([key, value]) => !value && key !== 'apiKey' && key !== 'authDomain') // apiKey and authDomain can be undefined for some services
    .map(([key]) => `VITE_${key.toUpperCase()}`); 

  if (!firebaseConfig.apiKey) {
    missingKeys.unshift('VITE_API_KEY');
  }

  if (missingKeys.length > 0) {
    // Provide a more descriptive error message to guide the user.
    throw new Error(`Faltan variables de configuración de Firebase. Por favor, configura las siguientes claves en tu archivo .env o en tu entorno de despliegue: ${missingKeys.join(', ')}.`);
  }

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  // Use getFirestore and enable persistence, which is compatible with older v9 SDKs
  db = firestore.getFirestore(app);
  firestore.enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firebase persistence could not be enabled. Another tab is open with persistence enabled.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support Firebase persistence.');
    }
  });

} catch (error) {
  firebaseInitializationError = error as Error;
  console.error("Firebase initialization error:", firebaseInitializationError.message);
  // Let db and auth be undefined, the contexts will handle it.
}

export { db, auth, firebaseInitializationError };