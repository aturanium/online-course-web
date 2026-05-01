import React, { useContext, useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Image,
  Modal,
  Form,
} from "react-bootstrap";
import { UserContext } from "../configs/Context";
import { authApi, endpoints } from "../configs/Apis";
import Spinner from "../components/Spinner";
import Swal from "sweetalert2";

const Profile = () => {
  const [user, dispatch] = useContext(UserContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({ firstName: "", lastName: "" });
  const [newAvatar, setNewAvatar] = useState(null);

  const [showPass, setShowPass] = useState(false);
  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      if (user && user.role === "STUDENT") {
        try {
          const res = await authApi().get(endpoints["transactions"]);
          setTransactions(res.data);
        } catch (error) {
          console.error("Lỗi lấy lịch sử:", error);
        }
      }
    };
    fetchTransactions();
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("firstName", editData.firstName || user.firstName);
    formData.append("lastName", editData.lastName || user.lastName);
    if (newAvatar) formData.append("avatar", newAvatar);

    setLoading(true);
    try {
      await authApi().patch(endpoints["updateProfile"], formData);
      const afterUpdatedUser = await authApi().get(endpoints["currentUser"]);
      dispatch({ type: "LOGIN", payload: afterUpdatedUser.data });
      Swal.fire("Thành công", "Đã cập nhật thông tin!", "success");
      setShowEdit(false);
    } catch (error) {
      Swal.fire("Lỗi", "Không thể cập nhật thông tin", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      await authApi().patch(endpoints["changePassword"], passData);
      Swal.fire("Thành công", "Đã đổi mật khẩu!", "success");
      setShowPass(false);
      setPassData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (error) {
      Swal.fire("Lỗi", error.response?.data, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Spinner />;

  return (
    <Container className="mt-5 mb-5">
      <Row>
        <Col md={4}>
          <Card className="text-center shadow-sm border-0">
            <Card.Body>
              <Image
                src={user.avatar}
                roundedCircle
                width="150"
                height="150"
                className="mb-3 shadow"
                style={{ objectFit: "cover" }}
              />
              <h4>
                {user.lastName} {user.firstName}
              </h4>
              <p className="text-muted">{user.email}</p>
              <div className="mb-3">
                <span
                  className={`badge ${user.role === "ADMIN" ? "bg-danger" : user.role === "TEACHER" ? "bg-primary" : "bg-success"}`}
                >
                  {user.role}
                </span>
                {user.role === "TEACHER" && (
                  <span
                    className={`ms-2 badge ${user.isVerified ? "bg-info" : "bg-warning text-dark"}`}
                  >
                    {user.isVerified ? "Đã xác minh" : "Chưa xác minh"}
                  </span>
                )}
              </div>
              <div className="d-grid gap-2">
                <Button
                  variant="outline-primary"
                  onClick={() => {
                    setEditData({
                      firstName: user.firstName,
                      lastName: user.lastName,
                    });
                    setShowEdit(true);
                  }}
                >
                  Sửa thông tin
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPass(true)}
                >
                  Đổi mật khẩu
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        {user.role === "STUDENT" && (
          <Col md={8}>
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-white py-3">
                <h5 className="mb-0">Lịch sử giao dịch</h5>
              </Card.Header>
              <Card.Body>
                {transactions.length > 0 ? (
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Khóa học</th>
                        <th>Giảng viên</th>
                        <th>Giá</th>
                        <th>Phương thức</th>
                        <th>Trạng thái</th>
                        <th>Ngày</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) =>
                        t.items.map((item, index) => (
                          <tr key={`${t.paymentDate}-${index}`}>
                            <td>
                              <div className="d-flex align-items-center">
                                <Image
                                  src={item.image}
                                  width="40"
                                  className="me-2"
                                />
                                {item.courseName}
                              </div>
                            </td>
                            <td>{item.teacherName}</td>
                            <td>{item.price.toLocaleString()}đ</td>
                            <td>{t.paymentMethod}</td>
                            <td>
                              <span
                                className={`badge ${t.status === "SUCCESS" ? "bg-success" : "bg-warning"}`}
                              >
                                {t.status}
                              </span>
                            </td>
                            <td>{t.paymentDate}</td>
                          </tr>
                        )),
                      )}
                    </tbody>
                  </Table>
                ) : (
                  <p className="text-center text-muted">
                    Bạn chưa mua khóa học nào.
                  </p>
                )}
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Sửa thông tin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateProfile}>
            <Form.Group className="mb-3">
              <Form.Label>Họ</Form.Label>
              <Form.Control
                type="text"
                value={editData.lastName}
                onChange={(e) =>
                  setEditData({ ...editData, lastName: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tên</Form.Label>
              <Form.Control
                type="text"
                value={editData.firstName}
                onChange={(e) =>
                  setEditData({ ...editData, firstName: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Avatar mới</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setNewAvatar(e.target.files[0])}
              />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={loading}>
              Lưu thay đổi
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showPass} onHide={() => setShowPass(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Đổi mật khẩu</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleChangePassword}>
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu hiện tại</Form.Label>
              <Form.Control
                type="password"
                required
                onChange={(e) =>
                  setPassData({ ...passData, currentPassword: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu mới</Form.Label>
              <Form.Control
                type="password"
                required
                onChange={(e) =>
                  setPassData({ ...passData, newPassword: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Xác nhận mật khẩu mới</Form.Label>
              <Form.Control
                type="password"
                required
                onChange={(e) =>
                  setPassData({
                    ...passData,
                    confirmNewPassword: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Button variant="danger" type="submit" disabled={loading}>
              Cập nhật mật khẩu
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Profile;
