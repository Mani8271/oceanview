import API from "../../API/API";
const api = new API();

export const loginApi = (credentials) => {
  return api.post("api/login", credentials);
};
