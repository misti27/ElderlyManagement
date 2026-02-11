import api from './api';
import { Guardian, GuardianRelation } from '../types';

export const getGuardians = async (): Promise<Guardian[]> => {
  return api.get('/guardians');
};

export const addGuardian = async (guardian: Omit<Guardian, 'id' | 'create_time' | 'update_time'>): Promise<Guardian> => {
  return api.post('/guardians', guardian);
};

export const updateGuardian = async (id: string, guardian: Partial<Guardian>): Promise<Guardian> => {
  return api.put(`/guardians/${id}`, guardian);
};

export const deleteGuardian = async (id: string): Promise<void> => {
  return api.delete(`/guardians/${id}`);
};

export const getGuardianRelations = async (): Promise<GuardianRelation[]> => {
  return api.get('/guardian-relations');
};

export const assignGuardianToElderly = async (elderlyId: string, guardianId: string, relationship: string): Promise<GuardianRelation> => {
  return api.post('/guardian-relations', { elderly_id: elderlyId, guardian_id: guardianId, relationship });
};

export const removeGuardianRelation = async (relationId: string): Promise<void> => {
  return api.delete(`/guardian-relations/${relationId}`);
};
