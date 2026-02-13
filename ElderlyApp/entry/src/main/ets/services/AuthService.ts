
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
   * 老人端登录
   * @param phone 手机号
   * @param code 验证码
   */
  static async login(phone: string, code: string): Promise<LoginResponse> {
    // 模拟接口调用
    return HttpUtil.post('/auth/login/elderly', { phone, code }).then(res => {
        HttpUtil.setToken(res.token);
        return res;
    });
    
    // Mock 实现
    /*
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockResponse: LoginResponse = {
          token: 'mock-elderly-token-' + Date.now(),
          user: {
            id: 'u001',
            name: '张建国',
            phone: phone,
            role: 'elderly'
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
    // 清除本地存储等操作
  }
}
