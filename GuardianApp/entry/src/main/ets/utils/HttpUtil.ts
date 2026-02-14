
import http from '@ohos.net.http';
import promptAction from '@ohos.promptAction';
import router from '@ohos.router';
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

    // Safely get token
    let token = this.token;
    // REMOVED: AppStorage access in non-UI logic
    // We rely on setToken being called by EntryAbility or LoginPage

    const options: http.HttpRequestOptions = {
      method: method,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token
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
        // Don't use UI APIs here to avoid context issues. Let the caller handle it.
        return Promise.reject(new Error('Unauthorized'));
      } else {
        const errorMsg = `Request failed with status ${response.responseCode}`;
        return Promise.reject(new Error(errorMsg));
      }
    } catch (err) {
      console.error(`[HttpUtil] Error: ${JSON.stringify(err)}`);
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
