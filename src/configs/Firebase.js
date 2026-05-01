import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBCSHx5HVbigaiWUj9cDh0WF-ts0tAa_3E",
  authDomain: "onlinecourse-728de.firebaseapp.com",
  databaseURL: "https://onlinecourse-728de-default-rtdb.firebaseio.com/",
  projectId: "onlinecourse-728de",
  storageBucket: "onlinecourse-728de.firebasestorage.app",
  messagingSenderId: "680842250341",
  appId: "1:680842250341:web:2b88e5964e04bf53e4de8c",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
