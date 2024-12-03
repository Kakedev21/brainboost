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
  writeBatch,
  orderBy,
} from "firebase/firestore";

interface StudentNotification {
  id?: string;
  studentId: string;
  teacherId: string;
  fullName: string;
  type: "quiz" | "module";
  contentId: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export const createContentUploadNotification = async (
  teacherId: string,
  teacherName: string,
  contentType: "quiz" | "module",
  contentId: string
): Promise<{ success: boolean; notificationCount: number }> => {
  try {
    // Get all users who are students
    const usersRef = collection(firestore, "users");
    const q = query(usersRef, where("role", "==", "student")); // Add this query
    const studentsSnapshot = await getDocs(q);

    if (studentsSnapshot.empty) {
      console.warn("No students found in the database");
      return {
        success: false,
        notificationCount: 0,
      };
    }

    // Create batch
    const batch = writeBatch(firestore);
    const notificationsRef = collection(firestore, "notifications");
    let notificationCount = 0;

    // Add notification for each student in batch
    studentsSnapshot.forEach((studentDoc) => {
      const newNotificationRef = doc(notificationsRef);
      batch.set(newNotificationRef, {
        studentId: studentDoc.id,
        teacherId,
        teacherName,
        type: contentType,
        contentId,
        message: `${teacherName} uploaded a new ${contentType}`,
        isRead: false,
        createdAt: new Date(),
      });
      notificationCount++;
    });

    await batch.commit();

    return {
      success: true,
      notificationCount,
    };
  } catch (error) {
    console.error("Error creating notifications:", error);
    throw error;
  }
};

export const markNotificationAsRead = async (
  notificationId: string
): Promise<void> => {
  try {
    const notificationRef = doc(firestore, "notifications", notificationId);
    await updateDoc(notificationRef, {
      isRead: true,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export const getStudentNotifications = async (
  studentId: string
): Promise<StudentNotification[]> => {
  try {
    const notificationsRef = collection(firestore, "notifications");
    const q = query(
      notificationsRef,
      where("studentId", "==", studentId),
      orderBy("createdAt", "desc")
    );

    const notificationsSnapshot = await getDocs(q);
    const notifications: StudentNotification[] = [];

    notificationsSnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data(),
      } as StudentNotification);
    });

    return notifications;
  } catch (error) {
    console.error("Error fetching student notifications:", error);
    throw error;
  }
};
