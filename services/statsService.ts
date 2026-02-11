import api from './api';
import { DashboardStats, ElderlyStatus, HistoryStats, HealthReport, SystemAnalysis } from '../types';

export const getDashboardStats = async (): Promise<DashboardStats> => {
  return api.get('/stats/dashboard');
};

export const getElderlyStatuses = async (): Promise<Record<string, ElderlyStatus>> => {
  return api.get('/stats/statuses');
};

export const getHistoryStats = async (userId: string, range: string): Promise<HistoryStats> => {
  return api.get(`/stats/history/${userId}`, { params: { range } });
};

export const getHealthReport = async (userId: string): Promise<HealthReport> => {
  return api.get(`/stats/health/${userId}`);
};

export const getSystemAnalysis = async (): Promise<SystemAnalysis> => {
  return api.get('/stats/analysis');
};
