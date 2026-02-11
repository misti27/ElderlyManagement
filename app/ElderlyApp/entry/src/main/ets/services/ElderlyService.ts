
import { HttpUtil } from '../utils/HttpUtil';
import { User, Guardian, ActivityStatus } from '../model/Types';
import { MockData } from '../utils/MockData';

export class ElderlyService {
  /**
   * 获取当前老人个人信息
   */
  static async getProfile(): Promise<User> {
    // return HttpUtil.get('/elderly/profile');
    return Promise.resolve(MockData.currentUser);
  }

  /**
   * 获取关联的监护人列表
   */
  static async getGuardians(): Promise<Guardian[]> {
    // return HttpUtil.get('/elderly/guardians');
    return Promise.resolve(MockData.guardians);
  }

  /**
   * 上报实时状态 (如: 跌倒、行走、静止)
   */
  static async reportStatus(status: ActivityStatus, location?: string): Promise<void> {
    console.info(`[ElderlyService] Reporting status: ${status}, location: ${location}`);
    // return HttpUtil.post('/elderly/status', { status, location });
    return Promise.resolve();
  }

  /**
   * 上报实时位置
   * @param latitude 纬度
   * @param longitude 经度
   * @param address 地址描述
   */
  static async reportLocation(latitude: number, longitude: number, address: string): Promise<void> {
    console.info(`[ElderlyService] Reporting location: ${latitude}, ${longitude}`);
    // return HttpUtil.post('/elderly/location', { latitude, longitude, address });
    return Promise.resolve();
  }

  /**
   * 发送 SOS 紧急求救
   */
  static async sendSos(): Promise<void> {
    console.warn(`[ElderlyService] Sending SOS!`);
    // return HttpUtil.post('/elderly/sos', {});
    return Promise.resolve();
  }
}
