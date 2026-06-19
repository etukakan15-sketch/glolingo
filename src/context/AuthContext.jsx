import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signUp(email, password, profileData) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(user);
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      plan: profileData.plan || "free",
      useCase: profileData.useCase || "",
      languages: profileData.languages || [],
      isCompany: profileData.isCompany || false,
      companyName: profileData.companyName || null,
      tvBrand: profileData.tvBrand || null,
      streamingDevices: profileData.streamingDevices || [],
      adFree: profileData.adFree || false,
      paymentMethod: profileData.paymentMethod || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return user;
  }

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        setUserProfile(snap.exists() ? snap.data() : null);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, signUp, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
