
import { HttpUtil } from '../utils/HttpUtil';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    phone: string;
    role: string;
  };
}

export class AuthService {
  /**
   * 子女端登录
   * @param phone 手机号
   * @param code 验证码
   */
  static async login(phone: string, code: string): Promise<LoginResponse> {
    // 模拟接口调用
    return HttpUtil.post<LoginResponse>('/auth/login/guardian', { phone, code }).then(res => {
      // Don't access AppStorage here. Just return the result.
      HttpUtil.setToken(res.token);
      return res;
    });

    // Mock 实现
    /*
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockResponse: LoginResponse = {
          token: 'mock-guardian-token-' + Date.now(),
          user: {
            id: 'g001',
            name: '张伟',
            phone: phone,
            role: 'guardian'
          }
        };
        HttpUtil.setToken(mockResponse.token);
        resolve(mockResponse);
      }, 500);
    });
    */
  }

  /**
   * 监护人注册
   * @param name 用户名
   * @param phone 手机号
   * @param password 密码
   */
  static async register(name: string, phone: string, password: string): Promise<boolean> {
    try {
      const response = await HttpUtil.post<{ success: boolean; message: string }>('/auth/register/guardian', { name, phone, password });
      return response.success;
    } catch (e) {
      // 错误已在HttpUtil中统一处理（toast提示），这里返回false即可
      return false;
    }
  }

  /**
   * 请求密码重置验证码 (模拟)
   * @param phone 手机号
   */
  static async requestPasswordResetCode(phone: string): Promise<boolean> {
    try {
      const response = await HttpUtil.post<{ success: boolean; message: string }>('/auth/forgot-password/request-code', { phone });
      return response.success;
    } catch (e) {
      return false;
    }
  }

  /**
   * 重置密码 (模拟)
   * @param phone 手机号
   * @param code 验证码
   * @param newPassword 新密码
   */
  static async resetPassword(phone: string, code: string, newPassword: string): Promise<boolean> {
    try {
      const response = await HttpUtil.post<{ success: boolean; message: string }>('/auth/forgot-password/reset', { phone, code, newPassword });
      return response.success;
    } catch (e) {
      return false;
    }
  }

  /**
   * 退出登录
   */
  static logout() {
    HttpUtil.setToken('');
    AppStorage.SetOrCreate('token', '');
  }
}
