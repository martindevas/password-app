const firebaseConfig = {
  apiKey: "AIzaSyCMBvob4FGv5NQ05XdMHuGc8m-h7rUsM38",
  authDomain: "claves-app.firebaseapp.com",
  projectId: "claves-app",
  storageBucket: "claves-app.firebasestorage.app",
  messagingSenderId: "151481476196",
  appId: "1:151481476196:web:7af9fee746eed2bb0dab71",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

db.enablePersistence().catch(() => {
  // varias pestañas abiertas o navegador sin soporte: seguimos sin cache offline
});
