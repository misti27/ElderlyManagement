export class Config {
  // 开发环境 (模拟器/真机调试时使用局域网 IP)
  // 如果使用模拟器，请使用您的电脑局域网 IP (ipconfig 查看)，例如 'http://192.168.1.79:3000/api'
  // 如果使用预览器 (Previewer)，可以使用 'http://localhost:3000/api'
  static readonly DEV_BASE_URL = 'http://192.168.1.79:3000/api';

  // 生产环境 (云服务器 IP 或域名)
  static readonly PROD_BASE_URL = 'http://<您的云服务器IP>:3000/api';

  // 当前环境开关
  static readonly IS_DEV = true;

  static getBaseUrl(): string {
    return this.IS_DEV ? this.DEV_BASE_URL : this.PROD_BASE_URL;
  }
}
