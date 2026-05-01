import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup,
  Badge,
} from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi, endpoints } from "../../configs/Apis";
import Spinner from "../../components/Spinner";
import Swal from "sweetalert2";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const kw = searchParams.get("keyword") || "";
  const sortByPrice = searchParams.get("sortByPrice") || "";
  const sortByName = searchParams.get("sortByName") || "";

  const page = parseInt(searchParams.get("page"));

  const [searchInput, setSearchInput] = useState(kw);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authApi().get(endpoints["courses"], {
        params: {
          page: page || null,
          keyword: kw || null,
          sortByPrice: sortByPrice || null,
          sortByName: sortByName || null,
        },
      });
      setCourses(res.data);
    } catch (error) {
      Swal.fire("Lỗi", "Không thể tải danh sách khóa học", "error");
    } finally {
      setLoading(false);
    }
  }, [kw, sortByPrice, sortByName, page]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput) {
      searchParams.set("keyword", searchInput);
    } else {
      searchParams.delete("keyword");
    }

    searchParams.set("page", 1);
    setSearchParams(searchParams);
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    searchParams.delete("sortByPrice");
    searchParams.delete("sortByName");

    if (val === "price_asc") searchParams.set("sortByPrice", "ASC");
    if (val === "price_desc") searchParams.set("sortByPrice", "DESC");
    if (val === "name_asc") searchParams.set("sortByName", "ASC");
    if (val === "name_desc") searchParams.set("sortByName", "DESC");

    searchParams.set("page", 1);
    setSearchParams(searchParams);
  };

  const handlePageChange = (newPage) => {
    searchParams.set("page", newPage);
    setSearchParams(searchParams);
    window.scrollTo(0, 0);
  };

  const addToCart = async (course) => {
    try {
      await authApi().post(`/cart?courseId=${course.id}`);

      Swal.fire({
        icon: "success",
        title: "Thành công",
        text: "Đã thêm khóa học vào giỏ!",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      Swal.fire(
        "Thông báo",
        error.response?.data ||
          "Khóa học này đã có trong giỏ hàng hoặc có lỗi xảy ra!",
        "info",
      );
    }
  };

  return (
    <Container className="mt-4 mb-5">
      <h2 className="fw-bold mb-4">Khám phá Khóa học</h2>

      <Card className="border-0 shadow-sm mb-4 p-3 bg-light">
        <Row className="g-3">
          <Col md={8}>
            <Form onSubmit={handleSearch}>
              <InputGroup>
                <Form.Control
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="border-primary"
                  placeholder="Nhập tên khóa học hoặc giảng viên..."
                />
                <Button variant="primary" type="submit">
                  <i className="fa-solid fa-magnifying-glass me-2"></i>Tìm kiếm
                </Button>
              </InputGroup>
            </Form>
          </Col>
          <Col md={4}>
            <Form.Select
              className="border-primary"
              onChange={handleSortChange}
              defaultValue={() => {
                if (sortByPrice === "ASC") return "price_asc";
                if (sortByPrice === "DESC") return "price_desc";
                if (sortByName === "ASC") return "name_asc";
                if (sortByName === "DESC") return "name_desc";
                return "default";
              }}
            >
              <option value="default">Sắp xếp: Mặc định</option>
              <option value="price_asc">Giá: Thấp đến Cao</option>
              <option value="price_desc">Giá: Cao đến Thấp</option>
              <option value="name_asc">Tên: A - Z</option>
              <option value="name_desc">Tên: Z - A</option>
            </Form.Select>
          </Col>
        </Row>
      </Card>

      {loading ? (
        <Spinner />
      ) : (
        <>
          {courses.length === 0 ? (
            <div className="text-center mt-5 text-muted">
              <i className="fa-solid fa-box-open display-1 opacity-25 mb-3"></i>
              {page > 1 ? (
                <>
                  <h4>Bạn đã xem hết danh sách khóa học!</h4>
                  <Button
                    variant="outline-primary"
                    className="mt-3 px-4"
                    onClick={() => handlePageChange(page - 1)}
                  >
                    <i className="fa-solid fa-arrow-left me-2"></i> Quay lại
                    trang trước
                  </Button>
                </>
              ) : (
                <h4>Không tìm thấy khóa học nào phù hợp!</h4>
              )}
            </div>
          ) : (
            <>
              <Row className="g-4">
                {courses.map((c) => (
                  <Col md={4} sm={6} key={c.id}>
                    <Card className="h-100 shadow-sm border-0 hover-effect transition-all">
                      <div style={{ height: "180px", overflow: "hidden" }}>
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
                        <div className="mb-2">
                          <Badge bg="info" className="me-2">
                            Thời lượng: {c.duration} giờ
                          </Badge>
                        </div>

                        <Card.Title
                          className="fw-bold"
                          style={{ fontSize: "1.1rem" }}
                        >
                          {c.name}
                        </Card.Title>

                        <Card.Text className="text-muted small mb-3">
                          <i className="fa-solid fa-chalkboard-user me-2"></i>
                          Giảng viên: {c.teacherName}
                        </Card.Text>

                        <div className="mt-auto">
                          <h5 className="text-danger fw-bold mb-3">
                            {c.price.toLocaleString() + " VNĐ"}
                          </h5>
                          <div className="d-grid gap-2">
                            <Button
                              variant="outline-primary"
                              onClick={() => navigate(`/course/${c.id}`)}
                            >
                              Xem chi tiết
                            </Button>
                            <Button
                              variant="primary"
                              onClick={() => addToCart(c)}
                            >
                              <i className="fa-solid fa-cart-plus me-2"></i>Thêm
                              vào giỏ
                            </Button>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              <div className="d-flex justify-content-center mt-5">
                <Button
                  variant="outline-primary"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="px-4"
                >
                  <i className="fa-solid fa-chevron-left me-2"></i> Trang trước
                </Button>

                <span className="mx-4 fw-bold align-self-center fs-5 text-primary">
                  Trang {page}
                </span>

                <Button
                  variant="outline-primary"
                  disabled={courses.length < 20}
                  onClick={() => handlePageChange(page + 1)}
                  className="px-4"
                >
                  Trang sau <i className="fa-solid fa-chevron-right ms-2"></i>
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default Courses;
