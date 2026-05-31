import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../../configs/Apis";
import Spinner from "../../components/Spinner";
import Swal from "sweetalert2";

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processPayment = async () => {
      const method = localStorage.getItem("pendingMethod") || "VNPAY";
      const vnp_ResponseCode = (
        searchParams.get("vnp_ResponseCode") || ""
      ).trim();
      const vnp_TransactionNo = searchParams.get("vnp_TransactionNo");
      const paymentId = searchParams.get("paymentId");
      const statusParam = (searchParams.get("status") || "").trim();
      const isSuccess =
        vnp_ResponseCode === "00" || (statusParam === "success" && paymentId);
      const gatewayTxnId =
        vnp_TransactionNo || paymentId || "TXN-" + Date.now();

      try {
        if (isSuccess) {
          await authApi().post(
            `/payment/success-confirm?gatewayTxnId=${gatewayTxnId}&method=${method}`,
          );

          Swal.fire(
            "Thành công!",
            "Thanh toán thành công. Khóa học đã mở!",
            "success",
          );
          navigate("/my-courses");
        } else {
          Swal.fire("Thất bại", "Thanh toán không thành công.", "error");
          navigate("/cart");
        }
      } catch (error) {
        console.error(error);
        Swal.fire("Thông báo", "Giỏ hàng đã được xử lý trước đó.", "info");
        navigate("/my-courses");
      } finally {
        localStorage.removeItem("pendingMethod");
        setLoading(false);
      }
    };

    processPayment();
  }, [navigate, searchParams]);

  if (loading) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <Spinner />
        <h5 className="mt-3 text-muted">Đang xác thực kết quả giao dịch...</h5>
      </div>
    );
  }
  return null;
};

export default PaymentResult;
