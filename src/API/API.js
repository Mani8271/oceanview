import axios from "axios";
import { STATUS_CODE, BASE_URL } from "./Constants";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';




// Request Methods
const METHOD = {
  GET: "get",
  POST: "post",
  PUT: "put",
  DELETE: "delete",
};
/*
* API controller that for handling the request
*/
class API {
  isLoggedIn = false;
  userData = {};
  userToken = null;
  constructor() {
    this.baseURL = BASE_URL;
  }
  get(url, data) {
    return new Promise((resolve, reject) => {
      this.api(METHOD.GET, url, data)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }
  post(url, data) {
    return new Promise((resolve, reject) => {
      this.api(METHOD.POST, url, data)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  put(url, data) {
    return new Promise((resolve, reject) => {
      this.api(METHOD.PUT, url, data)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  delete(url, data) {
    return new Promise((resolve, reject) => {
      this.api(METHOD.DELETE, url, data)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }
  // Recursive function to uppercase all strings in an object/array
  uppercasePayload(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (obj instanceof FormData) return obj; // Skip FormData processing
    if (Array.isArray(obj)) return obj.map(item => this.uppercasePayload(item));

    const newObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        let val = obj[key];
        // Exclude specific sensitivity fields
        if (typeof val === 'string' && !['password', 'email', 'avatar', 'image', 'date', 'icon'].some(k => key.toLowerCase().includes(k))) {
          val = val.toUpperCase();
        } else if (typeof val === 'object') {
          val = this.uppercasePayload(val);
        }
        newObj[key] = val;
      }
    }
    return newObj;
  }

  // Main function with hold the axios request param
  api(method, url, data) {
    // Automatically uppercase all data for POST and PUT requests
    let finalData = data;
    if ((method === METHOD.POST || method === METHOD.PUT) && data) {
       finalData = this.uppercasePayload(data);
    }

    console.log('method, url, finalData', method, url, finalData)
    return new Promise((resolve, reject) => {
      let axiosConfig = {};
      axiosConfig.method = method;
      axiosConfig.url = this.baseURL + url;
      axiosConfig.headers = this.setHeaders(finalData);
      
      if (finalData) {
        axiosConfig.data = finalData;
      }

      axios(axiosConfig)
        .then((response) => {
          if (
            response &&
            response.status === STATUS_CODE.INTERNAL_SERVER_ERROR
          ) {
            alert("Something went wrong!!");
            reject(new Error("Internal Server Error"));
          } else {
            resolve(response);
            if (response) {
              const successMessage = response.data?.messages;
              if (successMessage) {
                toast.success(successMessage);
              }
            }
          }
        })
        .catch((error) => {
          let err = error?.response;
          let errData = error?.response?.data;
          console.log("in API",err)
          console.log("in API",errData)
          console.log("ERROR", error);
          if (
            error.response?.data?.email &&
            error.response.data.email.length > 0
          ) {
            toast.error(`Email ${error.response.data.email[0]}`);
          } else if (
            error.response?.data?.phone_number &&
            error.response.data.phone_number.length > 0
          ) {
            toast.error(`Mobile Number ${error.response.data.phone_number[0]}`);
          } else if (
            error.response?.data?.message
          ) {
            toast.error(`${error.response.data.message}`);
          } else if (
            error.response?.data?.messages
          ) {
            toast.error(`${error.response.data.messages}`);
          } else if (err?.status === 401) {
            toast.error(`${errData?.errors || errData?.message || "Unauthorized"}`);
          } else if (err?.status === 422) {
            const errors = error.response.data.errors;
            if (typeof errors === 'object') {
              const firstErr = Object.values(errors)[0];
              toast.error(Array.isArray(firstErr) ? firstErr[0] : String(firstErr));
            } else {
              toast.error(String(errors));
            }
          } else {
            // Minimal spam
            console.error("API Error occurred for:", url);
          }
      
          reject(error);
        });
    });
  }
  // Set the header for request
  setHeaders(data) {
    let headers = {};
    headers["accept-language"] = "en";
    headers["Content-Type"] = "application/json";
    headers["Accept"] = "application/json";
    headers["Authorization"] = localStorage.getItem("token");
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (data) {
      if (data.isMultipart) {
        headers["Content-Type"] = "multipart/form-data";
      }
      if (data.headers) {
        for (var key in data.headers) {
          if (data.headers.hasOwnProperty(key)) {
            headers[key] = data.headers[key];
          }
        }
      }
    }
    return headers;
  }
}
export default API;