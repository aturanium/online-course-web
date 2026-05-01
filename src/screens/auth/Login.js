import React, { useState, useContext } from "react";
import { Container, Form, Button, Card } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Api, { authApi, endpoints } from "../../configs/Apis";
import { UserContext } from "../../configs/Context";
import Spinner from "../../components/Spinner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [, dispatch] = useContext(UserContext);
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await Api.post(endpoints["login"], {
        email: email,
        password: password,
      });

      const token = res.data.token;
      localStorage.setItem("token", token);

      const userRes = await authApi().get(endpoints["currentUser"]);

      dispatch({
        type: "LOGIN",
        payload: userRes.data,
      });

      const role = userRes.data.role;
      if (role === "ADMIN") {
        navigate("/admin");
      } else if (role === "TEACHER") {
        navigate("/teacher/courses");
      } else {
        navigate("/courses");
      }
    } catch (error) {
      Swal.fire(
        "Đăng nhập thất bại!",
        "Email hoặc mật khẩu không chính xác.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <Container className="d-flex justify-content-center mt-5 mb-5">
      <Card style={{ width: "400px" }} className="shadow-sm">
        <Card.Body>
          <h2 className="text-center mb-4">Đăng nhập</h2>
          <Form onSubmit={login}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <div className="d-grid gap-2">
              <Button variant="success" type="submit">
                Đăng nhập
              </Button>
            </div>

            <div className="text-center mt-3">
              Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;
