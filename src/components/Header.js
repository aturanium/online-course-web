import React, { useContext } from "react";
import { Navbar, Nav, Container, NavDropdown, Image } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../configs/Context";

const Header = () => {
  const [user, dispatch] = useContext(UserContext);
  const navigate = useNavigate();

  const logout = () => {
    dispatch({ type: "LOGOUT" });
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Navbar
      bg="dark"
      variant="dark"
      expand="lg"
      sticky="top"
      className="shadow-sm"
    >
      <Container>
        <Navbar.Brand as={Link} to="/">
          Online Course
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {user && user.role === "STUDENT" && (
              <>
                <Nav.Link as={Link} to="/courses">
                  Khám phá khóa học
                </Nav.Link>
                {user && (
                  <Nav.Link as={Link} to="/my-courses">
                    Khóa học của tôi
                  </Nav.Link>
                )}
              </>
            )}

            {user && user.role === "TEACHER" && (
              <Nav.Link as={Link} to="/teacher/courses">
                Quản lý khóa học
              </Nav.Link>
            )}

            {user && user.role === "ADMIN" && (
              <Nav.Link as={Link} to="/admin">
                Trang quản trị
              </Nav.Link>
            )}
          </Nav>

          <Nav>
            {user === null ? (
              <>
                <Link to="/login" className="btn btn-outline-light me-2">
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Đăng ký
                </Link>
              </>
            ) : (
              <div className="d-flex align-items-center">
                {user.role === "STUDENT" && (
                  <Link to="/cart" className="btn btn-warning me-3 fw-bold">
                    Giỏ hàng
                  </Link>
                )}

                {user.role !== "ADMIN" && (
                  <Link
                    to="/chat"
                    className="btn btn-info me-3 text-white fw-bold"
                  >
                    Chat
                  </Link>
                )}

                <Image
                  src={user.avatar}
                  roundedCircle
                  width="40"
                  height="40"
                  className="me-2"
                  style={{ objectFit: "cover" }}
                />
                <NavDropdown
                  title={user.lastName + " " + user.firstName}
                  id="basic-nav-dropdown"
                  align="end"
                >
                  <NavDropdown.Item as={Link} to="/me">
                    Thông tin cá nhân
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logout} className="text-danger">
                    Đăng xuất
                  </NavDropdown.Item>
                </NavDropdown>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
