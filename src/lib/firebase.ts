import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyB2fRo3JnW65h8o3KWNZERHjGLeHvVsEg4",
  authDomain: "hub-acesso-rapido.firebaseapp.com",
  databaseURL: "https://hub-acesso-rapido-default-rtdb.firebaseio.com",
  projectId: "hub-acesso-rapido",
  storageBucket: "hub-acesso-rapido.firebasestorage.app",
  messagingSenderId: "794340971170",
  appId: "1:794340971170:web:d1480b4933195134debdfb"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
