import * as types from "./actionTypes";
import { registerApi } from "../../redux/apis/registerApi"; 
import { loginInitiate } from "./loginAction";

// Start Action
export const registerStart = () => ({
  type: types.REGISTER_START,
});

// Success Action
export const registerSuccess = (data) => ({
  type: types.REGISTER_SUCCESS,
  payload: data,
});

// Error Action
export const registerError = (error) => ({
  type: types.REGISTER_ERROR,
  payload: error,
});

// Main Initiator (Thunk)
export const registerInitiate = (userData, navigate) => {
  return function (dispatch) {
    dispatch(registerStart());

    registerApi(userData)
      .then((res) => {
        console.log("register response", res);

        dispatch(registerSuccess(res.data));
        
        // Auto login after successful registration
        const { username, password } = userData;
        dispatch(loginInitiate({ username, password }, navigate));
      })
      .catch((error) => {
        console.error("register error", error);
        dispatch(registerError(error?.response?.data?.message || error.message || "Registration failed"));
      });
  };
};

export default {
  registerStart,
  registerSuccess,
  registerError,
  registerInitiate,
};
