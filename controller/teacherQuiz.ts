import { firestore } from "../services/firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { createContentUploadNotification } from "./notificationController";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface Quiz {
  id?: string;
  title: string;
  moduleId: string;
  teacherId: string;
  questions: QuizQuestion[];
  createdAt: Date;
  updatedAt: Date;
  teacherName?: string;
}

export const createQuiz = async (
  quizData: Omit<Quiz, "id" | "createdAt" | "updatedAt">
) => {
  try {
    const quizRef = collection(firestore, "quizzes");
    const newQuiz = {
      ...quizData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const docRef = await addDoc(quizRef, newQuiz);

    // Create notification for the new quiz
    await createContentUploadNotification(
      quizData.teacherId,
      quizData.teacherName || "",
      "quiz",
      docRef.id
    );

    return { id: docRef.id, ...newQuiz };
  } catch (error) {
    console.error("Error creating quiz:", error);
    throw error;
  }
};

//get quizzes
export const getQuizzes = async () => {
  try {
    const quizRef = collection(firestore, "quizzes");
    const querySnapshot = await getDocs(quizRef);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Quiz[];
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    throw error;
  }
};

export const getQuizzesByModule = async (moduleId: string) => {
  try {
    const quizRef = collection(firestore, "quizzes");
    const q = query(quizRef, where("moduleId", "==", moduleId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Quiz[];
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    ``;
    throw error;
  }
};

export const updateQuiz = async (quizId: string, updates: Partial<Quiz>) => {
  try {
    const quizRef = doc(firestore, "quizzes", quizId);
    const updatedData = {
      ...updates,
      updatedAt: new Date(),
    };
    await updateDoc(quizRef, updatedData);
    return { id: quizId, ...updatedData };
  } catch (error) {
    console.error("Error updating quiz:", error);
    throw error;
  }
};

export const deleteQuiz = async (quizId: string) => {
  try {
    const quizRef = doc(firestore, "quizzes", quizId);
    await deleteDoc(quizRef);
    return quizId;
  } catch (error) {
    console.error("Error deleting quiz:", error);
    throw error;
  }
};
