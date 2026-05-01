import React from "react";
import { Container } from "react-bootstrap";

const Spinner = () => {
  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "50vh" }}
    >
      <img
        src="/spinner.svg"
        alt="Đang tải dữ liệu..."
        style={{ width: "80px", height: "80px" }}
      />
    </Container>
  );
};

export default Spinner;
