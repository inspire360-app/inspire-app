// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC_aQYbRzfKGw-WDkeqRt7VLKcGGtmrZjo",
  authDomain: "inspire-app-db.firebaseapp.com",
  projectId: "inspire-app-db",
  storageBucket: "inspire-app-db.firebasestorage.app",
  messagingSenderId: "573976278306",
  appId: "1:573976278306:web:a203cdfb514bd1d1e0617b",
  measurementId: "G-849N0YDQJK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
