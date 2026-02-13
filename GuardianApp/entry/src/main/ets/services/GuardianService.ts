
import { HttpUtil } from '../utils/HttpUtil';
import { Elderly, AlertRecord, HistoryRecord, ActivityStatus } from '../model/Types';
import { MockData } from '../utils/MockData';

export class GuardianService {
  /**
   * 获取绑定的老人列表
   */
  static async getBoundElderlyList(): Promise<Elderly[]> {
    return HttpUtil.get<Elderly[]>('/guardian/elderly');
    // return Promise.resolve(MockData.elderlyList);
  }

  /**
   * 获取特定老人详情
   * @param id 老人ID
   */
  static async getElderlyDetail(id: string): Promise<Elderly | undefined> {
    return HttpUtil.get<Elderly>(`/guardian/elderly/${id}`);
    // const elderly = MockData.elderlyList.find(e => e.id === id);
    // return Promise.resolve(elderly);
  }

  /**
   * 获取报警消息列表
   */
  static async getAlerts(): Promise<AlertRecord[]> {
    return HttpUtil.get<AlertRecord[]>('/guardian/alerts');
    // return Promise.resolve(MockData.alerts);
  }

  /**
   * 获取老人历史活动记录
   * @param elderlyId 老人ID
   * @param dateFilter 日期过滤 (可选)
   */
  static async getHistory(elderlyId: string, dateFilter?: string): Promise<HistoryRecord[]> {
    return HttpUtil.get<HistoryRecord[]>(`/stats/history/${elderlyId}?date=${dateFilter}`);
    // return Promise.resolve(MockData.history);
  }

  /**
   * 绑定新的老人设备
   * @param deviceId 设备ID或绑定码
   */
  static async bindElderly(deviceId: string): Promise<void> {
    return HttpUtil.post<void>('/guardian/bind', { deviceId });
    // return Promise.resolve();
  }

  /**
   * 解除绑定
   * @param elderlyId 老人ID
   */
  static async unbindElderly(elderlyId: string): Promise<void> {
    return HttpUtil.post('/guardian/unbind', { elderlyId });
    // return Promise.resolve();
  }
}
