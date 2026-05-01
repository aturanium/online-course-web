const UserReducer = (currentState, action) => {
  switch (action.type) {
    case "LOGIN":
      return action.payload;
    case "LOGOUT":
      return null;
    default:
      return currentState;
  }
};

export default UserReducer;
