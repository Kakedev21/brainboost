import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth, firestore } from "../services/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";

export interface RegisterPayloadType {
  fullName: string;
  studentId: string;
  gradeLevel: string;
  section: string;
  password: string;
  email: string;
  role: "student" | "teacher" | null | undefined;
}

export interface TeacherRegisterPayloadType {
  fullName: string;
  address: string;
  password: string;
  email: string;
  role: "teacher" | null | undefined;
}

interface AuthState {
  user: User | null;
  role: "student" | "teacher" | null;
  isLoading: boolean;
  userData: {
    fullName: string;
    email: string;
    gradeLevel: string;
    section: string;
    username: string;
    createdAt: Date;
    role: string;
  } | null;
  initializeAuthListener: () => void;
  login: (email: string, password: string) => Promise<any>;
  register: (
    payload: RegisterPayloadType | TeacherRegisterPayloadType
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      isLoading: true,
      userData: null,

      initializeAuthListener: () => {
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            try {
              const userDoc = await getDoc(doc(firestore, "users", user.uid));
              const userData = userDoc.data();
              set({
                user,
                role: userData?.role || null,
                userData: {
                  fullName: userData?.fullName,
                  email: userData?.email,
                  gradeLevel: userData?.gradeLevel,
                  section: userData?.section,
                  username: userData?.username,
                  createdAt: userData?.createdAt?.toDate(),
                  role: userData?.role,
                },
                isLoading: false,
              });
            } catch (error) {
              console.error("Error fetching user data:", error);
              set({ isLoading: false });
            }
          } else {
            set({ user: null, role: null, userData: null, isLoading: false });
          }
        });
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
          );
          const userDoc = await getDoc(
            doc(firestore, "users", userCredential.user.uid)
          );
          const userData = userDoc.data();
          set({
            user: userCredential.user,
            role: userData?.role || null,
            userData: {
              fullName: userData?.fullName,
              email: userData?.email,
              gradeLevel: userData?.gradeLevel,
              section: userData?.section,
              username: userData?.username,
              createdAt: userData?.createdAt?.toDate(),
              role: userData?.role,
            },
          });
          return userData;
        } catch (error) {
          console.error("Login failed:", error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (payload) => {
        set({ isLoading: true });
        try {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            payload.email,
            payload.password
          );
          await setDoc(doc(firestore, "users", userCredential.user.uid), {
            ...payload,
            createdAt: new Date(),
          });
          set({ user: userCredential.user, role: payload.role });
        } catch (error) {
          console.error("Registration failed:", error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await signOut(auth);
          set({ user: null, role: null, userData: null });
        } catch (error) {
          console.error("Logout failed:", error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export default useAuthStore;
