import { firestore } from "../services/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";

interface TeacherModule {
  id?: string;
  title: string;
  description: string;
  teacherId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const createModule = async (
  moduleData: Omit<TeacherModule, "id" | "createdAt" | "updatedAt">
) => {
  try {
    const modulesRef = collection(firestore, "modules");
    const newModule = {
      ...moduleData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const docRef = await addDoc(modulesRef, newModule);
    return { id: docRef.id, ...newModule };
  } catch (error) {
    console.error("Error creating module:", error);
    throw error;
  }
};

export const getModulesByTeacher = async (teacherId: string) => {
  try {
    const modulesRef = collection(firestore, "modules");
    const q = query(modulesRef, where("teacherId", "==", teacherId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TeacherModule[];
  } catch (error) {
    console.error("Error fetching modules:", error);
    throw error;
  }
};

export const getModules = async () => {
  try {
    const modulesRef = collection(firestore, "modules");
    const querySnapshot = await getDocs(modulesRef);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching modules:", error);
    throw error;
  }
};

export const updateModule = async (
  moduleId: string,
  updates: Partial<TeacherModule>
) => {
  try {
    const moduleRef = doc(firestore, "modules", moduleId);
    const updatedData = {
      ...updates,
      updatedAt: new Date(),
    };
    await updateDoc(moduleRef, updatedData);
    return { id: moduleId, ...updatedData };
  } catch (error) {
    console.error("Error updating module:", error);
    throw error;
  }
};

export const deleteModule = async (moduleId: string) => {
  try {
    const moduleRef = doc(firestore, "modules", moduleId);
    await deleteDoc(moduleRef);
    return moduleId;
  } catch (error) {
    console.error("Error deleting module:", error);
    throw error;
  }
};
