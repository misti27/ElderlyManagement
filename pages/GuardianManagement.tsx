
import React, { useState, useEffect } from 'react';
import { Plus, Phone, User, Trash2, Edit2, X, Check } from 'lucide-react';
import {
  getGuardians,
  addGuardian,
  updateGuardian,
  deleteGuardian,
  getGuardianRelations,
  assignGuardianToElderly,
  removeGuardianRelation
} from '../services/guardianService';
import { getElderlyList } from '../services/elderlyService';
import Modal from '../components/Modal';
import { Guardian, User as ElderlyUser, GuardianRelation } from '../types';

const GuardianManagement: React.FC = () => {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [users, setUsers] = useState<ElderlyUser[]>([]);
  const [relations, setRelations] = useState<GuardianRelation[]>([]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRelateModalOpen, setIsRelateModalOpen] = useState(false);
  const [activeGuardianId, setActiveGuardianId] = useState<string | null>(null);
  const [editingGuardian, setEditingGuardian] = useState<Partial<Guardian> | null>(null);

  // Relation State
  const [selectedElderlyId, setSelectedElderlyId] = useState<string | null>(null);
  const [relationshipInput, setRelationshipInput] = useState('子女');
  const presetRelationships = ['子女', '亲属', '护工'];

  const fetchData = async () => {
    try {
      const [guardiansData, usersData, relationsData] = await Promise.all([
        getGuardians(),
        getElderlyList(),
        getGuardianRelations()
      ]);
      setGuardians(guardiansData);
      setUsers(usersData);
      setRelations(relationsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refreshData = () => {
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除该监护人吗？所有关联关系也将一并清理。')) {
      try {
        await deleteGuardian(id);
        refreshData();
      } catch (error) {
        console.error('Delete failed:', error);
        alert('删除失败');
      }
    }
  };

  const handleRemoveRelation = async (e: React.MouseEvent, relationId: string) => {
    e.stopPropagation();
    if (window.confirm('确认解除该监护关联吗？')) {
      try {
        await removeGuardianRelation(relationId);
        refreshData();
      } catch (error) {
        console.error('Remove relation failed:', error);
        alert('解除关联失败');
      }
    }
  };

  const openRelateModal = (guardianId: string) => {
    setActiveGuardianId(guardianId);
    setSelectedElderlyId(null);
    setRelationshipInput('子女');
    setIsRelateModalOpen(true);
  };

  const confirmRelate = async () => {
    if (activeGuardianId && selectedElderlyId && relationshipInput.trim()) {
      try {
        await assignGuardianToElderly(activeGuardianId, selectedElderlyId, relationshipInput.trim());
        refreshData();
        setIsRelateModalOpen(false);
      } catch (error) {
        console.error('Relate failed:', error);
        alert('关联失败');
      }
    } else if (!selectedElderlyId) {
      alert('请先选择一位老人');
    } else {
      alert('请输入关系说明');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!editingGuardian?.name || !editingGuardian?.phone) {
        alert('请填写完整信息');
        return;
      }

      if (editingGuardian?.id) {
        await updateGuardian(editingGuardian.id, editingGuardian);
      } else {
        await addGuardian({
          name: editingGuardian.name!,
          phone: editingGuardian.phone!,
          avatarUrl: editingGuardian.avatarUrl
        });
      }
      refreshData();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Save failed:', error);
      alert('保存失败');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">监护人管理</h1>
          <p className="text-slate-500 mt-1">管理子女、亲属及养老院护工等紧急联系人</p>
        </div>
        <button
          onClick={() => { setEditingGuardian({}); setIsEditModalOpen(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors text-sm font-medium flex items-center"
        >
          <Plus size={18} className="mr-2" />
          新增监护人
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guardians.map(guardian => {
          // Calculate bound elderly from relations state
          const boundElderly = relations
            .filter(r => r.guardian_id === guardian.id)
            .map(r => {
              const elderly = users.find(u => u.id === r.elderly_id);
              if (!elderly) return null;
              return { ...elderly, relationId: r.relation_id, relationship: r.relationship };
            })
            .filter((item): item is (ElderlyUser & { relationId: string, relationship: string }) => item !== null);

          return (
            <div key={guardian.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <img src={guardian.avatarUrl} className="w-12 h-12 rounded-full border border-slate-100 object-cover" alt="" />
                    <div className="ml-4">
                      <h3 className="font-bold text-slate-800">{guardian.name}</h3>
                      <div className="flex items-center text-xs text-slate-500 mt-1">
                        <Phone size={12} className="mr-1" />
                        {guardian.phone}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button onClick={() => { setEditingGuardian(guardian); setIsEditModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(guardian.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    <User size={12} className="mr-1" />
                    关联老人 ({boundElderly.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {boundElderly.map((elderly: any) => (
                      <div key={elderly.relation_id} className="flex items-center bg-blue-50 text-blue-700 pl-3 pr-2 py-1.5 rounded-full text-[10px] font-medium border border-blue-100 group shadow-sm hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 transition-all">
                        <span className="mr-1 font-bold">{elderly.name}</span>
                        <span className="opacity-60 font-normal mr-1">({elderly.relationship})</span>
                        <button
                          onClick={(e) => handleRemoveRelation(e, elderly.relation_id)}
                          className="text-blue-300 group-hover:text-rose-500 transition-colors ml-1 p-0.5 rounded-full hover:bg-rose-100"
                          title="解除关联"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => openRelateModal(guardian.id)}
                      className="w-8 h-8 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
                      title="点击关联老人"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                <span>最近更新: {guardian.update_time}</span>
                <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">监测中</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Guardian Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={editingGuardian?.id ? "编辑监护人" : "新增监护人"}
        footer={
          <div className="flex space-x-2">
            <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">取消</button>
            <button onClick={handleSubmit} className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg">保存</button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">监护人姓名</label>
            <input
              type="text"
              value={editingGuardian?.name || ''}
              onChange={e => setEditingGuardian({ ...editingGuardian, name: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="请输入姓名"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">手机号码</label>
            <input
              type="tel"
              value={editingGuardian?.phone || ''}
              onChange={e => setEditingGuardian({ ...editingGuardian, phone: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="请输入手机号"
            />
          </div>
        </div>
      </Modal>

      {/* Relate Elderly Modal */}
      <Modal
        isOpen={isRelateModalOpen}
        onClose={() => setIsRelateModalOpen(false)}
        title="关联老年人档案"
        footer={
          <div className="flex space-x-2">
            <button onClick={() => setIsRelateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">取消</button>
            <button
              onClick={confirmRelate}
              className={`px-4 py-2 text-sm font-medium rounded-lg text-white transition-all ${selectedElderlyId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-300 cursor-not-allowed'}`}
            >
              确认关联
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">1. 选择老人</label>
            {users.map(user => {
              const isAlreadyBound = relations.some(r => r.guardian_id === activeGuardianId && r.elderly_id === user.id);
              const isSelected = selectedElderlyId === user.id;

              return (
                <div
                  key={user.id}
                  onClick={() => !isAlreadyBound && setSelectedElderlyId(user.id)}
                  className={`w-full flex items-center p-3 border rounded-lg transition-all group ${isAlreadyBound
                    ? 'bg-slate-50 border-slate-100 cursor-not-allowed opacity-50'
                    : isSelected
                      ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-100'
                      : 'bg-white border-slate-100 hover:border-blue-200 cursor-pointer'
                    }`}
                >
                  <img src={user.avatarUrl} className="w-8 h-8 rounded-full mr-3 border border-slate-100 object-cover" alt="" />
                  <div className="text-left flex-1">
                    <div className={`text-sm font-bold ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>{user.name}</div>
                    <div className="text-xs text-slate-500">{user.phone}</div>
                  </div>
                  <div className="text-xs font-bold">
                    {isAlreadyBound ? (
                      <span className="text-slate-400">已关联</span>
                    ) : isSelected ? (
                      <span className="text-blue-600 flex items-center"><Check size={14} className="mr-1" /> 已选</span>
                    ) : (
                      <span className="text-slate-300 group-hover:text-blue-400">选择</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {selectedElderlyId && (
            <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-2">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">2. 选择内置关系</label>
                <div className="flex flex-wrap gap-2">
                  {presetRelationships.map(rel => (
                    <button
                      key={rel}
                      onClick={() => setRelationshipInput(rel)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${relationshipInput === rel
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                        }`}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">3. 自定义输入</label>
                <div className="relative">
                  <input
                    type="text"
                    value={relationshipInput}
                    onChange={e => setRelationshipInput(e.target.value)}
                    placeholder="手动输入关系 (如: 孙子、隔壁邻居)"
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  />
                  {!presetRelationships.includes(relationshipInput) && relationshipInput.length > 0 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">自定义</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default GuardianManagement;
