import React, { useState, useEffect, useContext, useCallback } from "react";
import { Container, Card, Row, Col, Table, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { authApi, endpoints } from "../../configs/Apis";
import { UserContext } from "../../configs/Context";
import Spinner from "../../components/Spinner";
import Swal from "sweetalert2";

const AdminStatistic = () => {
  const [user] = useContext(UserContext);
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);
  const [courseStats, setCourseStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const [overviewRes, coursesRes] = await Promise.all([
        authApi().get(endpoints["statOverview"]),
        authApi().get(endpoints["statCourses"]),
      ]);
      setOverview(overviewRes.data);
      setCourseStats(coursesRes.data);
    } catch (error) {
      Swal.fire("Lỗi", "Không thể tải dữ liệu thống kê", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/login");
      return;
    }
    fetchStats();
  }, [user, navigate, fetchStats]);

  if (loading || !overview) return <Spinner />;

  return (
    <Container className="mt-4 mb-5">
      <h2 className="fw-bold mb-4 border-bottom pb-3">Báo cáo Thống kê</h2>

      <Row className="g-4 mb-5">
        <Col md={4}>
          <Card className="border-0 shadow-sm bg-primary text-white h-100 p-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="fs-5 mb-2">Số khóa học đang hoạt động</div>
                  <div className="display-4 fw-bold">
                    {overview.totalActiveCourses}
                  </div>
                </div>
                <i className="fa-solid fa-book-open display-3 opacity-50"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm bg-success text-white h-100 p-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="fs-5 mb-2">Tổng số sinh viên</div>
                  <div className="display-4 fw-bold">
                    {overview.totalStudents}
                  </div>
                </div>
                <i className="fa-solid fa-users display-3 opacity-50"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm bg-warning text-dark h-100 p-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="fs-5 mb-2">Tổng doanh thu</div>
                  <div className="fs-2 fw-bold">
                    {overview.totalRevenue?.toLocaleString()} đ
                  </div>
                </div>
                <i className="fa-solid fa-sack-dollar display-3 opacity-50"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white py-3">
          <h5 className="fw-bold mb-0">Hiệu suất khóa học</h5>
        </Card.Header>
        <Card.Body className="p-0 table-responsive">
          <Table hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4 py-3">Tên khóa học</th>
                <th className="py-3">Giảng viên</th>
                <th className="py-3 text-center">Số sinh viên tham gia</th>
                <th className="py-3 text-center">Tần suất đăng ký</th>
                <th className="py-3 text-end pe-4">Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {courseStats.map((cs, idx) => (
                <tr key={idx}>
                  <td className="ps-4 fw-bold">{cs.courseName}</td>
                  <td className="text-muted">{cs.teacherName}</td>
                  <td className="text-center">{cs.enrolledStudents}</td>
                  <td className="text-center">
                    <Badge bg="info">
                      {(cs.enrollmentFrequency * 100).toFixed(1)}%
                    </Badge>
                  </td>
                  <td className="text-end pe-4 fw-bold text-success">
                    {cs.totalRevenue?.toLocaleString()} VNĐ
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};
export default AdminStatistic;
