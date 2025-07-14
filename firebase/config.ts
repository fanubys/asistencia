import { initializeApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore, enableIndexedDbPersistence } from "firebase/firestore";

// Your web app's Firebase configuration is now loaded from environment variables
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let firebaseInitializationError: Error | null = null;

try {
  // Create a temporary config object without the optional measurementId for validation
  const { measurementId, ...requiredConfig } = firebaseConfig;
  
  // Check which specific environment variables are missing
  const missingKeys = Object.entries(requiredConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    // Provide a more descriptive error message to guide the user.
    throw new Error(`Faltan variables de configuración de Firebase. Por favor, crea un archivo '.env' en la raíz del proyecto y añade las claves de configuración. Las claves que parecen faltar son: ${missingKeys.join(', ')}.`);
  }

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  enableIndexedDbPersistence(db)
    .catch((err) => {
      if (err.code == 'failed-precondition') {
        console.warn("Firebase persistence failed: multiple tabs open.");
      } else if (err.code == 'unimplemented') {
        console.warn("Firebase persistence not available in this browser.");
      }
    });
} catch (error) {
  firebaseInitializationError = error as Error;
  console.error("Firebase initialization error:", firebaseInitializationError.message);
  // Let db and auth be undefined, the contexts will handle it.
}

export { db, auth, firebaseInitializationError };