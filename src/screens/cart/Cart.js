import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Image,
  ListGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { authApi, endpoints } from "../../configs/Apis";
import { UserContext } from "../../configs/Context";
import Spinner from "../../components/Spinner";
import Swal from "sweetalert2";

const Cart = () => {
  const [user] = useContext(UserContext);
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("PAYPAL");

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await authApi().get(endpoints["cart"]);
      setCartItems(res.data.items || []);
      setTotalPrice(res.data.totalPrice || 0);
    } catch (error) {
      console.error("Lỗi lấy giỏ hàng:", error);
      Swal.fire("Lỗi", "Không thể tải giỏ hàng", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchCart();
  }, [user, navigate]);

  const handleRemoveItem = async (courseId) => {
    const confirm = await Swal.fire({
      title: "Xác nhận xóa?",
      text: "Bạn có chắc muốn bỏ khóa học này ra khỏi giỏ hàng?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (confirm.isConfirmed) {
      try {
        await authApi().delete(endpoints["removeFromCart"](courseId));
        fetchCart();
      } catch (error) {
        Swal.fire("Lỗi", "Không thể xóa khóa học", "error");
      }
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    try {
      setProcessing(true);

      localStorage.setItem("pendingMethod", paymentMethod);

      const createRes = await authApi().post(endpoints["createPayment"], {
        paymentMethod: paymentMethod,
      });

      const data =
        typeof createRes.data === "string"
          ? JSON.parse(createRes.data)
          : createRes.data;
      const { checkoutUrl, isFree } = data;

      if (isFree) {
        Swal.fire({
          icon: "success",
          title: "Đăng ký thành công!",
          text: "Khóa học này miễn phí!",
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/my-courses");
        });
        return;
      }

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        Swal.fire(
          "Lỗi",
          "Không nhận được đường dẫn thanh toán từ Server",
          "error",
        );
        setProcessing(false);
      }
    } catch (error) {
      Swal.fire("Lỗi", "Khởi tạo giao dịch thất bại", "error");
      setProcessing(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <Container className="mt-4 mb-5">
      <h2 className="fw-bold mb-4">Giỏ hàng của bạn</h2>

      <Row className="g-4">
        <Col md={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              {cartItems.length === 0 ? (
                <div className="text-center py-5">
                  <h5>Giỏ hàng của bạn đang trống!</h5>
                  <Button
                    variant="outline-primary"
                    className="mt-3"
                    onClick={() => navigate("/courses")}
                  >
                    Khám phá khóa học
                  </Button>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {cartItems.map((item, idx) => (
                    <ListGroup.Item key={idx} className="p-4 border-bottom">
                      <Row className="align-items-center">
                        <Col sm={3} className="mb-3 mb-sm-0">
                          <Image
                            src={item.image}
                            rounded
                            fluid
                            style={{
                              objectFit: "cover",
                              height: "100px",
                              width: "100%",
                            }}
                          />
                        </Col>
                        <Col sm={5}>
                          <h5
                            className="fw-bold text-truncate cursor-pointer hover-text-primary"
                            onClick={() => navigate(`/course/${item.courseId}`)}
                          >
                            {item.courseName}
                          </h5>
                          <div className="text-muted small">
                            {item.teacherName}
                          </div>
                        </Col>
                        <Col
                          sm={3}
                          className="text-sm-end text-danger fw-bold fs-5"
                        >
                          {item.price.toLocaleString() + " VNĐ"}
                        </Col>
                        <Col sm={1} className="text-end">
                          <Button
                            variant="light"
                            className="text-danger p-0"
                            onClick={() => handleRemoveItem(item.courseId)}
                          >
                            Xóa
                          </Button>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
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
              <h4 className="fw-bold border-bottom pb-3 mb-3">Tổng đơn hàng</h4>

              <div className="d-flex justify-content-between mb-4">
                <span className="text-muted fs-5">Thành tiền:</span>
                <span className="fw-bold fs-4 text-danger">
                  {totalPrice.toLocaleString()} VNĐ
                </span>
              </div>

              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">
                  Phương thức thanh toán
                </Form.Label>
                <Form.Select
                  className="border-primary"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={cartItems.length === 0 || processing}
                >
                  <option value="PAYPAL">PayPal</option>
                  <option value="VNPAY">VNPay</option>
                  <option value="STRIPE">Stripe</option>
                  <option value="MOMO">MoMo</option>
                  <option value="ZALOPAY">ZaloPay</option>
                </Form.Select>
              </Form.Group>

              <div className="d-grid">
                {processing ? (
                  <Spinner
                    as="span"
                    size="sm"
                    animation="border"
                    className="me-2"
                  />
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    disabled={cartItems.length === 0 || processing}
                    onClick={handleCheckout}
                  >
                    Thanh toán
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;
