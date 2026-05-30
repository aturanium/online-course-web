import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { authApi, endpoints } from "../../configs/Apis";
import { UserContext } from "../../configs/Context";
import Spinner from "../../components/Spinner";
import Swal from "sweetalert2";

const MyCourses = () => {
  const [user] = useContext(UserContext);
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [suggestedCourses, setSuggestedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "STUDENT") {
      navigate("/login");
      return;
    }

    const fetchMyCourses = async () => {
      try {
        setLoading(true);
        const [myRes, allRes] = await Promise.all([
          authApi().get(endpoints["myCourses"]),
          authApi().get("/courses"),
        ]);

        const myCoursesData = myRes.data;
        const allCoursesData = allRes.data;
        setCourses(myCoursesData);
        const myCourseIds = myCoursesData.map((c) => c.id);
        const availableCourses = allCoursesData.filter(
          (c) => c.status === "ACTIVE" && !myCourseIds.includes(c.id),
        );

        let finalSuggestions = [];

        if (myCourseIds.length === 0) {
          finalSuggestions = availableCourses;
        } else {
          const ownedFullDetails = allCoursesData.filter((c) =>
            myCourseIds.includes(c.id),
          );
          const ownedCategories = new Set(
            ownedFullDetails.map((c) => c.categoryId),
          );
          const ownedTeachers = new Set(
            ownedFullDetails.map((c) => c.teacherName),
          );
          const ownedDurations = new Set(
            ownedFullDetails.map((c) => c.duration),
          );
          const ownedPrices = new Set(ownedFullDetails.map((c) => c.price));

          availableCourses.forEach((c) => {
            let score = 0;
            if (ownedCategories.has(c.categoryId)) score += 1;
            if (ownedTeachers.has(c.teacherName)) score += 1;
            if (ownedDurations.has(c.duration)) score += 1;
            if (ownedPrices.has(c.price)) score += 1;

            c.matchScore = score;
          });

          let matchedCourses = availableCourses.filter((c) => c.matchScore > 0);
          matchedCourses.sort((a, b) => b.matchScore - a.matchScore);
          finalSuggestions =
            matchedCourses.length > 0 ? matchedCourses : availableCourses;
        }

        setSuggestedCourses(finalSuggestions.slice(0, 4));
      } catch (error) {
        console.error("Lỗi lấy danh sách khóa học của tôi:", error);
        Swal.fire("Lỗi", "Không thể tải danh sách khóa học", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, [user, navigate]);

  if (loading) return <Spinner />;

  return (
    <Container className="mt-4 mb-5" style={{ minHeight: "70vh" }}>
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <h2 className="fw-bold mb-0">Không Gian Học Tập</h2>
        <Badge bg="primary" className="fs-6 px-3 py-2">
          Đang tham gia: {courses.length} khóa học
        </Badge>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-5 bg-light rounded-4 border">
          <i className="fa-solid fa-graduation-cap display-1 text-muted mb-3 opacity-25"></i>
          <h4 className="text-secondary mb-3">
            Bạn chưa tham gia khóa học nào
          </h4>
          <p className="text-muted mb-4">
            Hãy bắt đầu hành trình học tập của bạn ngay hôm nay!
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate("/courses")}
          >
            <i className="fa-solid fa-magnifying-glass me-2"></i> Khám phá khóa
            học
          </Button>
        </div>
      ) : (
        <Row className="g-4">
          {courses.map((c) => (
            <Col md={4} sm={6} key={c.id}>
              <Card className="h-100 shadow-sm border-0 hover-effect transition-all">
                <div
                  style={{
                    height: "180px",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <Card.Img
                    variant="top"
                    src={c.image}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>

                <Card.Body className="d-flex flex-column">
                  <Card.Title
                    className="fw-bold mb-2"
                    style={{ fontSize: "1.1rem" }}
                  >
                    {c.name}
                  </Card.Title>

                  <Card.Text className="text-muted small mb-3">
                    <i className="fa-solid fa-chalkboard-user me-2"></i>{" "}
                    {c.teacherName}
                    <span className="mx-2">|</span>
                    <i className="fa-regular fa-clock me-1"></i> {c.duration}{" "}
                    giờ
                  </Card.Text>

                  <div className="mt-auto">
                    <Button
                      variant="primary"
                      className="w-100 fw-bold"
                      onClick={() => navigate(`/course/${c.id}`)}
                    >
                      <i className="fa-solid fa-circle-play me-2"></i> Vào học
                      ngay
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      {suggestedCourses.length > 0 && (
        <div className="mt-5 pt-4 border-top">
          <h3 className="fw-bold mb-4">Gợi ý dành cho bạn</h3>
          <Row className="g-4">
            {suggestedCourses.map((c) => (
              <Col md={3} sm={6} key={c.id}>
                <Card className="h-100 shadow-sm border-0 hover-effect">
                  <Card.Img
                    variant="top"
                    src={c.image}
                    style={{ height: "140px", objectFit: "cover" }}
                  />
                  <Card.Body className="d-flex flex-column p-3">
                    <Card.Title className="fw-bold fs-6 mb-2 text-truncate">
                      {c.name}
                    </Card.Title>
                    <Card.Text className="text-muted small mb-2">
                      <i className="fa-solid fa-chalkboard-user me-1"></i>{" "}
                      {c.teacherName}
                    </Card.Text>
                    <div className="mt-auto d-flex justify-content-between align-items-center">
                      <span className="text-danger fw-bold">
                        {c.price?.toLocaleString()} đ
                      </span>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/course/${c.id}`)}
                      >
                        Xem
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </Container>
  );
};

export default MyCourses;
