import { SurveyResponse } from '../types';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  getDocFromServer
} from 'firebase/firestore';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut
} from 'firebase/auth';

// Real product credentials provided by the user
const firebaseConfig = {
  apiKey: "AIzaSyA0n-gZ4mLHliLl0pUQqVTq7qj5Nuh8nkA",
  authDomain: "tada-voices-cf7fd.firebaseapp.com",
  projectId: "tada-voices-cf7fd",
  storageBucket: "tada-voices-cf7fd.firebasestorage.app",
  messagingSenderId: "415902368808",
  appId: "1:415902368808:web:700338485a5928aff9611d"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);

// Invariant: Validate Connection to Firestore on initial boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore service connected successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn("Firestore appears offline. Using cache fallback.");
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: null,
      providerInfo: auth.currentUser?.providerData || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface FirebaseService {
  getResponses: () => Promise<SurveyResponse[]>;
  addResponse: (response: Omit<SurveyResponse, 'id' | 'createdAt'>) => Promise<SurveyResponse>;
  deleteResponse: (id: string) => Promise<void>;
  getLiveCount: () => Promise<number>;
  subscribeToLiveCount: (callback: (count: number) => void) => () => void;
  subscribeToResponses: (callback: (responses: SurveyResponse[]) => void) => () => void;
  sendMockOTP: (phoneNumber: string) => Promise<{ success: boolean; verificationId: string }>;
  verifyMockOTP: (verificationId: string, otp: string) => Promise<{ success: boolean }>;
  signInWithGoogle: () => Promise<{ email: string; displayName: string }>;
  signInWithEmailPassword: (email: string, password: string) => Promise<{ email: string; displayName: string }>;
  registerWithEmailPassword: (email: string, password: string, name: string) => Promise<{ email: string; displayName: string }>;
  signOutUser: () => Promise<void>;
}

export const firebaseService: FirebaseService = {
  getResponses: async () => {
    try {
      const colRef = collection(db, 'responses');
      const snapshot = await getDocs(colRef);
      const list: SurveyResponse[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as SurveyResponse);
      });
      // Sort responses by descending createdAt
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'responses');
      return [];
    }
  },

  addResponse: async (response) => {
    const newId = 'resp-' + Math.random().toString(36).substring(2, 11);
    const newResponse: SurveyResponse = {
      ...response,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    try {
      // 1. Get current responses directly from latest remote state for strict validation
      const colRef = collection(db, 'responses');
      const snapshot = await getDocs(colRef);
      const responses: SurveyResponse[] = [];
      snapshot.forEach((docSnap) => {
        responses.push(docSnap.data() as SurveyResponse);
      });

      // 2. Strict Duplicate checks: Email and Mobile Number constraints
      if (response.email) {
        const targetEmail = response.email.toLowerCase().trim();
        const isDuplicate = responses.some(
          (r) => r.email && r.email.toLowerCase().trim() === targetEmail
        );
        if (isDuplicate) {
          throw new Error(
            'You have already submitted an assessment under this verified email address. Limit is one response per person.'
          );
        }
      }

      if (response.phoneNumber) {
        const targetPhone = response.phoneNumber.trim();
        const isDuplicatePhone = responses.some(
          (r) => r.phoneNumber && r.phoneNumber.trim() === targetPhone
        );
        if (isDuplicatePhone) {
          throw new Error(
            'You have already submitted an assessment under this mobile number. Limit is one response per mobile number.'
          );
        }
      }

      // Sanitize fields to ensure no keys have "undefined" values (which Firestore does not allow)
      const cleanedResponse = Object.entries(newResponse).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      // 3. Commit write to Firestore
      await setDoc(doc(db, 'responses', newId), cleanedResponse);
      return newResponse;
    } catch (error) {
      if (error instanceof Error && (error.message.includes('already submitted') || error.message.includes('Limit is one'))) {
        throw error;
      }
      handleFirestoreError(error, OperationType.WRITE, `responses/${newId}`);
      throw error;
    }
  },

  deleteResponse: async (id) => {
    try {
      await deleteDoc(doc(db, 'responses', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `responses/${id}`);
    }
  },

  getLiveCount: async () => {
    try {
      const colRef = collection(db, 'responses');
      const snapshot = await getDocs(colRef);
      return snapshot.size;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'responses');
      return 0;
    }
  },

  subscribeToLiveCount: (callback) => {
    const q = query(collection(db, 'responses'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Live count is derived directly from live Firestore collection size
      callback(snapshot.size);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'responses');
    });
    return unsubscribe;
  },

  subscribeToResponses: (callback) => {
    const q = query(collection(db, 'responses'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: SurveyResponse[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as SurveyResponse);
      });
      // Sort responses by descending createdAt
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'responses');
    });
    return unsubscribe;
  },

  sendMockOTP: async (phoneNumber: string) => {
    console.log(`[Firebase Auth Mock] Sent OTP to ${phoneNumber}`);
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { success: true, verificationId: 'verify_' + Math.random().toString(36).substring(2, 11) };
  },

  verifyMockOTP: async (verificationId, otp) => {
    console.log(`[Firebase Auth Mock] Verifying OTP ${otp} for verificationId ${verificationId}`);
    await new Promise((resolve) => setTimeout(resolve, 800));
    // Support standard 123456 as standard testing, or any valid 6 numbers
    if (otp && otp.length === 6) {
      return { success: true };
    }
    return { success: false };
  },

  signInWithGoogle: async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const result = await signInWithPopup(auth, provider);
      return {
        email: result.user.email || '',
        displayName: result.user.displayName || result.user.email?.split('@')[0] || 'User'
      };
    } catch (error: any) {
      console.error('Google Sign-In popup failed:', error);
      throw error;
    }
  },

  signInWithEmailPassword: async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      return {
        email: result.user.email || '',
        displayName: result.user.displayName || result.user.email?.split('@')[0] || 'User'
      };
    } catch (error: any) {
      console.error('Email Sign-In failed:', error);
      throw error;
    }
  },

  registerWithEmailPassword: async (email, password, name) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(result.user, { displayName: name.trim() });
      return {
        email: result.user.email || '',
        displayName: name.trim()
      };
    } catch (error: any) {
      console.error('Email Registration failed:', error);
      throw error;
    }
  },

  signOutUser: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }
};
