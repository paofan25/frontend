import axios, { AxiosResponse } from 'axios';
import { Post, User, Skin } from '../types';

// 创建一个axios实例
const instance = axios.create({
  baseURL: 'http://localhost:5001/api',
  timeout: 15000, // 增加超时时间到15秒
  headers: {
    'Content-Type': 'application/json',
  },
});

interface LoginResponse {
  token: string;
  user: User;
}

interface AuthResponse {
  message: string;
}

interface RewardResponse {
  amount: number;
  newBalance: number;
  message: string;
}

interface PurchaseResponse {
  success: boolean;
  newBalance: number;
  purchasedSkin: Skin;
  message: string;
}

// 请求拦截器添加 token
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器处理错误
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API错误:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username: string, password: string): Promise<AxiosResponse<LoginResponse>> =>
    instance.post('/auth/login', { username, password }),
  register: (username: string, password: string): Promise<AxiosResponse<AuthResponse>> =>
    instance.post('/auth/register', { username, password }),
  getCurrentUser: (): Promise<AxiosResponse<User>> =>
    instance.get('/auth/me'),
  updateProfile: (data: Partial<User>): Promise<AxiosResponse<User>> =>
    instance.put('/auth/me', data),
  deleteAccount: (): Promise<AxiosResponse<AuthResponse>> =>
    instance.delete('/auth/me'),
};

export const postAPI = {
  getAllPosts: (): Promise<AxiosResponse<Post[]>> => 
    instance.get('/posts'),
  getPost: (id: string): Promise<AxiosResponse<Post>> => 
    instance.get(`/posts/${id}`),
  createPost: (data: { title: string; content: string }): Promise<AxiosResponse<Post>> =>
    instance.post('/posts', data),
  updatePost: (id: string, data: { title: string; content: string }): Promise<AxiosResponse<Post>> =>
    instance.put(`/posts/${id}`, data),
  deletePost: (id: string): Promise<AxiosResponse<AuthResponse>> =>
    instance.delete(`/posts/${id}`),
  addComment: (postId: string, content: string): Promise<AxiosResponse<Post>> =>
    instance.post(`/posts/${postId}/comments`, { content }),
};

export const shopAPI = {
  getAvailableSkins: (): Promise<AxiosResponse<Skin[]>> =>
    instance.get('/shop/skins'),
  getUserSkins: (): Promise<AxiosResponse<Skin[]>> =>
    instance.get('/shop/user-skins'),
  purchaseSkin: (skinId: string): Promise<AxiosResponse<PurchaseResponse>> =>
    instance.post('/shop/purchase', { skinId }),
  applySkin: (skinId: string): Promise<AxiosResponse<User>> =>
    instance.put('/shop/apply-skin', { skinId }),
};

export const gameAPI = {
  claimReward: (gameId: string, score: number): Promise<AxiosResponse<RewardResponse>> =>
    instance.post('/games/reward', { gameId, score }),
  getHighScores: (gameId: string): Promise<AxiosResponse<{username: string, score: number}[]>> =>
    instance.get(`/games/highscores/${gameId}`),
  unlockGame: (gameId: string): Promise<AxiosResponse<AuthResponse>> =>
    instance.post(`/games/unlock/${gameId}`),
}; 