import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  ListGroup,
  Ratio,
  Nav,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import { authApi, endpoints } from "../../configs/Apis";
import { UserContext } from "../../configs/Context";
import Spinner from "../../components/Spinner";
import Swal from "sweetalert2";

const CourseDetail = () => {
  const { id } = useParams();
  const [user] = useContext(UserContext);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState("lessons");

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setLoading(true);
        const res = await authApi().get(endpoints["courseDetail"](id));
        setCourse(res.data);

        if (user?.role === "ADMIN") {
          const studentRes = await authApi().get(`/courses/${id}/students`);
          setStudents(studentRes.data);
        }
      } catch (error) {
        console.error("Lỗi lấy chi tiết khóa học:", error);
        Swal.fire("Lỗi", "Không thể tải thông tin khóa học", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [id, user]);

  const addToCart = async () => {
    try {
      await authApi().post(`/cart?courseId=${id}`);
      Swal.fire({
        icon: "success",
        title: "Đã thêm vào giỏ",
        text: "Vào giỏ hàng để thanh toán.",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data || "Không thể thêm vào giỏ hàng!";
      Swal.fire("Thông báo", errorMsg, "info");
    }
  };

  const handleLearnLesson = async (lessonId, url) => {
    window.open(url, "_blank");

    if (user?.role === "STUDENT") {
      try {
        await authApi().post(endpoints["completeLesson"](lessonId));
      } catch (error) {
        console.error("Lỗi cập nhật tiến độ:", error);
      }
    }
  };

  if (loading) return <Spinner />;

  const isAdmin = user?.role === "ADMIN";
  const isJoined = course.isJoined || isAdmin;
  const hasLessons = course.lessons && course.lessons.length > 0;

  return (
    <Container className="mt-4 mb-5">
      <Row className="g-4">
        <Col md={8}>
          <Card className="border-0 shadow-sm mb-4 overflow-hidden">
            {course.videoIntro ? (
              <Ratio aspectRatio="16x9">
                <video
                  controls
                  src={course.videoIntro}
                  style={{ width: "100%", backgroundColor: "#000" }}
                ></video>
              </Ratio>
            ) : (
              <div
                className="bg-secondary text-white d-flex justify-content-center align-items-center"
                style={{ height: "400px" }}
              >
                <h5>Chưa có video giới thiệu</h5>
              </div>
            )}
          </Card>

          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <h4 className="fw-bold mb-3">Mô tả khóa học</h4>
              <Card.Text style={{ whiteSpace: "pre-line", lineHeight: "1.8" }}>
                {course.description || "Chưa có mô tả."}
              </Card.Text>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              {isAdmin && (
                <Nav
                  variant="tabs"
                  className="mb-4"
                  activeKey={activeTab}
                  onSelect={(key) => setActiveTab(key)}
                  style={{ cursor: "pointer" }}
                >
                  <Nav.Item>
                    <Nav.Link eventKey="lessons" className="fw-bold">
                      Bài học {hasLessons ? `(${course.lessons.length})` : ""}
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="students" className="fw-bold">
                      Sinh viên tham gia{" "}
                      {students?.length > 0 ? `(${students.length})` : ""}
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              )}
              {(!isAdmin || activeTab === "lessons") && (
                <>
                  {!isAdmin && (
                    <h4 className="fw-bold mb-3">Nội dung khóa học</h4>
                  )}

                  {isJoined ? (
                    hasLessons ? (
                      <ListGroup variant="flush">
                        {course.lessons.map((lesson, idx) => (
                          <ListGroup.Item
                            key={idx}
                            className="d-flex justify-content-between align-items-center py-3 px-0 border-bottom"
                          >
                            <div className="d-flex align-items-center">
                              <div
                                className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center me-3 shadow-sm"
                                style={{ width: "35px", height: "35px" }}
                              >
                                {idx + 1}
                              </div>
                              <span className="fw-medium">{lesson.title}</span>
                            </div>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="px-3 rounded-pill"
                              onClick={() =>
                                handleLearnLesson(lesson.id, lesson.contentUrl)
                              }
                            >
                              Xem
                            </Button>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    ) : (
                      <div className="text-center py-5 bg-light rounded">
                        <h5 className="text-muted">
                          Khóa học này chưa có bài giảng nào.
                        </h5>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-5 bg-light rounded">
                      <h5>Nội dung khóa học đã bị khóa</h5>
                      <p className="text-muted">
                        Đăng ký khóa học để xem các bài giảng.
                      </p>
                    </div>
                  )}
                </>
              )}

              {isAdmin && activeTab === "students" && (
                <>
                  {students?.length > 0 ? (
                    <ListGroup variant="flush">
                      {students.map((student, idx) => (
                        <ListGroup.Item
                          key={idx}
                          className="d-flex align-items-center py-3 px-0 border-bottom"
                        >
                          <img
                            src={student.avatar}
                            alt="avt"
                            width="40"
                            height="40"
                            className="rounded-circle border m-2"
                          />
                          <div>
                            <h6 className="mb-1 fw-bold">
                              {student.lastName} {student.firstName}
                            </h6>
                            <div className="text-muted small">
                              {student.email}
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <div className="text-center py-5 bg-light rounded">
                      <h5 className="text-muted">
                        Chưa có sinh viên nào tham gia khóa học này.
                      </h5>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card
            className="border-0 shadow-sm sticky-top"
            style={{ top: "80px", zIndex: 1 }}
          >
            <Card.Body className="p-4">
              <Badge bg="info" className="mb-3 px-3 py-2 fs-6 rounded-pill">
                {course.categoryName}
              </Badge>
              <h3 className="fw-bold mb-3 lh-base">{course.name}</h3>

              <div className="d-flex align-items-center mb-4 text-muted">
                <span className="fs-6 fw-medium">{course.teacherName}</span>
              </div>

              <div className="d-flex justify-content-between mb-3 pb-3">
                <span className="text-muted">Thời lượng:</span>
                <span className="fw-bold">{course.duration} giờ</span>
              </div>

              {(!course.isJoined || isAdmin) && (
                <div className="text-center mb-4 mt-3">
                  <span className="text-muted small d-block mb-1">
                    Giá khóa học
                  </span>
                  <h2 className="text-danger fw-bold mb-0">
                    {course.price
                      ? course.price.toLocaleString() + " VNĐ"
                      : "Miễn phí"}
                  </h2>
                </div>
              )}

              {isAdmin
                ? null
                : !isJoined && (
                    <div className="d-grid gap-2">
                      <Button
                        variant="primary"
                        size="lg"
                        className="fw-bold"
                        onClick={addToCart}
                      >
                        Thêm vào giỏ hàng
                      </Button>
                    </div>
                  )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CourseDetail;
