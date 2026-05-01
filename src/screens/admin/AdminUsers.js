import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  Container,
  Card,
  Table,
  Badge,
  Button,
  Modal,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { authApi, endpoints } from "../../configs/Apis";
import { UserContext } from "../../configs/Context";
import Spinner from "../../components/Spinner";
import Swal from "sweetalert2";

const AdminUsers = () => {
  const [user] = useContext(UserContext);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "STUDENT",
    avatar: null,
  });
  const [newPassword, setNewPassword] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authApi().get(endpoints["adminUsers"]);
      setUsers(res.data);
    } catch (error) {
      Swal.fire("Lỗi", "Không thể tải danh sách người dùng", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/login");
      return;
    }
    fetchUsers();
  }, [user, navigate, fetchUsers]);

  const handleShowAdd = () => {
    setIsEdit(false);
    setFormData({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "STUDENT",
      avatar: null,
    });
    setShowModal(true);
  };

  const handleShowEdit = (u) => {
    setIsEdit(true);
    setCurrentId(u.id);
    setFormData({
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      avatar: null,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let form = new FormData();
    if (!isEdit) {
      form.append("email", formData.email);
      form.append("password", formData.password);
    }
    form.append("firstName", formData.firstName);
    form.append("lastName", formData.lastName);
    form.append("role", formData.role);
    if (formData.avatar) form.append("avatar", formData.avatar);

    try {
      if (isEdit) {
        await authApi().patch(endpoints["adminUserAction"](currentId), form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("Thành công", "Đã cập nhật thông tin", "success");
      } else {
        await authApi().post(endpoints["adminUsers"], form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("Thành công", "Đã thêm người dùng mới", "success");
      }
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      Swal.fire("Lỗi", error.response?.data || "Có lỗi xảy ra", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Xóa người dùng?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
    });
    if (confirm.isConfirmed) {
      try {
        await authApi().delete(endpoints["adminUserAction"](id));
        Swal.fire("Đã xóa", "", "success");
        fetchUsers();
      } catch (error) {
        Swal.fire("Lỗi", "Không thể xóa", "error");
      }
    }
  };

  const handleVerify = async (id) => {
    try {
      await authApi().patch(endpoints["verifyTeacher"](id));
      Swal.fire("Thành công", "Đã xác minh Giảng viên", "success");
      fetchUsers();
    } catch (error) {
      Swal.fire("Lỗi", "Không thể xác minh", "error");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await authApi().patch(endpoints["resetPassword"](currentId), {
        newPassword,
      });
      Swal.fire("Thành công", "Đã đặt lại mật khẩu", "success");
      setShowPassModal(false);
      setNewPassword("");
    } catch (error) {
      Swal.fire("Lỗi", "Không thể đổi mật khẩu", "error");
    }
  };

  if (loading) return <Spinner />;

  return (
    <Container className="mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <h2 className="fw-bold">Quản lý Người dùng</h2>
        <Button variant="primary" onClick={handleShowAdd}>
          <i className="fa-solid fa-user-plus me-2"></i> Thêm tài khoản
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <Table hover align="middle" className="mb-0">
          <thead className="table-light">
            <tr>
              <th className="ps-4">Người dùng</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th className="text-end pe-4">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="ps-4">
                  <div className="d-flex align-items-center">
                    <img
                      src={u.avatar}
                      alt="avt"
                      className="rounded-circle me-3"
                      style={{
                        width: "45px",
                        height: "45px",
                        objectFit: "cover",
                      }}
                    />
                    <div>
                      <div className="fw-bold">
                        {u.lastName} {u.firstName}
                      </div>
                      <div className="text-muted small">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <Badge
                    bg={
                      u.role === "ADMIN"
                        ? "danger"
                        : u.role === "TEACHER"
                          ? "info"
                          : "secondary"
                    }
                  >
                    {u.role}
                  </Badge>
                </td>
                <td>
                  {u.role === "TEACHER" &&
                    (u.isVerified ? (
                      <Badge bg="success">
                        <i className="fa-solid fa-check-circle me-1"></i>Đã xác
                        minh
                      </Badge>
                    ) : (
                      <Badge bg="warning" text="dark">
                        <i className="fa-solid fa-clock me-1"></i>Chưa xác minh
                      </Badge>
                    ))}
                </td>
                <td className="text-end pe-4">
                  {u.role === "TEACHER" && !u.isVerified && (
                    <Button
                      variant="success"
                      size="sm"
                      className="me-2"
                      onClick={() => handleVerify(u.id)}
                    >
                      Xác minh
                    </Button>
                  )}
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2 text-white"
                    onClick={() => handleShowEdit(u)}
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="me-2"
                    onClick={() => {
                      setCurrentId(u.id);
                      setShowPassModal(true);
                    }}
                  >
                    Đổi mật khẩu
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(u.id)}
                  >
                    Xóa
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {isEdit ? "Cập nhật người dùng" : "Thêm người dùng mới"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              {!isEdit && (
                <>
                  <Col md={12}>
                    <Form.Control
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </Col>
                  <Col md={12}>
                    <Form.Control
                      type="password"
                      placeholder="Mật khẩu"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                    />
                  </Col>
                </>
              )}
              <Col md={6}>
                <Form.Control
                  type="text"
                  placeholder="Họ"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                />
              </Col>
              <Col md={6}>
                <Form.Control
                  type="text"
                  placeholder="Tên"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                />
              </Col>
              <Col md={12}>
                <Form.Select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="STUDENT">Sinh viên</option>
                  <option value="TEACHER">Giảng viên</option>
                  <option value="ADMIN">Admin</option>
                </Form.Select>
              </Col>
              <Col md={12}>
                <Form.Label className="small text-muted">
                  Avatar {isEdit && "(Bỏ qua nếu không đổi)"}
                </Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({ ...formData, avatar: e.target.files[0] })
                  }
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" type="submit">
              Lưu lại
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showPassModal} onHide={() => setShowPassModal(false)}>
        <Form onSubmit={handleResetPassword}>
          <Modal.Header closeButton>
            <Modal.Title>Đặt lại mật khẩu</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Control
              type="password"
              placeholder="Nhập mật khẩu mới"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" type="submit">
              Đổi mật khẩu
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};
export default AdminUsers;
