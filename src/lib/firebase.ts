import { initializeApp } from 'firebase/app';
import { 
  initializeFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  getDocs 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import firebaseConfigJson from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfigJson);

export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
}, firebaseConfigJson.firestoreDatabaseId || '(default)');

export const auth = getAuth(app);

// Ensure anonymous authentication for Firestore security rules if needed
signInAnonymously(auth).catch(err => {
  console.warn('Firebase anonymous auth warning:', err);
});

export { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, onSnapshot, query, orderBy, limit, getDocs };
