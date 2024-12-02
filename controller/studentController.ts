import { firestore } from "../services/firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

interface StudentQuizAttempt {
  id?: string;
  studentId: string;
  quizId: string;
  moduleId: string;
  answers: {
    questionId: string;
    selectedAnswer: string;
  }[];
  score: number;
  completedAt: Date;
}

interface StudentModuleProgress {
  id?: string;
  studentId: string;
  moduleId: string;
  completed: boolean;
  lastAccessedAt: Date;
}

export const submitQuizAttempt = async (
  attemptData: Omit<StudentQuizAttempt, "id" | "completedAt">
) => {
  try {
    const attemptRef = collection(firestore, "quizAttempts");
    const newAttempt = {
      ...attemptData,
      completedAt: new Date(),
    };
    const docRef = await addDoc(attemptRef, newAttempt);
    return { id: docRef.id, ...newAttempt };
  } catch (error) {
    console.error("Error submitting quiz attempt:", error);
    throw error;
  }
};

export const getStudentQuizAttempts = async (studentId: string) => {
  try {
    const attemptRef = collection(firestore, "quizAttempts");
    const q = query(attemptRef, where("studentId", "==", studentId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as StudentQuizAttempt[];
  } catch (error) {
    console.error("Error fetching quiz attempts:", error);
    throw error;
  }
};

export const updateModuleProgress = async (
  progressData: StudentModuleProgress
) => {
  try {
    const progressRef = collection(firestore, "moduleProgress");
    const q = query(
      progressRef,
      where("studentId", "==", progressData.studentId),
      where("moduleId", "==", progressData.moduleId)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Create new progress record
      const newProgress = {
        ...progressData,
        lastAccessedAt: new Date(),
      };
      const docRef = await addDoc(progressRef, newProgress);
      return { id: docRef.id, ...newProgress };
    } else {
      // Update existing progress
      const existingDoc = querySnapshot.docs[0];
      const updatedData = {
        ...progressData,
        lastAccessedAt: new Date(),
      };
      await updateDoc(doc(progressRef, existingDoc.id), updatedData);
      return { id: existingDoc.id, ...updatedData };
    }
  } catch (error) {
    console.error("Error updating module progress:", error);
    throw error;
  }
};

export const getStudentModuleProgress = async (studentId: string) => {
  try {
    const progressRef = collection(firestore, "moduleProgress");
    const q = query(progressRef, where("studentId", "==", studentId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as StudentModuleProgress[];
  } catch (error) {
    console.error("Error fetching module progress:", error);
    throw error;
  }
};
