import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  Container,
  Card,
  Table,
  Badge,
  Button,
  Modal,
  Form,
  Tab,
  Nav,
  Row,
  Col,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { authApi, endpoints } from "../../configs/Apis";
import { UserContext } from "../../configs/Context";
import Spinner from "../../components/Spinner";
import Swal from "sweetalert2";

const AdminCourses = () => {
  const [user] = useContext(UserContext);
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCatModal, setShowCatModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [editingCatId, setEditingCatId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [courseRes, catRes] = await Promise.all([
        authApi().get(endpoints["adminCourses"]),
        authApi().get(endpoints["categories"]),
      ]);
      setCourses(courseRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error(error);
      Swal.fire("Lỗi", "Không thể tải dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/login");
      return;
    }
    fetchData();
  }, [user, navigate, fetchData]);

  const handleApprove = async (id, courseName) => {
    const confirm = await Swal.fire({
      title: "Duyệt khóa học?",
      text: `Bạn chuẩn bị cấp phép xuất bản khóa học: "${courseName}"`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đồng ý Duyệt",
      cancelButtonText: "Hủy",
    });

    if (confirm.isConfirmed) {
      try {
        await authApi().patch(endpoints["approveCourse"](id));
        Swal.fire(
          "Thành công",
          "Khóa học đã được đưa lên hệ thống!",
          "success",
        );
        fetchData();
      } catch (error) {
        Swal.fire("Lỗi", "Không thể duyệt khóa học này", "error");
      }
    }
  };

  const handleDelete = async (id, courseName) => {
    const confirm = await Swal.fire({
      title: "Xóa khóa học?",
      text: `Bạn có chắc muốn xóa khóa học: "${courseName}" khỏi hệ thống?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Xóa vĩnh viễn",
      cancelButtonText: "Hủy",
    });

    if (confirm.isConfirmed) {
      try {
        await authApi().delete(endpoints["deleteCourse"](id));
        Swal.fire("Đã xóa", "Khóa học đã bị loại bỏ.", "success");
        fetchData();
      } catch (error) {
        Swal.fire("Lỗi", "Không thể xóa khóa học này", "error");
      }
    }
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCatId) {
        await authApi().put(endpoints["categoryAction"](editingCatId), {
          name: categoryName,
        });
        Swal.fire("Thành công", "Đã cập nhật chủ đề!", "success");
      } else {
        await authApi().post(endpoints["categories"], { name: categoryName });
        Swal.fire("Thành công", "Đã thêm chủ đề mới!", "success");
      }

      setShowCatModal(false);
      setCategoryName("");
      setEditingCatId(null);
      fetchData();
    } catch (error) {
      Swal.fire(
        "Lỗi",
        error.response?.data || "Không thể lưu chủ đề lúc này",
        "error",
      );
    }
  };

  const openAddModal = () => {
    setEditingCatId(null);
    setCategoryName("");
    setShowCatModal(true);
  };

  const openEditModal = (cat) => {
    setEditingCatId(cat.id);
    setCategoryName(cat.name);
    setShowCatModal(true);
  };

  const handleDeleteCategory = async (id, name) => {
    const confirm = await Swal.fire({
      title: "Xóa chủ đề?",
      text: `Bạn có chắc muốn xóa chủ đề "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Xóa",
    });

    if (confirm.isConfirmed) {
      try {
        await authApi().delete(endpoints["categoryAction"](id));
        Swal.fire("Đã xóa", "Chủ đề đã bị xóa.", "success");
        fetchData();
      } catch (error) {
        Swal.fire(
          "Lỗi",
          "Không thể xóa (có thể do đã có khóa học thuộc chủ đề này)",
          "error",
        );
      }
    }
  };

  if (loading) return <Spinner />;

  const pendingCount = courses.filter((c) => c.status === "PENDING").length;

  return (
    <Container className="mt-4 mb-5" style={{ minHeight: "70vh" }}>
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <div>
          <h2 className="fw-bold mb-1">Quản Trị Nội Dung</h2>
          <p className="text-muted mb-0">
            Quản lý khóa học và danh mục hệ thống
          </p>
        </div>
        <Badge bg="danger" className="fs-6 px-3 py-2">
          {pendingCount} khóa học chờ duyệt
        </Badge>
      </div>

      <Tab.Container defaultActiveKey="courses">
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white">
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="courses" className="fw-bold">
                  <i className="fa-solid fa-photo-film me-2"></i> Khóa học
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="categories" className="fw-bold">
                  <i className="fa-solid fa-layer-group me-2"></i> Chủ đề
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body className="p-0">
            <Tab.Content>
              <Tab.Pane eventKey="courses">
                <div className="table-responsive">
                  <Table hover className="mb-0 align-middle">
                    <thead className="table-light">
                      <tr>
                        <th className="py-3">Khóa học</th>
                        <th className="py-3">Giảng viên</th>
                        <th className="py-3">Trạng thái</th>
                        <th className="py-3 text-end pe-4">Kiểm duyệt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.length === 0 ? (
                        <tr>
                          <td
                            colSpan="4"
                            className="text-center py-5 text-muted"
                          >
                            Hệ thống chưa có khóa học nào.
                          </td>
                        </tr>
                      ) : (
                        courses.map((c) => (
                          <tr key={c.id}>
                            <td className="ps-4">
                              <div className="d-flex align-items-center">
                                <img
                                  src={c.image}
                                  alt="course"
                                  style={{
                                    width: "50px",
                                    height: "40px",
                                    objectFit: "cover",
                                    borderRadius: "4px",
                                  }}
                                  className="me-3 border"
                                />
                                <div>
                                  <div className="fw-bold text-dark">
                                    {c.name}
                                  </div>
                                  <div className="small text-danger fw-medium">
                                    {c.price.toLocaleString() + " VNĐ"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="fw-medium text-primary">
                                <i className="fa-solid fa-chalkboard-user me-1"></i>{" "}
                                {c.teacherName}
                              </div>
                            </td>
                            <td>
                              {c.status === "PENDING" ? (
                                <Badge
                                  bg="warning"
                                  text="dark"
                                  className="px-2 py-1"
                                >
                                  Chờ duyệt
                                </Badge>
                              ) : (
                                <Badge bg="success" className="px-2 py-1">
                                  Đã duyệt
                                </Badge>
                              )}
                            </td>
                            <td className="text-end pe-4">
                              <Button
                                variant="info"
                                size="sm"
                                className="me-2 text-white"
                                onClick={() => navigate(`/course/${c.id}`)}
                              >
                                Xem
                              </Button>
                              {c.status === "PENDING" && (
                                <Button
                                  variant="success"
                                  size="sm"
                                  className="me-2"
                                  onClick={() => handleApprove(c.id, c.name)}
                                >
                                  Duyệt
                                </Button>
                              )}
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(c.id, c.name)}
                              >
                                Xóa
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey="categories" className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0">Danh sách Chủ đề</h5>
                  <Button variant="primary" onClick={openAddModal}>
                    <i className="fa-solid fa-plus me-2"></i>Thêm chủ đề
                  </Button>
                </div>

                <Row className="g-3">
                  {categories.map((cat, idx) => (
                    <Col md={4} key={idx}>
                      <Card className="border shadow-sm">
                        <Card.Body className="d-flex justify-content-between align-items-center p-3">
                          <span className="fw-bold fs-6">{cat.name}</span>
                          <div>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => openEditModal(cat)}
                            >
                              Sửa
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() =>
                                handleDeleteCategory(cat.id, cat.name)
                              }
                            >
                              Xóa
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Card>
      </Tab.Container>

      <Modal show={showCatModal} onHide={() => setShowCatModal(false)}>
        <Form onSubmit={handleSubmitCategory}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingCatId ? "Cập nhật chủ đề" : "Thêm chủ đề mới"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>
                Tên chủ đề <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                required
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                setShowCatModal(false);
                setEditingCatId(null);
              }}
            >
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              {editingCatId ? "Cập nhật" : "Lưu lại"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AdminCourses;
