import { firestore } from "../services/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

interface QuizResult {
  id: string;
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

export const getQuizResultsByModule = async (moduleId: string) => {
  try {
    const attemptsRef = collection(firestore, "quizAttempts");
    const q = query(attemptsRef, where("moduleId", "==", moduleId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as QuizResult[];
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    throw error;
  }
};

export const getQuizResultsByQuiz = async (quizId: string) => {
  try {
    const attemptsRef = collection(firestore, "quizAttempts");
    const q = query(attemptsRef, where("quizId", "==", quizId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as QuizResult[];
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    throw error;
  }
};

export const getQuizResultsByStudent = async (studentId: string) => {
  try {
    const attemptsRef = collection(firestore, "quizAttempts");
    const q = query(attemptsRef, where("studentId", "==", studentId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as QuizResult[];
  } catch (error) {
    console.error("Error fetching student results:", error);
    throw error;
  }
};

//get all result
export const getAllQuizResults = async () => {
  try {
    const attemptsRef = collection(firestore, "quizAttempts");
    const querySnapshot = await getDocs(attemptsRef);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as QuizResult[];
  } catch (error) {
    console.error("Error fetching all quiz results:", error);
    throw error;
  }
};
