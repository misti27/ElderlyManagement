import api from './api';
import { User } from '../types';

// 获取所有老人列表
export const getElderlyList = async (): Promise<User[]> => {
  return api.get('/elderly');
};

// 获取单个老人详情
export const getElderlyById = async (id: string): Promise<User> => {
  return api.get(`/elderly/${id}`);
};

// 新增老人档案
export const addElderly = async (user: Omit<User, 'id'>): Promise<User> => {
  return api.post('/elderly', user);
};

// 更新老人档案
export const updateElderly = async (id: string, user: Partial<User>): Promise<User> => {
  return api.put(`/elderly/${id}`, user);
};

// 删除老人档案
export const deleteElderly = async (id: string): Promise<void> => {
  return api.delete(`/elderly/${id}`);
};
