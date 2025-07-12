import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

// =================================================================
// ¡ACCIÓN REQUERIDA!
//
// Para que la aplicación se conecte a la nube, debes reemplazar
// los valores de marcador de posición a continuación con la
// configuración de tu propio proyecto de Firebase.
//
// 1. Ve a la consola de Firebase: https://console.firebase.google.com/
// 2. Crea un nuevo proyecto (o selecciona uno existente).
// 3. Ve a la configuración de tu proyecto (icono de engranaje).
// 4. En la pestaña "General", desplázate hacia abajo hasta
//    "Tus aplicaciones".
// 5. Si no tienes una aplicación web, haz clic en el icono `</>`
//    para crear una.
// 6. Firebase te proporcionará un objeto `firebaseConfig`.
//    Copia y pega los valores aquí.
// =================================================================
const firebaseConfig = {
  apiKey: "AIzaSy...REPLACE_WITH_YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "1:your-sender-id:web:your-app-id"
};

export const initializeFirebase = () => {
  // Check if the config is still using placeholder values
  if (firebaseConfig.apiKey.startsWith("AIzaSy...REPLACE")) {
    throw new Error("FIREBASE_CONFIG_MISSING");
  }

  const app = firebase.apps.length
    ? firebase.app()
    : firebase.initializeApp(firebaseConfig);
  
  const auth = app.auth();
  const db = app.firestore();
  
  // Enable offline persistence for a better PWA experience
  db.enablePersistence()
    .catch((err) => {
      if (err.code == 'failed-precondition') {
        console.warn("Firebase persistence failed: multiple tabs open.");
      } else if (err.code == 'unimplemented') {
        console.warn("Firebase persistence not available in this browser.");
      }
    });

  return { auth, db };
};
