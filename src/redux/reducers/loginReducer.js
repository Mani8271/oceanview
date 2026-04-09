import * as types from "../actions/actionTypes";

const token = localStorage.getItem("token") || null;
let user = null;
try {
  const userStr = localStorage.getItem("user");
  if (userStr) user = JSON.parse(userStr);
} catch (e) {}

const initialState = {
  loading: false,
  user: user,
  token: token,
  error: null,
  isLoggedIn: !!token,
};

const loginReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.LOGIN_START:
      return { ...state, loading: true, error: null };

    case types.LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        isLoggedIn: true,
      };

    case types.LOGIN_ERROR:
      return { ...state, loading: false, error: action.payload };

    case types.LOGOUT_USER:
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return {
        ...initialState,
        loading: false,
        user: null,
        token: null,
        isLoggedIn: false,
      };

    default:
      return state;
  }
};

export default loginReducer;
