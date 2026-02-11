
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  AlertTriangle, 
  Activity, 
  Battery, 
  Wifi, 
  MapPin, 
  Download,
  Smartphone
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { getDashboardStats, getElderlyStatuses } from '../services/statsService';
import { getElderlyList } from '../services/elderlyService';
import { ElderlyStatus, ActivityStatus, FallType, FALL_TYPE_LABELS, ACTIVITY_LABELS, DashboardStats, User } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statuses, setStatuses] = useState<Record<string, ElderlyStatus>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
        try {
            const [statsData, statusesData, usersData] = await Promise.all([
                getDashboardStats(),
                getElderlyStatuses(),
                getElderlyList()
            ]);
            setStats(statsData);
            setStatuses(statusesData);
            setUsers(usersData);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };
    fetchDashboardData();
  }, []);

  const handleDownloadReport = () => {
      if (!stats) return;
      const reportData = {
          title: "老年卫士-监测周报",
          generatedAt: new Date().toLocaleString(),
          summary: {
              totalElderly: stats.totalElderly,
              activePhones: stats.activeDevices,
              pendingAlerts: stats.pendingAlerts
          }
      };
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `monitor_report_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
  };

  const getStatusColor = (status: ElderlyStatus) => {
    if (status.isFall) return 'bg-rose-50 border-rose-200';
    if (!status.isOnline) return 'bg-slate-50 border-slate-200';
    return 'bg-white border-slate-100';
  };

  const getStatusBadge = (status: ActivityStatus, isFall: boolean, fallType: FallType) => {
      const baseClasses = "px-3 py-1.5 rounded-full text-xs font-bold flex items-center w-fit shadow-sm border";
      
      if (isFall) {
        return <span className={`${baseClasses} bg-rose-600 text-white border-rose-700 animate-pulse`}>检测到{FALL_TYPE_LABELS[fallType] || '跌倒'}</span>;
      }

      switch(status) {
          case ActivityStatus.STILL:
          case ActivityStatus.SITTING:
          case ActivityStatus.STANDING:
              return <span className={`${baseClasses} bg-slate-100 text-slate-600 border-slate-200`}>{ACTIVITY_LABELS[status]}</span>;
          case ActivityStatus.WALKING:
              return <span className={`${baseClasses} bg-emerald-100 text-emerald-700 border-emerald-200`}>{ACTIVITY_LABELS[status]}</span>;
          case ActivityStatus.JOGGING:
          case ActivityStatus.RUNNING:
              return <span className={`${baseClasses} bg-orange-100 text-orange-700 border-orange-200`}>{ACTIVITY_LABELS[status]}</span>;
          case ActivityStatus.GOING_UPSTAIRS:
          case ActivityStatus.GOING_DOWNSTAIRS:
              return <span className={`${baseClasses} bg-blue-100 text-blue-700 border-blue-200`}>{ACTIVITY_LABELS[status]}</span>;
          default:
              return <span className={`${baseClasses} bg-gray-100 text-gray-500 border-gray-200`}>未知状态</span>;
      }
  };

  if (loading) {
      return <div className="p-6 text-center text-slate-500">加载中...</div>;
  }

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">实时监控看板</h1>
          <p className="text-slate-500 mt-1">智能分析传感器回传的运动状态</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button 
            onClick={handleDownloadReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors text-sm font-medium flex items-center"
          >
            <Download size={16} className="mr-2" />
            下载今日报表
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-shrink-0">
        <StatCard title="在管老人" value={stats?.totalElderly || 0} icon={Users} colorClass="bg-blue-500" />
        <StatCard title="活跃设备" value={stats?.activeDevices || 0} icon={Smartphone} colorClass="bg-emerald-500" />
        <StatCard title="待处理报警" value={stats?.pendingAlerts || 0} icon={AlertTriangle} colorClass="bg-rose-500" />
        <StatCard title="今日状态记录" value={stats?.todayAlerts || 0} icon={Activity} colorClass="bg-indigo-500" />
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        <div className="p-6 pb-2 border-b border-slate-50 flex-shrink-0">
             <h2 className="text-lg font-bold text-slate-800">监控对象实时状态</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-4">
            {users.map(user => {
                const status = statuses[user.id];
                if (!status) return null;

                return (
                <div key={user.id} className={`p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between transition-all hover:shadow-md ${getStatusColor(status)}`}>
                    <div className="flex items-center w-full md:w-3/12 mb-4 md:mb-0">
                        <div className="relative flex-shrink-0">
                            <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${status.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        </div>
                        <div className="ml-3">
                            <h4 className="font-bold text-slate-800 text-sm">{user.name}</h4>
                            <p className="text-[10px] text-slate-400">ID: {user.id}</p>
                        </div>
                    </div>

                    <div className="w-full md:w-3/12 mb-4 md:mb-0 flex items-center">
                            {getStatusBadge(status.activityStatus, status.isFall, status.fallType)}
                    </div>

                    <div className="w-full md:w-3/12 mb-4 md:mb-0 flex items-center">
                        <MapPin size={16} className="text-blue-500 mr-2 flex-shrink-0" />
                        <div>
                            <span className="text-sm text-slate-700 truncate block max-w-[180px]">{status.location.address}</span>
                        </div>
                    </div>

                    <div className="w-full md:w-2/12 mb-4 md:mb-0 flex flex-col items-start md:items-end justify-center space-y-1">
                        <div className={`flex items-center text-[10px] ${status.batteryLevel <= 20 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                            <Battery size={12} className={`mr-1 ${status.batteryLevel <= 20 ? 'text-rose-500' : 'text-slate-400'}`} />
                            电量: {status.batteryLevel}%
                        </div>
                        <div className="flex items-center text-[10px] text-slate-400">
                            <Wifi size={12} className="mr-1 text-slate-400" />
                            网络: 极佳
                        </div>
                    </div>

                    <div className="w-full md:w-auto flex justify-end min-w-[100px]">
                        {status.isFall ? (
                            <button onClick={() => navigate('/alerts')} className="px-4 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg shadow-md hover:bg-rose-700 whitespace-nowrap">处理报警</button>
                        ) : (
                            <button onClick={() => navigate(`/history/${user.id}`)} className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors whitespace-nowrap shadow-sm">分析记录</button>
                        )}
                    </div>
                </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
