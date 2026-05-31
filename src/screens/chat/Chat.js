import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  ListGroup,
  Image,
} from "react-bootstrap";
import { UserContext } from "../../configs/Context";
import { authApi, endpoints } from "../../configs/Apis";
import { db } from "../../configs/Firebase";
import { ref, onValue } from "firebase/database";
import Swal from "sweetalert2";
import Spinner from "../../components/Spinner";

const Chat = () => {
  const [user] = useContext(UserContext);
  const [rooms, setRooms] = useState([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchRooms = async () => {
    try {
      const res = await authApi().get(endpoints["chatRooms"]);
      setRooms(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách chat:", error);
    }
  };

  useEffect(() => {
    fetchRooms();
    if (!user || !user.id) return;
    const updateRef = ref(db, `chat_updates/${user.id}`);
    const unsubscribe = onValue(updateRef, (snapshot) => {
      if (snapshot.exists()) {
        fetchRooms();
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleCreateChat = async (targetUser) => {
    try {
      setLoading(true);

      const res = await authApi().post(`/chat-room/${targetUser.id}`);
      const newRoom = res.data;

      await fetchRooms();
      setActiveRoom(newRoom);
      setSearchResults([]);
      setSearchEmail("");

      Swal.fire({
        icon: "success",
        title: "Đã kết nối",
        text: `Bắt đầu chat với ${targetUser.fullName}`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire("Lỗi", "Không thể tạo phòng chat!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      text: "Đoạn chat sẽ bị xóa!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await authApi().delete(`/chat-room/${roomId}`);
        if (activeRoom?.roomId === roomId) setActiveRoom(null);
        fetchRooms();
        Swal.fire("Đã xóa!", "Đoạn chat đã bị xóa", "success");
      } catch (error) {
        Swal.fire("Lỗi", "Không thể xóa đoạn chat!", "error");
      }
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchEmail) return;
    try {
      const res = await authApi().get(
        `${endpoints["searchUsers"]}?email=${searchEmail}`,
      );
      setSearchResults(res.data);
    } catch (error) {
      setSearchResults([]);
      Swal.fire("Thông báo", "Không tìm thấy người dùng này", "info");
    }
  };

  useEffect(() => {
    if (activeRoom?.roomId) {
      const messagesRef = ref(db, `messages/${activeRoom.roomId}`);
      const unsubscribe = onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          let loadedMessages = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));

          if (activeRoom.clearedAt) {
            const clearTimestamp = new Date(activeRoom.clearedAt).getTime();
            loadedMessages = loadedMessages.filter(
              (m) => m.timestamp >= clearTimestamp,
            );
          }

          loadedMessages.sort((a, b) => a.timestamp - b.timestamp);
          setMessages(loadedMessages);
        } else {
          setMessages([]);
        }
      });
      return () => unsubscribe();
    }
  }, [activeRoom]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom) return;
    try {
      await authApi().post(`/chat-room/${activeRoom.roomId}/message`, {
        content: newMessage,
      });
      setNewMessage("");
      fetchRooms();
    } catch (error) {
      console.error(error);
      Swal.fire("Lỗi", "Không thể gửi tin nhắn lúc này", "error");
    }
  };

  if (!user) return <Spinner />;
  if (loading) return <Spinner />;

  return (
    <Container fluid className="mt-3 mb-4" style={{ height: "85vh" }}>
      <Row className="h-100">
        <Col md={4} className="h-100 d-flex flex-column">
          <Card className="h-100 shadow-sm border-0 overflow-hidden">
            <div className="p-3 border-bottom bg-white">
              <h5 className="fw-bold mb-3">Tin nhắn</h5>
              <Form className="d-flex" onSubmit={handleSearch}>
                <Form.Control
                  type="text"
                  placeholder="Nhập email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="rounded-pill shadow-sm"
                />
                <Button
                  variant="primary"
                  type="submit"
                  className="ms-2 rounded-pill px-3"
                >
                  Tìm
                </Button>
              </Form>
            </div>

            <div className="flex-grow-1 overflow-auto bg-white">
              {searchResults.length > 0 && (
                <div className="bg-light p-2 border-bottom">
                  <div className="px-2 mb-2">
                    <span className="fw-bold">Kết quả tìm kiếm</span>
                  </div>
                  {searchResults.map((su, idx) => (
                    <div
                      key={idx}
                      className="d-flex align-items-center justify-content-between p-2 hover-effect rounded mb-1"
                    >
                      <div className="d-flex align-items-center">
                        <Image
                          src={su.avatar}
                          roundedCircle
                          width="40"
                          height="40"
                          className="me-2"
                          style={{ objectFit: "cover" }}
                        />
                        <div className="small">
                          <div className="fw-bold">{su.fullName}</div>
                          <div className="text-muted">{su.email}</div>
                        </div>
                      </div>
                      <Button
                        variant="success"
                        size="sm"
                        className="rounded-pill px-3"
                        onClick={() => handleCreateChat(su)}
                      >
                        Nhắn tin
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <ListGroup variant="flush">
                {rooms.map((room, idx) => (
                  <ListGroup.Item
                    action
                    as="div"
                    key={idx}
                    onClick={() => setActiveRoom(room)}
                    className={`border-0 border-bottom py-3 ${activeRoom?.roomId === room.roomId ? "bg-primary-subtle" : ""}`}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center overflow-hidden">
                        <Image
                          src={room.targetUserAvatar}
                          roundedCircle
                          width="48"
                          height="48"
                          className="me-3 border shadow-sm"
                          style={{ objectFit: "cover" }}
                        />
                        <div className="overflow-hidden">
                          <div className="fw-bold text-dark text-truncate">
                            {room.targetUserFullName}
                          </div>
                          <div
                            className="small text-muted text-truncate"
                            style={{ fontSize: "0.85rem" }}
                          >
                            {room.lastMessage || "Chưa có tin nhắn nào..."}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        className="ms-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRoom(room.roomId);
                        }}
                      >
                        Xóa
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
                {rooms.length === 0 && searchResults.length === 0 && (
                  <div className="text-center mt-5 text-muted small">
                    Chưa có cuộc trò chuyện nào
                  </div>
                )}
              </ListGroup>
            </div>
          </Card>
        </Col>

        <Col md={8} className="h-100">
          <Card className="h-100 shadow-sm border-0 overflow-hidden">
            {activeRoom ? (
              <div className="d-flex flex-column h-100">
                <Card.Header className="bg-white p-3 border-bottom d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <Image
                      src={activeRoom.targetUserAvatar}
                      roundedCircle
                      width="40"
                      height="40"
                      className="me-2"
                      style={{ objectFit: "cover" }}
                    />
                    <div>
                      <h6 className="mb-0 fw-bold">
                        {activeRoom.targetUserFullName}
                      </h6>
                    </div>
                  </div>
                </Card.Header>

                <Card.Body
                  className="overflow-auto p-4"
                  style={{ backgroundColor: "#f0f2f5" }}
                >
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`d-flex mb-3 ${msg.senderId === user.id ? "justify-content-end" : "justify-content-start"}`}
                    >
                      <div
                        className={`p-3 rounded-4 shadow-sm ${msg.senderId === user.id ? "bg-primary text-white" : "bg-white text-dark"}`}
                        style={{ maxWidth: "65%" }}
                      >
                        <div>{msg.content}</div>
                        <div
                          className={`text-end mt-1 ${msg.senderId === user.id ? "text-white-50" : "text-muted"}`}
                          style={{ fontSize: "0.65rem" }}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </Card.Body>

                <Card.Footer className="bg-white border-top p-3">
                  <Form className="d-flex gap-2" onSubmit={handleSendMessage}>
                    <Form.Control
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="rounded-pill border-1 bg-light px-4"
                    />
                    <Button
                      variant="primary"
                      type="submit"
                      className="rounded-pill px-3"
                    >
                      Gửi
                    </Button>
                  </Form>
                </Card.Footer>
              </div>
            ) : (
              <div className="h-100 d-flex flex-column justify-content-center align-items-center bg-light text-muted">
                <div className="display-1 opacity-25 mb-3">
                  <i className="fa-solid fa-comments"></i>
                </div>
                <h5>Chọn một phòng chat để nhắn</h5>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Chat;
