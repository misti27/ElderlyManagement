
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
   * 退出登录
   */
  static logout() {
    HttpUtil.setToken('');
    AppStorage.SetOrCreate('token', '');
  }
}
