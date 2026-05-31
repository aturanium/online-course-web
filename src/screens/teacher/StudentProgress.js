import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Button,
  ProgressBar,
  Badge,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { authApi, endpoints } from "../../configs/Apis";
import { UserContext } from "../../configs/Context";
import Spinner from "../../components/Spinner";
import Swal from "sweetalert2";

const StudentProgress = () => {
  const { id: courseId, studentId } = useParams();
  const navigate = useNavigate();
  const [user] = useContext(UserContext);

  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authApi().get(
        endpoints["studentProgress"](courseId, studentId),
      );
      setProgress(res.data);
    } catch (error) {
      console.error(error);
      Swal.fire("Lỗi", "Không thể tải tiến độ sinh viên", "error");
    } finally {
      setLoading(false);
    }
  }, [courseId, studentId]);

  useEffect(() => {
    if (!user || user.role !== "TEACHER") {
      navigate("/login");
      return;
    }
    fetchProgress();
  }, [user, navigate, fetchProgress]);

  if (loading) return <Spinner />;
  if (!progress)
    return <h4 className="text-center mt-5">Không tìm thấy dữ liệu!</h4>;

  return (
    <Container className="mt-4 mb-5">
      <Button
        variant="outline-secondary"
        className="mb-4"
        onClick={() => navigate(`/teacher/courses/${courseId}`)}
      >
        Quay lại khóa học
      </Button>

      <Row className="g-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm text-center p-4">
            <div className="mb-3">
              <img
                src={progress.avatar}
                alt="avatar"
                className="rounded-circle border p-1"
                style={{ width: "120px", height: "120px", objectFit: "cover" }}
              />
            </div>
            <h4 className="fw-bold mb-1">
              {progress.lastName} {progress.firstName}
            </h4>
            <p className="text-muted mb-3">{progress.email}</p>
            <Badge
              bg={progress.status === "COMPLETED" ? "success" : "primary"}
              className="mb-3 px-3 py-2"
            >
              {progress.status === "COMPLETED" ? "Đã hoàn thành" : "Đang học"}
            </Badge>

            <div className="d-flex justify-content-between border-top pt-3">
              <span className="text-muted">Ngày tham gia:</span>
              <span className="fw-medium">{progress.enrolledAt}</span>
            </div>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="border-0 shadow-sm p-4 h-100">
            <h4 className="fw-bold mb-4">Tiến độ học tập</h4>

            <div className="mb-5">
              <div className="d-flex justify-content-between mb-2">
                <span className="fw-bold fs-5">Mức độ hoàn thành</span>
                <span className="fw-bold fs-5 text-primary">
                  {progress.progressPercentage}%
                </span>
              </div>
              <ProgressBar
                now={progress.progressPercentage}
                variant={
                  progress.progressPercentage === 100 ? "success" : "primary"
                }
                style={{ height: "15px" }}
                animated
              />
            </div>

            <Row className="g-3">
              <Col sm={6}>
                <Card className="bg-light border-0 p-3 text-center">
                  <div className="text-muted mb-1">Số bài đã học</div>
                  <div className="display-6 fw-bold text-dark">
                    {progress.completedLessons}
                  </div>
                </Card>
              </Col>
              <Col sm={6}>
                <Card className="bg-light border-0 p-3 text-center">
                  <div className="text-muted mb-1">Tổng số bài học</div>
                  <div className="display-6 fw-bold text-dark">
                    {progress.totalLessons}
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentProgress;
