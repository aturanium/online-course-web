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
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { authApi, endpoints } from "../../configs/Apis";
import { UserContext } from "../../configs/Context";
import Spinner from "../../components/Spinner";
import Swal from "sweetalert2";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user] = useContext(UserContext);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setLoading(true);
        const res = await authApi().get(endpoints["courseDetail"](id));
        setCourse(res.data);
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
    if (!user) {
      Swal.fire({
        icon: "warning",
        title: "Yêu cầu đăng nhập",
        text: "Bạn cần đăng nhập để thêm khóa học vào giỏ hàng.",
        confirmButtonText: "Đến trang Đăng nhập",
        showCancelButton: true,
        cancelButtonText: "Hủy",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
      return;
    }

    try {
      await authApi().post(`/cart?courseId=${id}`);
      Swal.fire({
        icon: "success",
        title: "Đã thêm vào giỏ",
        text: "Bạn có thể vào Giỏ hàng để thanh toán.",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error(error);
      const errorMsg =
        error.response?.data || "Không thể thêm vào giỏ hàng lúc này!";
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
  if (!course)
    return <h3 className="text-center mt-5">Khóa học không tồn tại!</h3>;

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
                >
                  Trình duyệt của bạn không hỗ trợ thẻ video.
                </video>
              </Ratio>
            ) : (
              <div
                className="bg-secondary text-white d-flex justify-content-center align-items-center"
                style={{ height: "400px" }}
              >
                <i className="fa-solid fa-video-slash display-1 mb-3"></i>
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
              <h4 className="fw-bold mb-3">Nội dung khóa học</h4>

              {isJoined ? (
                hasLessons ? (
                  <ListGroup variant="flush">
                    {course.lessons.map((lesson, idx) => (
                      <ListGroup.Item
                        key={idx}
                        className="d-flex justify-content-between align-items-center py-3"
                      >
                        <div className="d-flex align-items-center">
                          <div
                            className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center me-3"
                            style={{ width: "35px", height: "35px" }}
                          >
                            {idx + 1}
                          </div>
                          <span className="fw-medium">{lesson.title}</span>
                        </div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() =>
                            handleLearnLesson(lesson.id, lesson.contentUrl)
                          }
                          target="_blank"
                        >
                          <i className="fa-solid fa-play me-2"></i> Học ngay
                        </Button>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <div className="text-center py-5 bg-light rounded">
                    <i className="fa-solid fa-folder-open display-4 text-muted mb-3"></i>
                    <h5 className="text-muted">
                      Khóa học này chưa có bài giảng nào.
                    </h5>
                  </div>
                )
              ) : (
                <div className="text-center py-5 bg-light rounded">
                  <i className="fa-solid fa-lock display-4 text-muted mb-3"></i>
                  <h5>Nội dung khóa học đã bị khóa</h5>
                  <p className="text-muted">
                    Vui lòng đăng ký khóa học để xem các bài giảng.
                  </p>
                </div>
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
              <Badge bg="info" className="mb-2 fs-6">
                {course.categoryName}
              </Badge>
              <h3 className="fw-bold mb-3">{course.name}</h3>

              <div className="d-flex align-items-center mb-4">
                <i className="fa-solid fa-chalkboard-user text-primary fs-5 me-2"></i>
                <span className="fs-5 fw-medium">{course.teacherName}</span>
              </div>

              <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                <span className="text-muted">
                  <i className="fa-regular fa-clock me-2"></i>Thời lượng:
                </span>
                <span className="fw-bold">{course.duration} giờ</span>
              </div>

              <h2 className="text-danger fw-bold text-center mb-4">
                {course.price
                  ? course.price.toLocaleString() + " VNĐ"
                  : "Miễn phí"}
              </h2>

              {isAdmin ? null : !isJoined ? (
                <div className="d-grid gap-2">
                  <Button variant="primary" size="lg" onClick={addToCart}>
                    <i className="fa-solid fa-cart-shopping me-2"></i> Thêm vào
                    giỏ hàng
                  </Button>
                </div>
              ) : (
                <div className="d-grid gap-2">
                  {user?.role === "TEACHER" && (
                    <Button
                      variant="outline-primary"
                      onClick={() => navigate(`/teacher/courses/${id}`)}
                    >
                      Quản lý khóa học này
                    </Button>
                  )}
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
