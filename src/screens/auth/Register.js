import React, { useState } from "react";
import { Container, Form, Button, Row, Col, Card } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Api, { endpoints } from "../../configs/Apis";
import Spinner from "../../components/Spinner";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    role: "STUDENT",
  });
  const [avatar, setAvatar] = useState(null);

  const change = (evt, field) => {
    setUser((current) => {
      return { ...current, [field]: evt.target.value };
    });
  };

  const register = async (evt) => {
    evt.preventDefault();

    let formData = new FormData();
    formData.append("email", user.email);
    formData.append("password", user.password);
    formData.append("confirmPassword", user.confirmPassword);
    formData.append("firstName", user.firstName);
    formData.append("lastName", user.lastName);
    formData.append("role", user.role);

    if (avatar) {
      formData.append("avatar", avatar);
    }

    setLoading(true);
    try {
      let res = await Api.post(endpoints["register"], formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 200 || res.status === 201) {
        Swal.fire("Thành công!", "Đăng ký tài khoản thành công.", "success");
        navigate("/login");
      }
    } catch (error) {
      Swal.fire(
        "Thất bại!",
        error.response?.data || "Có lỗi xảy ra khi đăng ký.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <Container className="d-flex justify-content-center mt-5 mb-5">
      <Card style={{ width: "500px" }} className="shadow-sm">
        <Card.Body>
          <h2 className="text-center mb-4">Đăng ký tài khoản</h2>
          <Form onSubmit={register}>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Họ</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={user.lastName}
                    onChange={(e) => change(e, "lastName")}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Tên</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={user.firstName}
                    onChange={(e) => change(e, "firstName")}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                required
                value={user.email}
                onChange={(e) => change(e, "email")}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                required
                value={user.password}
                onChange={(e) => change(e, "password")}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Xác nhận mật khẩu</Form.Label>
              <Form.Control
                type="password"
                required
                value={user.confirmPassword}
                onChange={(e) => change(e, "confirmPassword")}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Vai trò</Form.Label>
              <Form.Select
                value={user.role}
                onChange={(e) => change(e, "role")}
              >
                <option value="STUDENT">Sinh viên</option>
                <option value="TEACHER">Giảng viên</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Avatar</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                required
                onChange={(e) => setAvatar(e.target.files[0])}
              />
            </Form.Group>

            <div className="d-grid gap-2">
              <Button variant="primary" type="submit">
                Đăng ký
              </Button>
            </div>

            <div className="text-center mt-3">
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Register;
