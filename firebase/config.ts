import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore, enableIndexedDbPersistence } from "firebase/firestore";

// Your web app's Firebase configuration provided by the user
const firebaseConfig = {
  apiKey: "AIzaSyA7sqMHexmWhiztn0GAlP1p5IzwehRvbw8",
  authDomain: "asistencia-pro.firebaseapp.com",
  projectId: "asistencia-pro",
  storageBucket: "asistencia-pro.appspot.com",
  messagingSenderId: "912402743640",
  appId: "1:912402743640:web:aa3799b59ffadc500ee52d",
  measurementId: "G-T3Y6VZS64E"
};

let auth: Auth;
let db: Firestore;

try {
  const app: FirebaseApp = initializeApp(firebaseConfig);
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
  console.error("Firebase initialization error", error);
  // The DataContext will handle the error state if db is not initialized.
}

export { db, auth };
