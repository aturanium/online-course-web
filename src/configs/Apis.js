import axios from "axios";

const SERVER_URL = "http://localhost:8080/online-course-api/api";

export const endpoints = {
  login: "/login",
  register: "/register",
  currentUser: "/me",
  updateProfile: "/profile",
  changePassword: "/change-password",
  transactions: "/transaction",
  searchUsers: "/users/search",
  chatRooms: "/chat-room",
  getOrCreateRoom: (targetUserId) => `/chat-room/${targetUserId}`,
  deleteRoom: (roomId) => `/chat-room/${roomId}`,
  sendMessage: (roomId) => `/chat-room/${roomId}/message`,
  courses: "/courses",
  category: "/category",
  courseDetail: (id) => `/courses/${id}`,
  cart: "/cart",
  removeFromCart: (courseId) => `/cart/${courseId}`,
  createPayment: "/payment/create",
  updatePayment: (id) => `/payment/${id}`,
  myCourses: "/student/courses",
  teacherCourses: "/courses",
  addCourse: "/courses",
  updateCourse: (id) => `/courses/${id}`,
  deleteCourse: (id) => `/courses/${id}`,
  teacherCourseDetail: (id) => `/courses/${id}`,
  courseStatistic: (id) => `/courses/${id}/statistic`,
  courseStudents: (id) => `/courses/${id}/students`,
  lessons: "/lessons",
  lessonDetail: (id) => `/lessons/${id}`,
  removeStudent: (courseId, studentId) =>
    `/courses/${courseId}/students/${studentId}`,
  studentProgress: (courseId, studentId) =>
    `/courses/${courseId}/students/${studentId}`,
  adminCourses: "/courses",
  approveCourse: (id) => `/courses/${id}/verify`,
  adminUsers: "/users",
  adminUserAction: (id) => `/users/${id}`,
  resetPassword: (id) => `/users/${id}/reset-password`,
  verifyTeacher: (id) => `/users/${id}/verify`,
  statOverview: "/admin/statistics/overview",
  statCourses: "/admin/statistics/courses",
  categories: "/category",
  categoryAction: (id) => `/category/${id}`,
  completeLesson: (id) => `/lessons/${id}/complete`,
};

export const authApi = () => {
  return axios.create({
    baseURL: SERVER_URL,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
};

export default axios.create({
  baseURL: SERVER_URL,
});
