import { 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection, 
  onSnapshot, 
  getDocs 
} from './firebase';
import { User, Transaction, Announcement, SystemSettings } from '../types';
import { initialUsers, initialTransactions, initialAnnouncements, initialSystemSettings } from '../data/mockData';

// Helper to remove undefined values for Firestore compatibility
const cleanData = <T extends object>(data: T): Record<string, any> => {
  const result: Record<string, any> = {};
  Object.keys(data).forEach((key) => {
    const val = (data as any)[key];
    if (val !== undefined) {
      result[key] = val;
    }
  });
  return result;
};

// Seed initial data if database is empty
export const seedInitialDataIfEmpty = async () => {
  try {
    // Check users
    const usersSnap = await getDocs(collection(db, 'users'));
    if (usersSnap.empty) {
      for (const u of initialUsers) {
        await setDoc(doc(db, 'users', u.id), cleanData(u));
      }
    }

    // Check transactions
    const trxSnap = await getDocs(collection(db, 'transactions'));
    if (trxSnap.empty) {
      for (const t of initialTransactions) {
        await setDoc(doc(db, 'transactions', t.id), cleanData(t));
      }
    }

    // Check announcements
    const annSnap = await getDocs(collection(db, 'announcements'));
    if (annSnap.empty) {
      for (const a of initialAnnouncements) {
        await setDoc(doc(db, 'announcements', a.id), cleanData(a));
      }
    }

    // Check global settings
    const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
    if (!settingsDoc.exists()) {
      await setDoc(doc(db, 'settings', 'global'), cleanData(initialSystemSettings));
    }
  } catch (err) {
    console.warn('Firestore seeding notice:', err);
  }
};

// Subscriptions
export const subscribeUsers = (onData: (users: User[]) => void) => {
  return onSnapshot(collection(db, 'users'), (snapshot) => {
    if (!snapshot.empty) {
      const list: User[] = [];
      snapshot.forEach(doc => {
        list.push(doc.data() as User);
      });
      onData(list);
    }
  }, (error) => {
    console.warn('Firestore subscribe users notice:', error);
  });
};

export const subscribeTransactions = (onData: (transactions: Transaction[]) => void) => {
  return onSnapshot(collection(db, 'transactions'), (snapshot) => {
    if (!snapshot.empty) {
      const list: Transaction[] = [];
      snapshot.forEach(doc => {
        list.push(doc.data() as Transaction);
      });
      // Sort descending by createdAt
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(list);
    }
  }, (error) => {
    console.warn('Firestore subscribe transactions notice:', error);
  });
};

export const subscribeAnnouncements = (onData: (announcements: Announcement[]) => void) => {
  return onSnapshot(collection(db, 'announcements'), (snapshot) => {
    if (!snapshot.empty) {
      const list: Announcement[] = [];
      snapshot.forEach(doc => {
        list.push(doc.data() as Announcement);
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(list);
    }
  }, (error) => {
    console.warn('Firestore subscribe announcements notice:', error);
  });
};

export const subscribeSettings = (onData: (settings: SystemSettings) => void) => {
  return onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
    if (docSnap.exists()) {
      onData(docSnap.data() as SystemSettings);
    }
  }, (error) => {
    console.warn('Firestore subscribe settings notice:', error);
  });
};

// Writer functions
export const saveUserToFirestore = async (user: User) => {
  try {
    await setDoc(doc(db, 'users', user.id), cleanData(user), { merge: true });
  } catch (err) {
    console.warn('Firestore save user notice:', err);
  }
};

export const deleteUserFromFirestore = async (userId: string) => {
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (err) {
    console.warn('Firestore delete user notice:', err);
  }
};

export const saveTransactionToFirestore = async (transaction: Transaction) => {
  try {
    await setDoc(doc(db, 'transactions', transaction.id), cleanData(transaction), { merge: true });
  } catch (err) {
    console.warn('Firestore save transaction notice:', err);
  }
};

export const saveAnnouncementToFirestore = async (announcement: Announcement) => {
  try {
    await setDoc(doc(db, 'announcements', announcement.id), cleanData(announcement), { merge: true });
  } catch (err) {
    console.warn('Firestore save announcement notice:', err);
  }
};

export const deleteAnnouncementFromFirestore = async (id: string) => {
  try {
    const docRef = doc(db, 'announcements', id);
    await setDoc(docRef, { isActive: false }, { merge: true });
  } catch (err) {
    console.warn('Firestore delete announcement notice:', err);
  }
};

export const saveSettingsToFirestore = async (settings: SystemSettings) => {
  try {
    await setDoc(doc(db, 'settings', 'global'), cleanData(settings), { merge: true });
  } catch (err) {
    console.warn('Firestore save settings notice:', err);
  }
};
