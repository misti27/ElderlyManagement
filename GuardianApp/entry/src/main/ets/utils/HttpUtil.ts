
import http from '@ohos.net.http';
import promptAction from '@ohos.promptAction';
import { Config } from './Config';

/**
 * 封装 HTTP 请求
 */
export class HttpUtil {
  private static token: string = '';

  static setToken(token: string) {
    this.token = token;
  }

  static async request<T>(method: http.RequestMethod, url: string, data?: Object): Promise<T> {
    const httpRequest = http.createHttp();
    const fullUrl = `${Config.getBaseUrl()}${url}`;

    console.info(`[HttpUtil] Request: ${method} ${fullUrl}`);

    const options: http.HttpRequestOptions = {
      method: method,
      header: {
        'Content-Type': 'application/json',
        'Authorization': this.token || AppStorage.Get('token') || ''
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
        const result = JSON.parse(response.result as string) as T;
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

  static get<T>(url: string): Promise<T> {
    return this.request<T>(http.RequestMethod.GET, url);
  }

  static post<T>(url: string, data: Object): Promise<T> {
    return this.request<T>(http.RequestMethod.POST, url, data);
  }

  static put<T>(url: string, data: Object): Promise<T> {
    return this.request<T>(http.RequestMethod.PUT, url, data);
  }

  static delete<T>(url: string): Promise<T> {
    return this.request<T>(http.RequestMethod.DELETE, url);
  }
}
