import api from './api';
import { Device } from '../types';

// 获取所有设备列表
export const getDeviceList = async (): Promise<Device[]> => {
  return api.get('/devices');
};

// 获取单个设备详情
export const getDeviceById = async (id: string): Promise<Device> => {
  return api.get(`/devices/${id}`);
};

// 更新设备信息
export const updateDevice = async (id: string, updates: Partial<Device>): Promise<Device> => {
  return api.put(`/devices/${id}`, updates);
};

// 设备绑定/解绑老人
export const assignDeviceToElderly = async (deviceId: string, elderlyId: string | null): Promise<void> => {
  return api.post(`/devices/${deviceId}/assign`, { elderlyId });
};

// 添加设备
export const addDevice = async (device: Omit<Device, 'device_id'>): Promise<Device> => {
  return api.post('/devices', device);
};
