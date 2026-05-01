import { useReducer, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserContext } from "./configs/Context";
import UserReducer from "./reducers/UserReducer";
import { authApi, endpoints } from "./configs/Apis";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Register from "./screens/auth/Register";
import Login from "./screens/auth/Login";
import Profile from "./screens/Profile";
import Chat from "./screens/chat/Chat";
import Courses from "./screens/course/Courses";
import CourseDetail from "./screens/course/CourseDetail";
import Cart from "./screens/cart/Cart";
import MyCourses from "./screens/student/MyCourses";
import TeacherCourses from "./screens/teacher/TeacherCourses";
import TeacherCourseDetail from "./screens/teacher/TeacherCourseDetail";
import StudentProgress from "./screens/teacher/StudentProgress";
import AdminCourses from "./screens/admin/AdminCourses";
import AdminUsers from "./screens/admin/AdminUsers";
import AdminStatistic from "./screens/admin/AdminStatistic";
import Admin from "./screens/admin/Admin";

function App() {
  const [user, dispatch] = useReducer(UserReducer, null);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          let res = await authApi().get(endpoints["currentUser"]);
          dispatch({
            type: "LOGIN",
            payload: res.data,
          });
        } catch (error) {
          console.error("Token hết hạn hoặc không hợp lệ");
          localStorage.removeItem("token");
          dispatch({ type: "LOGOUT" });
        }
      }
    };
    loadUser();
  }, []);

  return (
    <UserContext.Provider value={[user, dispatch]}>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/me" element={<Profile />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/teacher/courses" element={<TeacherCourses />} />
          <Route
            path="/teacher/courses/:id"
            element={<TeacherCourseDetail />}
          />
          <Route
            path="/teacher/courses/:id/students/:studentId"
            element={<StudentProgress />}
          />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/courses" element={<AdminCourses />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/statistic" element={<AdminStatistic />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
