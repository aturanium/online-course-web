import React, { useContext, useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../configs/Context";

const Admin = () => {
  const [user] = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <Container className="mt-5 mb-5" style={{ minHeight: "70vh" }}>
      <div className="text-center mb-5">
        <h1 className="fw-bold text-primary">TỔNG HÀNH DINH ADMIN</h1>
        <p className="text-muted fs-5">
          Hệ thống quản trị trung tâm của Nền tảng học trực tuyến
        </p>
      </div>

      <Row className="g-4 justify-content-center">
        <Col md={4}>
          <Card
            className="h-100 text-center shadow-sm border-0 py-4 hover-effect cursor-pointer"
            onClick={() => navigate("/admin/users")}
            style={{ cursor: "pointer", transition: "transform 0.2s" }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "translateY(-5px)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <Card.Body>
              <div className="mb-3">
                <i className="fa-solid fa-users-gear display-1 text-primary"></i>
              </div>
              <Card.Title className="fw-bold fs-4">
                Quản lý người dùng
              </Card.Title>
              <Card.Text className="text-muted">
                Duyệt giảng viên, phân quyền, quản lý tài khoản và reset mật
                khẩu.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card
            className="h-100 text-center shadow-sm border-0 py-4 hover-effect cursor-pointer"
            onClick={() => navigate("/admin/courses")}
            style={{ cursor: "pointer", transition: "transform 0.2s" }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "translateY(-5px)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <Card.Body>
              <div className="mb-3">
                <i className="fa-solid fa-photo-film display-1 text-success"></i>
              </div>
              <Card.Title className="fw-bold fs-4">Quản lý khóa học</Card.Title>
              <Card.Text className="text-muted">
                Duyệt xuất bản khóa học mới, thêm chủ đề (Category), xóa nội
                dung rác.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card
            className="h-100 text-center shadow-sm border-0 py-4 hover-effect cursor-pointer"
            onClick={() => navigate("/admin/statistic")}
            style={{ cursor: "pointer", transition: "transform 0.2s" }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "translateY(-5px)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <Card.Body>
              <div className="mb-3">
                <i className="fa-solid fa-chart-pie display-1 text-warning"></i>
              </div>
              <Card.Title className="fw-bold fs-4">Báo cáo Thống kê</Card.Title>
              <Card.Text className="text-muted">
                Theo dõi tổng doanh thu, tần suất đăng ký và hiệu suất từng khóa
                học.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Admin;
