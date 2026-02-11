import api from './api';

export interface LoginResponse {
  token: string;
  user: {
    username: string;
    role: string;
  };
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  // 模拟仅 admin 可登录
  if (username === 'admin' && password === 'admin') {
    return Promise.resolve({
      token: 'mock-admin-token',
      user: {
        username: 'admin',
        role: 'admin'
      }
    });
  }

  // 如果是对接真实后端，可以使用以下代码：
  // return api.post('/auth/login', { username, password });

  return Promise.reject(new Error('用户名或密码错误，或无权限访问'));
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};
