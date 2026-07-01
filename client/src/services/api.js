import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const checkHealth = () => api.get("/health");

export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);
export const forgotPassword = (data) => api.post("/auth/forgot-password", data);
export const resetPassword = (data) => api.post("/auth/reset-password", data);

export const createPost = (formData) =>
  api.post("/posts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    transformRequest: [(data, headers) => {
      delete headers["Content-Type"];
      return data;
    }],
  });

export const getPosts = () => api.get("/posts");
export const getMyPosts = () => api.get("/posts/my");
export const getPostById = (id) => api.get(`/posts/${id}`);

export const updatePost = (id, formData) =>
  api.put(`/posts/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    transformRequest: [(data, headers) => {
      delete headers["Content-Type"];
      return data;
    }],
  });

export const deletePost = (id) => api.delete(`/posts/${id}`);

export const createClaim = (data) => api.post("/claims", data);
export const getMyClaims = () => api.get("/claims/my");
export const getReceivedClaims = () => api.get("/claims/received");
export const getClaimForPost = (postId) => api.get(`/claims/post/${postId}`);
export const approveClaim = (id) => api.patch(`/claims/${id}/approve`);
export const rejectClaim = (id) => api.patch(`/claims/${id}/reject`);
export const cancelClaim = (id) => api.delete(`/claims/${id}`);

export default api;
