
import React, { useState, useEffect } from 'react';
import { Plus, Smartphone, Battery, Wifi, User, Search, Filter, RefreshCcw } from 'lucide-react';
import { getDeviceList, updateDevice, assignDeviceToElderly } from '../services/deviceService';
import { getElderlyList } from '../services/elderlyService';
import Modal from '../components/Modal';
import { Device, User as ElderlyUser } from '../types';

const DeviceManagement: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [users, setUsers] = useState<ElderlyUser[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [editingDevice, setEditingDevice] = useState<Partial<Device> | null>(null);

  const fetchData = async () => {
    try {
      const [devicesData, usersData] = await Promise.all([
        getDeviceList(),
        getElderlyList()
      ]);
      setDevices(devicesData);
      setUsers(usersData);
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

  const getBatteryColor = (level: number) => {
    if (level <= 20) return 'bg-rose-500';
    if (level <= 50) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const handleUnbind = async (deviceId: string) => {
    if (window.confirm('确认解绑该设备吗？解绑后将停止实时监测。')) {
      try {
        await assignDeviceToElderly(deviceId, null);
        refreshData();
      } catch (error) {
        console.error('Unbind failed:', error);
        alert('解绑失败');
      }
    }
  };

  const handleOpenEdit = (device: Device) => {
    setEditingDevice({ ...device });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDevice && editingDevice.device_id) {
      try {
        await updateDevice(editingDevice.device_id, editingDevice);
        refreshData();
        setIsEditModalOpen(false);
      } catch (error) {
        console.error('Update failed:', error);
        alert('更新失败');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">设备管理</h1>
          <p className="text-slate-500 mt-1">管理系统硬件终端、监控在线状态与电量</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 shadow-sm transition-colors" onClick={refreshData}>
            <RefreshCcw size={18} />
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 text-sm font-medium flex items-center transition-all">
            <Plus size={18} className="mr-2" />
            添加设备
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="搜索设备ID或名称..." />
        </div>
        <div className="flex space-x-2">
          <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-blue-500">
            <option>所有状态</option>
            <option>在线</option>
            <option>离线</option>
          </select>
          <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 flex items-center transition-colors">
            <Filter size={16} className="mr-2" /> 筛选
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">设备信息</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">当前归属</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">电量状态</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">监控状态</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {devices.map(device => {
                const elderly = users.find(u => u.id === device.elderly_id);
                return (
                  <tr key={device.device_id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg ${device.is_online ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'} mr-3 border border-transparent group-hover:border-blue-100 transition-all`}>
                          <Smartphone size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800">{device.device_name}</div>
                          <div className="text-[10px] text-slate-400">品牌: {device.brand} | ID: {device.device_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {elderly ? (
                        <div className="flex items-center text-sm">
                          <img src={elderly.avatarUrl} className="w-5 h-5 rounded-full mr-2 opacity-80 border border-slate-100" alt="" />
                          <span className="font-medium text-slate-700">{elderly.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic bg-slate-50 px-2 py-0.5 rounded border border-slate-100">未绑定归属</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className={`h-full ${getBatteryColor(device.battery_level)} transition-all duration-500`}
                            style={{ width: `${device.battery_level}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold ${device.battery_level <= 20 ? 'text-rose-500' : 'text-slate-600'}`}>
                          {device.battery_level}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${device.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                          <span className={`text-xs font-medium ${device.is_online ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {device.is_online ? '监控中' : '已停止'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center">
                          <Wifi size={10} className="mr-1 text-slate-300" /> 信号优
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEdit(device)}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded transition-colors"
                        >
                          修改
                        </button>
                        {device.elderly_id && (
                          <button onClick={() => handleUnbind(device.device_id)} className="text-[10px] font-bold text-rose-500 hover:text-rose-700 bg-rose-50 px-2 py-1 rounded transition-colors">解绑</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 修改设备弹窗 */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="设备参数修改"
        footer={
          <div className="flex space-x-2">
            <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">取消</button>
            <button onClick={handleSaveEdit} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all">保存更改</button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">设备名称</label>
              <input
                type="text"
                value={editingDevice?.device_name || ''}
                onChange={e => setEditingDevice({ ...editingDevice, device_name: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例如: 智能手表 Pro"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">设备类型</label>
              <select
                value={editingDevice?.device_type || ''}
                onChange={e => setEditingDevice({ ...editingDevice, device_type: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="佩戴式">佩戴式</option>
                <option value="固定式">固定式</option>
                <option value="手持式">手持式</option>
                <option value="其他">其他</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">设备品牌</label>
              <input
                type="text"
                value={editingDevice?.brand || ''}
                onChange={e => setEditingDevice({ ...editingDevice, brand: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例如: 老年卫士"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">设置归属老人</label>
              <select
                value={editingDevice?.elderly_id || ''}
                onChange={e => setEditingDevice({ ...editingDevice, elderly_id: e.target.value || null })}
                className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">未绑定 (空闲)</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name} ({user.phone})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-50">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-800">监控服务状态</h4>
                <p className="text-[10px] text-slate-500">开启后将实时接收设备上传的心率与位置信息</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingDevice?.is_online || false}
                  onChange={e => setEditingDevice({ ...editingDevice, is_online: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DeviceManagement;
