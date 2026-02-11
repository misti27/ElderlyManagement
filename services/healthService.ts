import api from './api';
import { HealthArchive } from '../types';

export const getHealthArchive = async (userId: string): Promise<HealthArchive> => {
  return api.get(`/health-archives/${userId}`);
};

export const updateHealthArchive = async (userId: string, archive: Partial<HealthArchive>): Promise<HealthArchive> => {
  return api.put(`/health-archives/${userId}`, archive);
};
