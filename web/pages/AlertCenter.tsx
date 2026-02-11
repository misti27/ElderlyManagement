import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertOctagon,
  MapPin,
  Eye,
  CheckSquare
} from 'lucide-react';
import { getAlerts, updateAlertStatus } from '../services/alertService';
import { getElderlyList } from '../services/elderlyService';
import { AlertLevel, AlertStatus, AlertType, Alert, User } from '../types';

const AlertCenter: React.FC = () => {
  // Use state to trigger re-renders when alerts are updated
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const fetchData = async () => {
    try {
      const [alertsData, usersData] = await Promise.all([
        getAlerts(),
        getElderlyList()
      ]);
      setAlerts(alertsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (id: string, newStatus: AlertStatus) => {
    try {
      await updateAlertStatus(id, newStatus.toString(), '系统管理员');
      fetchData(); // Reload data
    } catch (error) {
      console.error('Failed to update alert:', error);
      alert('更新状态失败');
    }
  };

  // Helper to find user name by id
  const getUserName = (id: string) => {
    const user = users.find(u => u.id === id);
    return user ? user.name : id;
  };

  const getStatusBadge = (status: AlertStatus) => {
    switch (status) {
      case AlertStatus.RESOLVED:
        return (
          <div className="flex items-center text-emerald-600 text-sm">
            <CheckCircle size={16} className="mr-1" />
            <span>已解决</span>
          </div>
        );
      case AlertStatus.CONFIRMED:
        return (
          <div className="flex items-center text-blue-600 text-sm font-medium">
            <CheckSquare size={16} className="mr-1" />
            <span>已确认</span>
          </div>
        );
      default: // PENDING
        return (
          <div className="flex items-center text-rose-600 text-sm font-medium">
            <AlertOctagon size={16} className="mr-1" />
            <span>待处理</span>
          </div>
        );
    }
  };

  const getTypeText = (type: AlertType) => {
    const map: Record<string, string> = {
      [AlertType.FALL]: '跌倒检测',
      [AlertType.HEART_RATE_ABNORMAL]: '心率异常',
      [AlertType.SOS]: 'SOS求救',
      [AlertType.BATTERY_LOW]: '低电量',
      [AlertType.GEOFENCE]: '地理围栏'
    };
    return map[type] || type;
  }

  // 根据类型返回对应的颜色样式
  const getTypeColorClass = (type: AlertType) => {
    switch (type) {
      case AlertType.FALL:
      case AlertType.SOS:
        return "text-rose-600 font-bold"; // 严重：红色
      case AlertType.HEART_RATE_ABNORMAL:
        return "text-amber-500 font-bold"; // 警告：橙色
      case AlertType.BATTERY_LOW:
      case AlertType.GEOFENCE:
      default:
        return "text-blue-600 font-bold"; // 提示：蓝色
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">报警记录管理</h1>
          <p className="text-slate-500 mt-1">查看并处理系统监测到的所有异常事件</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 flex items-center shadow-sm">
            <Filter size={18} className="mr-2" />
            筛选
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700">
            导出记录
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="搜索老人姓名、报警ID或位置..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">报警对象</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">类型</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">详情内容</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">时间/地点</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">状态</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {alerts.map((alert) => {
                const user = users.find(u => u.id === alert.userId);
                return (
                  <tr key={alert.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {user ? (
                            <img src={user.avatarUrl} alt={alert.userName} className="h-10 w-10 rounded-full object-cover border border-slate-200" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                              {alert.userName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{alert.userName}</div>
                          <div className="text-sm text-slate-500">ID: {alert.userId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${getTypeColorClass(alert.type)}`}>
                        {getTypeText(alert.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 max-w-xs truncate">{alert.message}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{new Date(alert.timestamp).toLocaleString()}</div>
                      <div className="text-sm text-slate-500 flex items-center mt-1">
                        <MapPin size={12} className="mr-1" />
                        {alert.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(alert.status)}
                      {alert.resolvedBy && (
                        <div className="text-xs text-slate-400 mt-1">处理人: {alert.resolvedBy}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {alert.status === AlertStatus.PENDING && (
                          <button
                            onClick={() => handleAction(alert.id, AlertStatus.CONFIRMED)}
                            className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-md hover:bg-blue-100 border border-blue-200 transition-colors"
                          >
                            <CheckSquare size={14} className="mr-1" />
                            确认报警
                          </button>
                        )}
                        {alert.status === AlertStatus.CONFIRMED && (
                          <button
                            onClick={() => handleAction(alert.id, AlertStatus.RESOLVED)}
                            className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-md hover:bg-emerald-100 border border-emerald-200 transition-colors"
                          >
                            <CheckCircle size={14} className="mr-1" />
                            标记解决
                          </button>
                        )}
                        {alert.status === AlertStatus.RESOLVED && (
                          <span className="text-slate-400 text-xs px-2">已归档</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 border-t border-slate-200 flex items-center justify-between sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-700">
                显示 <span className="font-medium">1</span> 到 <span className="font-medium">5</span> 条，共 <span className="font-medium">5</span> 条结果
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50">
                  上一页
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-blue-50 text-sm font-medium text-blue-600 hover:bg-blue-100">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50">
                  下一页
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertCenter;