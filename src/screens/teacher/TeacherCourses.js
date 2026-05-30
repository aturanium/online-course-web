import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Card,
  Button,
  Table,
  Badge,
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

const TeacherCourses = () => {
  const [user] = useContext(UserContext);
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCourseId, setCurrentCourseId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    categoryId: "",
    image: null,
    videoIntro: null,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseRes, catRes] = await Promise.all([
        authApi().get(endpoints["teacherCourses"]),
        authApi().get(endpoints["category"]),
      ]);
      setCourses(courseRes.data);
      setCategories(catRes.data);
    } catch (error) {
      Swal.fire("Lỗi", "Không thể tải dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "TEACHER") {
      navigate("/login");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });
  };

  const handleShowAdd = () => {
    setIsEditMode(false);
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "",
      categoryId: "",
      image: null,
      videoIntro: null,
    });
    setShowModal(true);
  };

  const handleShowEdit = (course) => {
    setIsEditMode(true);
    setCurrentCourseId(course.id);

    setFormData({
      name: course.name,
      description: course.description,
      price: course.price,
      duration: course.duration,
      categoryId:
        course.categoryId || (categories.length > 0 ? categories[0].id : ""),
      image: null,
      videoIntro: null,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    let form = new FormData();
    form.append("name", formData.name);
    form.append("description", formData.description);
    form.append("price", formData.price);
    form.append("duration", formData.duration);
    form.append("categoryId", formData.categoryId);
    if (formData.image) form.append("image", formData.image);
    if (formData.videoIntro) form.append("videoIntro", formData.videoIntro);

    try {
      if (isEditMode) {
        await authApi().patch(
          endpoints["updateCourse"](currentCourseId),
          form,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        Swal.fire(
          "Thành công",
          "Đã cập nhật khóa học, vui lòng chờ Admin duyệt lại!",
          "success",
        );
      } else {
        await authApi().post(endpoints["addCourse"], form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire(
          "Thành công",
          "Đã tạo khóa học mới, đang chờ duyệt!",
          "success",
        );
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      Swal.fire("Lỗi", "Có lỗi xảy ra khi lưu khóa học", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Chắc chắn xóa?",
      text: "Bạn không thể khôi phục sau khi xóa!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (confirm.isConfirmed) {
      try {
        await authApi().delete(endpoints["deleteCourse"](id));
        Swal.fire("Đã xóa", "Khóa học đã bị xóa.", "success");
        fetchData();
      } catch (error) {
        Swal.fire("Lỗi", "Không thể xóa khóa học này", "error");
      }
    }
  };

  if (loading) return <Spinner />;

  return (
    <Container className="mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <h2 className="fw-bold mb-0">Quản lý Khóa học</h2>
        <Button variant="primary" onClick={handleShowAdd}>
          Thêm khóa học
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0 table-responsive">
          <Table hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th className="py-3 ps-4">Ảnh bìa</th>
                <th className="py-3">Tên khóa học</th>
                <th className="py-3">Giá</th>
                <th className="py-3">Thời lượng</th>
                <th className="py-3">Doanh thu</th>
                <th className="py-3">Trạng thái</th>
                <th className="py-3 text-end pe-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    Bạn chưa tạo khóa học nào.
                  </td>
                </tr>
              ) : (
                courses.map((c) => (
                  <tr key={c.id}>
                    <td className="ps-4">
                      <img
                        src={c.image}
                        alt="course"
                        style={{
                          width: "60px",
                          height: "45px",
                          objectFit: "cover",
                          borderRadius: "5px",
                        }}
                      />
                    </td>
                    <td className="fw-medium">{c.name}</td>
                    <td className="text-danger fw-bold">
                      {c.price?.toLocaleString()} VNĐ
                    </td>
                    <td>{c.duration} giờ</td>

                    <td className="text-success fw-bold">
                      {c.totalRevenue ? c.totalRevenue.toLocaleString() : "0"}{" "}
                      VNĐ
                    </td>

                    <td>
                      <Badge bg={c.status === "ACTIVE" ? "success" : "warning"}>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="text-end pe-4">
                      <Button
                        variant="info"
                        size="sm"
                        className="me-2 text-white"
                        onClick={() => navigate(`/teacher/courses/${c.id}`)}
                      >
                        <i className="fa-solid fa-eye"></i> Xem
                      </Button>
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2 text-white"
                        onClick={() => handleShowEdit(c)}
                      >
                        <i className="fa-solid fa-pen"></i> Sửa
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(c.id)}
                      >
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        backdrop="static"
      >
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold">
              {isEditMode ? "Cập nhật khóa học" : "Tạo khóa học mới"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {submitting ? (
              <div className="text-center py-5 my-5">
                <Spinner
                  animation="border"
                  variant="primary"
                  style={{ width: "3rem", height: "3rem" }}
                />
              </div>
            ) : (
              <Row className="g-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Tên khóa học</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Giá</Form.Label>
                    <Form.Control
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Thời lượng</Form.Label>
                    <Form.Control
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                      min="1"
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Chủ đề</Form.Label>
                    <Form.Select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">-- Chọn chủ đề --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Mô tả chi tiết</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      Ảnh bìa{" "}
                      {isEditMode && (
                        <span className="text-muted small">
                          (Bỏ qua nếu không đổi)
                        </span>
                      )}
                    </Form.Label>
                    <Form.Control
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleFileChange}
                      required={!isEditMode}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      Video Giới thiệu{" "}
                      {isEditMode && (
                        <span className="text-muted small">
                          (Bỏ qua nếu không đổi)
                        </span>
                      )}
                    </Form.Label>
                    <Form.Control
                      type="file"
                      name="videoIntro"
                      accept="video/*"
                      onChange={handleFileChange}
                      required={!isEditMode}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
          </Modal.Body>

          <Modal.Footer className="bg-light">
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
              disabled={submitting}
            >
              Đóng
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {isEditMode ? "Lưu thay đổi" : "Tạo khóa học"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default TeacherCourses;
