import api from './api';
import { Alert } from '../types';

export const getAlerts = async (): Promise<Alert[]> => {
  return api.get('/alerts');
};

export const getAlertById = async (id: string): Promise<Alert> => {
  return api.get(`/alerts/${id}`);
};

export const updateAlertStatus = async (id: string, status: string, handleNote?: string): Promise<Alert> => {
  return api.put(`/alerts/${id}`, { status, handle_note: handleNote });
};
