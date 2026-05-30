import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  Modal,
  Form,
  Nav,
  Tab,
  Ratio,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { authApi, endpoints } from "../../configs/Apis";
import { UserContext } from "../../configs/Context";
import Spinner from "../../components/Spinner";
import Swal from "sweetalert2";

const TeacherCourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user] = useContext(UserContext);

  const [course, setCourse] = useState(null);
  const [stats, setStats] = useState({ totalStudents: 0, totalRevenue: 0 });
  const [revenueFilter, setRevenueFilter] = useState("MONTH");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonEditMode, setLessonEditMode] = useState(false);
  const [currentLessonId, setCurrentLessonId] = useState(null);
  const [lessonData, setLessonData] = useState({ title: "", contentUrl: "" });

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [detailRes, statRes, studentRes] = await Promise.all([
        authApi().get(`/courses/${id}`),
        authApi().get(`/courses/${id}/statistic`),
        authApi().get(`/courses/${id}/students`),
      ]);
      setCourse(detailRes.data);
      setStats(statRes.data);
      setStudents(studentRes.data);
    } catch (error) {
      console.error(error);
      Swal.fire("Lỗi", "Không thể tải dữ liệu khóa học", "error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!user || user.role !== "TEACHER") {
      navigate("/login");
      return;
    }
    fetchData();
  }, [user, navigate, fetchData]);

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    try {
      if (lessonEditMode) {
        await authApi().patch(`/lessons/${currentLessonId}`, lessonData);
        Swal.fire("Thành công", "Đã cập nhật bài học", "success");
      } else {
        await authApi().post(`/lessons`, { ...lessonData, courseId: id });
        Swal.fire("Thành công", "Đã thêm bài học mới", "success");
      }
      setShowLessonModal(false);
      fetchData();
    } catch (error) {
      Swal.fire("Lỗi", "Không thể lưu bài học", "error");
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    const confirm = await Swal.fire({
      title: "Xóa bài học?",
      text: "Dữ liệu bài học sẽ bị mất vĩnh viễn!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
    });
    if (confirm.isConfirmed) {
      try {
        await authApi().delete(`/lessons/${lessonId}`);
        Swal.fire("Đã xóa", "", "success");
        fetchData();
      } catch (error) {
        Swal.fire("Lỗi", "Không thể xóa bài học", "error");
      }
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await authApi().post(`/courses/${id}/students`, { email: studentEmail });
      Swal.fire("Thành công", "Đã thêm sinh viên vào khóa học", "success");
      setStudentEmail("");
      setShowStudentModal(false);
      fetchData();
    } catch (error) {
      Swal.fire(
        "Lỗi",
        error.response?.data || "Email không hợp lệ hoặc sinh viên đã tham gia",
        "error",
      );
    }
  };

  const handleRemoveStudent = async (studentId) => {
    const confirm = await Swal.fire({
      title: "Gỡ sinh viên?",
      text: "Sinh viên này sẽ không thể truy cập khóa học nữa!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Đồng ý gỡ",
      cancelButtonText: "Hủy",
    });

    if (confirm.isConfirmed) {
      try {
        await authApi().delete(endpoints["removeStudent"](id, studentId));
        Swal.fire("Đã gỡ!", "Sinh viên đã bị loại khỏi khóa học.", "success");
        fetchData();
      } catch (error) {
        Swal.fire("Lỗi", "Không thể gỡ sinh viên này", "error");
      }
    }
  };

  if (loading) return <Spinner />;

  return (
    <Container className="mt-4 mb-5">
      <Card className="border-0 shadow-sm mb-4 overflow-hidden">
        <Row className="g-0">
          <Col md={4}>
            <Ratio aspectRatio="16x9">
              <video src={course.videoIntro} controls className="bg-dark" />
            </Ratio>
          </Col>
          <Col
            md={8}
            className="p-4 d-flex flex-column justify-content-between"
          >
            <div>
              <div className="d-flex justify-content-between align-items-start">
                <h2 className="fw-bold">{course.name}</h2>
                <Badge
                  bg={course.status === "ACTIVE" ? "success" : "warning"}
                  className="fs-6"
                >
                  {course.status}
                </Badge>
              </div>
              <p className="text-muted mb-3">
                {course.categoryName} | {course.duration} giờ
              </p>
              <h4 className="text-danger fw-bold">
                {course.price?.toLocaleString()} VNĐ
              </h4>
            </div>

            <Row className="text-center bg-light rounded p-3 mt-3 shadow-sm">
              <Col>
                <div className="small text-muted">Tổng sinh viên</div>
                <div className="fs-4 fw-bold text-primary">
                  {stats.totalStudents}
                </div>
              </Col>
              <Col className="border-start">
                <div className="small text-muted">
                  Tổng doanh thu toàn thời gian
                </div>
                <div className="fs-4 fw-bold text-success">
                  {stats.totalRevenue?.toLocaleString()} VNĐ
                </div>
              </Col>
            </Row>

            <div className="mt-4 border rounded p-3 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0 text-secondary">
                  <i className="fa-solid fa-chart-line me-2"></i> Phân tích
                  doanh thu
                </h6>
                <Form.Select
                  size="sm"
                  style={{ width: "150px" }}
                  value={revenueFilter}
                  onChange={(e) => setRevenueFilter(e.target.value)}
                >
                  <option value="MONTH">Theo Tháng</option>
                  <option value="QUARTER">Theo Quý</option>
                  <option value="YEAR">Theo Năm</option>
                </Form.Select>
              </div>

              <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                <Table size="sm" hover className="mb-0">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th>Thời gian</th>
                      <th className="text-end">Doanh thu (VNĐ)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats &&
                    stats[
                      revenueFilter === "MONTH"
                        ? "revenueByMonth"
                        : revenueFilter === "QUARTER"
                          ? "revenueByQuarter"
                          : "revenueByYear"
                    ] ? (
                      Object.entries(
                        stats[
                          revenueFilter === "MONTH"
                            ? "revenueByMonth"
                            : revenueFilter === "QUARTER"
                              ? "revenueByQuarter"
                              : "revenueByYear"
                        ],
                      ).map(([key, value]) => (
                        <tr key={key}>
                          <td className="fw-medium">{key}</td>
                          <td className="text-end text-success fw-bold">
                            {value.toLocaleString()} VNĐ
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="2"
                          className="text-center text-muted small py-2"
                        >
                          Chưa có dữ liệu
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      <Tab.Container defaultActiveKey="lessons">
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white">
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="lessons">
                  <i className="fa-solid fa-book-open me-2"></i>Bài học (
                  {course.lessons?.length})
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="students">
                  <i className="fa-solid fa-users me-2"></i>Sinh viên (
                  {students.length})
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body className="p-4">
            <Tab.Content>
              <Tab.Pane eventKey="lessons">
                <div className="d-flex justify-content-between mb-3">
                  <h5 className="fw-bold">Danh sách bài giảng</h5>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setLessonEditMode(false);
                      setLessonData({ title: "", contentUrl: "" });
                      setShowLessonModal(true);
                    }}
                  >
                    <i className="fa-solid fa-plus me-1"></i> Thêm bài học
                  </Button>
                </div>
                <Table hover align="middle">
                  <thead>
                    <tr>
                      <th style={{ width: "50px" }}>#</th>
                      <th>Tiêu đề</th>
                      <th>Liên kết nội dung</th>
                      <th className="text-end">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {course.lessons.map((l, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td className="fw-bold">{l.title}</td>
                        <td
                          className="text-muted small text-truncate"
                          style={{ maxWidth: "300px" }}
                        >
                          {l.contentUrl}
                        </td>
                        <td className="text-end">
                          <Button
                            variant="outline-warning"
                            size="sm"
                            className="me-2"
                            onClick={() => {
                              setLessonEditMode(true);
                              setCurrentLessonId(l.id);
                              setLessonData({
                                title: l.title,
                                contentUrl: l.contentUrl,
                              });
                              setShowLessonModal(true);
                            }}
                          >
                            Sửa
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteLesson(l.id)}
                          >
                            Xóa
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Tab.Pane>

              <Tab.Pane eventKey="students">
                <div className="d-flex justify-content-between mb-3">
                  <h5 className="fw-bold">Sinh viên đang tham gia</h5>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => setShowStudentModal(true)}
                  >
                    <i className="fa-solid fa-user-plus me-1"></i> Thêm sinh
                    viên
                  </Button>
                </div>
                <Table hover align="middle">
                  <thead>
                    <tr>
                      <th>Avatar</th>
                      <th>Họ tên</th>
                      <th>Email</th>
                      <th>Tiến độ</th>
                      <th className="text-end">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, idx) => (
                      <tr key={idx}>
                        <td>
                          <img
                            src={s.avatar}
                            alt="avt"
                            width="40"
                            height="40"
                            className="rounded-circle border"
                          />
                        </td>
                        <td>
                          {s.lastName} {s.firstName}
                        </td>
                        <td className="text-muted">{s.email}</td>
                        <td style={{ width: "150px" }}>
                          <div className="small mb-1">{s.progress}%</div>
                          <div className="progress" style={{ height: "5px" }}>
                            <div
                              className="progress-bar bg-success"
                              style={{ width: `${s.progress}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="text-end">
                          <Button
                            variant="link"
                            className="text-primary me-2"
                            onClick={() =>
                              navigate(
                                `/teacher/courses/${id}/students/${s.id}`,
                              )
                            }
                          >
                            Chi tiết
                          </Button>
                          <Button
                            variant="link"
                            className="text-danger p-0"
                            onClick={() => handleRemoveStudent(s.id)}
                          >
                            Gỡ khỏi lớp
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Card>
      </Tab.Container>

      <Modal show={showLessonModal} onHide={() => setShowLessonModal(false)}>
        <Form onSubmit={handleSaveLesson}>
          <Modal.Header closeButton>
            <Modal.Title>
              {lessonEditMode ? "Sửa bài học" : "Thêm bài học mới"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Tiêu đề bài học</Form.Label>
              <Form.Control
                type="text"
                required
                value={lessonData.title}
                onChange={(e) =>
                  setLessonData({ ...lessonData, title: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                URL Video/Tài liệu (Youtube, Google Drive, v.v.)
              </Form.Label>
              <Form.Control
                type="url"
                required
                value={lessonData.contentUrl}
                onChange={(e) =>
                  setLessonData({ ...lessonData, contentUrl: e.target.value })
                }
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowLessonModal(false)}
            >
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              Lưu lại
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showStudentModal} onHide={() => setShowStudentModal(false)}>
        <Form onSubmit={handleAddStudent}>
          <Modal.Header closeButton>
            <Modal.Title>Thêm sinh viên vào khóa học</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Nhập Email sinh viên</Form.Label>
              <Form.Control
                type="email"
                required
                placeholder="sinhvien@example.com"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
              />
              <Form.Text className="text-muted">
                Sinh viên phải có tài khoản trên hệ thống.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowStudentModal(false)}
            >
              Đóng
            </Button>
            <Button variant="success" type="submit">
              Xác nhận thêm
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default TeacherCourseDetail;
