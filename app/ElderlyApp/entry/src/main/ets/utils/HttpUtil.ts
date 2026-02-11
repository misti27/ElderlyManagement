
import http from '@ohos.net.http';
import promptAction from '@ohos.promptAction';

/**
 * 封装 HTTP 请求
 */
export class HttpUtil {
  // 注意：真机或模拟器需要配置具体的 IP 地址，localhost 在模拟器中指向的是模拟器本身
  // 请将 192.168.1.5 替换为您开发电脑的局域网 IP
  private static readonly BASE_URL = 'http://192.168.1.5:3000/api'; 
  private static token: string = '';

  static setToken(token: string) {
    this.token = token;
  }

  static async request(method: http.RequestMethod, url: string, data?: any): Promise<any> {
    const httpRequest = http.createHttp();
    const fullUrl = `${HttpUtil.BASE_URL}${url}`;
    
    console.info(`[HttpUtil] Request: ${method} ${fullUrl}`);

    const options: http.HttpRequestOptions = {
      method: method,
      header: {
        'Content-Type': 'application/json',
        'Authorization': this.token ? `Bearer ${this.token}` : ''
      },
      extraData: data,
      readTimeout: 10000,
      connectTimeout: 10000
    };

    try {
      const response = await httpRequest.request(fullUrl, options);
      
      console.info(`[HttpUtil] Response Code: ${response.responseCode}`);

      if (response.responseCode === 200 || response.responseCode === 201) {
        // 解析 JSON
        const result = JSON.parse(response.result as string);
        return result;
      } else if (response.responseCode === 401) {
        // Token 失效
        promptAction.showToast({ message: '登录已过期，请重新登录' });
        // TODO: 跳转登录页
        return Promise.reject('Unauthorized');
      } else {
        const errorMsg = `Request failed with status ${response.responseCode}`;
        promptAction.showToast({ message: '网络请求失败: ' + response.responseCode });
        return Promise.reject(errorMsg);
      }
    } catch (err) {
      console.error(`[HttpUtil] Error: ${JSON.stringify(err)}`);
      promptAction.showToast({ message: '网络连接异常' });
      return Promise.reject(err);
    } finally {
      httpRequest.destroy();
    }
  }

  static get(url: string) {
    return this.request(http.RequestMethod.GET, url);
  }

  static post(url: string, data: any) {
    return this.request(http.RequestMethod.POST, url, data);
  }

  static put(url: string, data: any) {
    return this.request(http.RequestMethod.PUT, url, data);
  }

  static delete(url: string) {
    return this.request(http.RequestMethod.DELETE, url);
  }
}
