import { useReducer, useEffect, useState, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import Spinner from "./components/Spinner";

const getHomeRoute = (role) => {
  if (role === "ADMIN") return "/admin";
  if (role === "TEACHER") return "/teacher/courses";
  if (role === "STUDENT") return "/courses";
  return "/login";
};

const ProtectedRoute = ({ allowedRoles, children }) => {
  const [user] = useContext(UserContext);

  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role))
    return <Navigate to={getHomeRoute(user.role)} replace />;

  return children;
};

const AuthRoute = ({ children }) => {
  const [user] = useContext(UserContext);

  if (user) return <Navigate to={getHomeRoute(user.role)} replace />;

  return children;
};

function App() {
  const [user, dispatch] = useReducer(UserReducer, null);

  const [isAuthReady, setIsAuthReady] = useState(false);

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
      setIsAuthReady(true);
    };
    loadUser();
  }, []);

  if (!isAuthReady) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner />
      </div>
    );
  }

  return (
    <UserContext.Provider value={[user, dispatch]}>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route
            path="/register"
            element={
              <AuthRoute>
                <Register />
              </AuthRoute>
            }
          />
          <Route
            path="/login"
            element={
              <AuthRoute>
                <Login />
              </AuthRoute>
            }
          />

          <Route
            path="/me"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "TEACHER", "STUDENT"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/course/:id"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "TEACHER", "STUDENT"]}>
                <CourseDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <ProtectedRoute allowedRoles={["TEACHER", "STUDENT"]}>
                <Chat />
              </ProtectedRoute>
            }
          />

          <Route
            path="/courses"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <Courses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-courses"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <MyCourses />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/courses"
            element={
              <ProtectedRoute allowedRoles={["TEACHER"]}>
                <TeacherCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/courses/:id"
            element={
              <ProtectedRoute allowedRoles={["TEACHER"]}>
                <TeacherCourseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/courses/:id/students/:studentId"
            element={
              <ProtectedRoute allowedRoles={["TEACHER"]}>
                <StudentProgress />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/statistic"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminStatistic />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              user ? (
                <Navigate to={getHomeRoute(user.role)} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
        <Footer />
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
