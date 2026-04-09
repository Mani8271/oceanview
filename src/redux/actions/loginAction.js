import * as types from "./actionTypes"
import { loginApi } from "../../redux/apis/loginApi"; // we'll define this API next

// Start Action
export const loginStart = () => ({
  type: types.LOGIN_START,
});

// Success Action
export const loginSuccess = (data) => ({
  type: types.LOGIN_SUCCESS,
  payload: data,
});

// Error Action
export const loginError = (error) => ({
  type: types.LOGIN_ERROR,
  payload: error,
});

// Logout Action
export const logoutUser = () => ({
  type: types.LOGOUT_USER,
});

// Main Initiator (Thunk)
export const loginInitiate = (credentials, navigate) => {
  return function (dispatch) {
    dispatch(loginStart());

    loginApi(credentials)
      .then((res) => {
        const userData = res?.data;
        const token = userData?.access_token || userData?.token;
        const user = userData?.user;

        // Store token & user safely in localStorage to survive page refreshes
        if (token) localStorage.setItem("token", token);
        if (user) localStorage.setItem("user", JSON.stringify(user));

        dispatch(loginSuccess({ user, token }));
        navigate("/dashboard");
      })
      .catch((error) => {
        console.error("login error", error);
        dispatch(loginError(error.message || "Login failed"));
      });
  };
};

export default {
  loginInitiate,
  logoutUser,
};
