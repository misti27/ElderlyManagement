
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Smartphone,
  Phone,
  Edit2,
  Trash2,
  MapPin,
  RefreshCcw,
  User as UserIcon,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getElderlyList, addElderly, updateElderly, deleteElderly } from '../services/elderlyService';
import { getDeviceList } from '../services/deviceService';
import Modal from '../components/Modal';
import { User, Device } from '../types';

const ElderlyManagement: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<Partial<User>>({});
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchData = async () => {
    try {
      const [usersData, devicesData] = await Promise.all([
        getElderlyList(),
        getDeviceList()
      ]);
      setUsers(usersData);
      setDevices(devicesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // Fallback or error handling
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refreshData = () => {
    fetchData();
  };

  const handleAdd = () => {
    setCurrentUser({ gender: '男' });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setCurrentUser(user);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这位老人的档案吗？此操作不可恢复。')) {
      try {
        await deleteElderly(id);
        refreshData();
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('删除失败，请稍后重试');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && currentUser.id) {
        await updateElderly(currentUser.id, currentUser);
      } else {
        if (currentUser.name && currentUser.phone) {
          await addElderly(currentUser as User);
        }
      }
      refreshData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save user:', error);
      alert('保存失败，请稍后重试');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">老人档案管理</h1>
          <p className="text-slate-500 mt-1">管理在管老人的基本信息及监测设备绑定状态</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button onClick={refreshData} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <RefreshCcw size={18} />
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors text-sm font-medium flex items-center"
          >
            <Plus size={18} className="mr-2" />
            新增档案
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {users.map((user) => {
          const bindDevice = devices.find(d => d.device_id === user.bindDeviceId);

          return (
            <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full object-cover border-4 border-slate-50" />
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        {user.name}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${user.gender === '男' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                          {user.gender}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 font-medium tracking-tight">ID: {user.id}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(user)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(user.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div className="flex items-center text-xs font-bold text-slate-500"><Phone size={14} className="mr-2 text-slate-400" /><span>联系电话</span></div>
                    <div className="text-xs font-bold text-slate-700">{user.phone}</div>
                  </div>
                  {/* 紧急电话样式调整，与联系电话保持一致 */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div className="flex items-center text-xs font-bold text-slate-500"><AlertCircle size={14} className="mr-2 text-slate-400" /><span>紧急电话</span></div>
                    <div className="text-xs font-bold text-slate-700">{user.emergency_phone || '未设置'}</div>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div className="flex items-center text-xs font-bold text-slate-500"><MapPin size={14} className="mr-2 text-slate-400" /><span>居住地址</span></div>
                    <span className="text-xs font-bold text-slate-700 truncate max-w-[140px]">{user.address}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div className="flex items-center text-xs font-bold text-slate-500"><Smartphone size={14} className="mr-2 text-slate-400" /><span>监测设备</span></div>
                    <span className={`text-xs font-bold ${user.bindDeviceId ? 'text-slate-950' : 'text-slate-400 italic'}`}>
                      {bindDevice ? bindDevice.device_name : (user.bindDeviceId || '未绑定')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50/50 px-6 py-3 border-t border-slate-100 text-right">
                <button onClick={() => navigate(`/history/${user.id}`)} className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider">
                  查看历史回顾 &rarr;
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? "编辑老人档案" : "新增老人档案"}
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium">取消</button>
            <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold shadow-sm transition-all">保存</button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">姓名</label>
              <input type="text" value={currentUser.name || ''} onChange={e => setCurrentUser({ ...currentUser, name: e.target.value })} placeholder="输入姓名" className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">性别</label>
              <select value={currentUser.gender || '男'} onChange={e => setCurrentUser({ ...currentUser, gender: e.target.value as any })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white font-medium">
                <option>男</option>
                <option>女</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">联系电话</label>
              <input type="tel" value={currentUser.phone || ''} onChange={e => setCurrentUser({ ...currentUser, phone: e.target.value })} placeholder="输入手机号" className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" />
            </div>
            {/* 弹窗中的紧急电话标签颜色同步调整 */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">紧急电话</label>
              <input type="tel" value={currentUser.emergency_phone || ''} onChange={e => setCurrentUser({ ...currentUser, emergency_phone: e.target.value })} placeholder="紧急联系人电话" className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">家庭住址</label>
            <input type="text" value={currentUser.address || ''} onChange={e => setCurrentUser({ ...currentUser, address: e.target.value })} placeholder="输入详细居住地址" className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ElderlyManagement;
