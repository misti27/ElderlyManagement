
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Calendar,
    User,
    PieChart as PieChartIcon,
    AlertTriangle,
    Clock,
    ChevronDown,
    Filter,
    Activity
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getHistoryStats, getHealthReport } from '../services/statsService';
import { getElderlyList } from '../services/elderlyService';
import { getDeviceList } from '../services/deviceService';
import { AlertStatus, ActivityStatus, ACTIVITY_LABELS, User as ElderlyUser, Device, HistoryStats, HealthReport } from '../types';

type TimeRange = 'yesterday' | 'week' | 'month';

const History: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [users, setUsers] = useState<ElderlyUser[]>([]);
    const [devices, setDevices] = useState<Device[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [timeRange, setTimeRange] = useState<TimeRange>('week');
    const [stats, setStats] = useState<HistoryStats | null>(null);
    const [report, setReport] = useState<HealthReport | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [usersData, devicesData] = await Promise.all([
                    getElderlyList(),
                    getDeviceList()
                ]);
                setUsers(usersData);
                setDevices(devicesData);

                if (id) {
                    setSelectedUserId(id);
                } else if (usersData.length > 0) {
                    setSelectedUserId(usersData[0].id);
                }
            } catch (error) {
                console.error('Failed to fetch initial data:', error);
            }
        };
        fetchInitialData();
    }, [id]);

    useEffect(() => {
        if (!selectedUserId) return;

        const fetchHistoryData = async () => {
            setLoading(true);
            try {
                const [statsData, reportData] = await Promise.all([
                    getHistoryStats(selectedUserId, timeRange),
                    getHealthReport(selectedUserId)
                ]);
                setStats(statsData);
                setReport(reportData);
            } catch (error) {
                console.error('Failed to fetch history data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistoryData();
    }, [selectedUserId, timeRange]);

    const currentDevice = useMemo(() =>
        devices.find(d => d.elderly_id === selectedUserId),
        [devices, selectedUserId]);

    // 动态计算时长占比 (基于流水数据)
    const dynamicChartData = useMemo(() => {
        if (!report) return [];
        const timeline = report.activityTimeline;
        const durationMap: Record<string, number> = {};

        const timeToMinutes = (t: string) => {
            const [h, m] = t.split(':').map(Number);
            return h * 60 + m;
        };

        for (let i = 0; i < timeline.length; i++) {
            const current = timeline[i];
            const next = timeline[i + 1];

            const startMin = timeToMinutes(current.time);
            // 如果是最后一项，计算到 18:00 (模拟)
            const endMin = next ? timeToMinutes(next.time) : 1080;

            const duration = endMin - startMin;
            const label = ACTIVITY_LABELS[current.status];
            durationMap[label] = (durationMap[label] || 0) + duration;
        }

        // 定义图表颜色映射，与列表保持一致
        const colors: Record<string, string> = {
            '跌倒': '#ef4444',     // 红色 (Red-500)
            '静止': '#1e293b',     // 黑色 (Slate-800)
            '坐下': '#3b82f6',     // 蓝色 (Blue-500)
            '站立': '#3b82f6',     // 蓝色 (Blue-500)
            '正常行走': '#10b981', // 绿色 (Emerald-500)
            '慢跑': '#10b981',     // 绿色 (Emerald-500)
            '快跑': '#10b981',     // 绿色 (Emerald-500)
            '上楼': '#10b981',     // 绿色 (Emerald-500)
            '下楼': '#10b981',     // 绿色 (Emerald-500)
        };

        return Object.entries(durationMap).map(([name, value]) => ({
            name,
            value,
            color: colors[name] || '#94a3b8'
        }));
    }, [report]);

    const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newId = e.target.value;
        setSelectedUserId(newId);
        navigate(`/history/${newId}`, { replace: true });
    };

    const getStatusText = (status: AlertStatus) => {
        switch (status) {
            case AlertStatus.PENDING:
                return <span className="flex items-center text-rose-600 text-sm justify-end"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2"></span>待处理</span>;
            case AlertStatus.RESOLVED:
                return <span className="flex items-center text-emerald-600 text-sm justify-end"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>已解决</span>;
            case AlertStatus.CONFIRMED:
                return <span className="flex items-center text-blue-600 text-sm justify-end"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>已确认</span>;
            default: return null;
        }
    };

    const getActivityTextColor = (status: ActivityStatus) => {
        const colorMap: Record<ActivityStatus, string> = {
            [ActivityStatus.FALLEN]: 'text-rose-600',       // 红色
            [ActivityStatus.STILL]: 'text-slate-800',       // 黑色
            [ActivityStatus.SITTING]: 'text-blue-600',      // 蓝色
            [ActivityStatus.STANDING]: 'text-blue-600',     // 蓝色
            [ActivityStatus.WALKING]: 'text-emerald-600',   // 绿色
            [ActivityStatus.JOGGING]: 'text-emerald-600',   // 绿色
            [ActivityStatus.RUNNING]: 'text-emerald-600',   // 绿色
            [ActivityStatus.GOING_UPSTAIRS]: 'text-emerald-600',   // 绿色
            [ActivityStatus.GOING_DOWNSTAIRS]: 'text-emerald-600', // 绿色
            [ActivityStatus.UNKNOWN]: 'text-slate-400'
        };
        return colorMap[status] || 'text-slate-600';
    };

    if (loading && !stats) {
        return <div className="p-6 text-center text-slate-500">加载中...</div>;
    }

    return (
        <div className="space-y-6 flex flex-col min-h-full pb-10">
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">历史数据</h1>
                    <p className="text-slate-500 text-sm mt-1">分析监控数据回传的运动模式与预警轨迹</p>
                </div>
                <button className="flex items-center text-sm font-medium text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 shadow-sm transition-all">
                    <Filter size={16} className="mr-2" />
                    导出报告
                </button>
            </div>

            {/* Row 1: Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-48">
                    <div className="flex items-center text-slate-800 font-bold text-xs mb-4">
                        <User size={16} className="mr-2 text-blue-600" /> 老人与设备
                    </div>
                    <div className="space-y-6">
                        <div className="relative">
                            <select value={selectedUserId} onChange={handleUserChange} className="w-full appearance-none pl-4 pr-10 py-3 bg-slate-100 border border-slate-100 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                        <div className="flex items-center justify-between px-1">
                            <span className="text-sm text-slate-400">监测设备</span>
                            {/* 改为深黑色字体 (Slate-950) */}
                            <span className="text-sm text-slate-950 font-medium">{currentDevice?.device_name || '未绑定设备'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-48 justify-between">
                    <div className="flex items-center text-slate-800 font-bold text-xs mb-3">
                        <Calendar size={16} className="mr-2 text-indigo-600" /> 回溯范围
                    </div>
                    <div className="flex-1 flex flex-col justify-center gap-1.5">
                        {['yesterday', 'week', 'month'].map((r, idx) => (
                            <button key={r} onClick={() => setTimeRange(r as TimeRange)} className={`w-full py-2.5 rounded-xl text-sm transition-all border ${timeRange === r ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm' : 'text-slate-500 border-slate-100 bg-slate-50/50 hover:bg-slate-100'}`}>
                                {['昨天', '过去7天', '过去一月'][idx]}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-48 justify-between">
                    <div className="flex items-center text-slate-800 font-bold text-xs mb-3">
                        <AlertTriangle size={16} className="mr-2 text-rose-500" /> 报警统计
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <span className="text-6xl font-black text-slate-800 tracking-tighter">{stats?.totalAlerts || 0}</span>
                        <span className="text-lg font-bold text-slate-400 ml-1">次</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-48">
                    <div className="flex items-center text-slate-800 font-bold text-xs mb-1">
                        <PieChartIcon size={16} className="mr-2 text-emerald-500" /> 时长占比
                    </div>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dynamicChartData}
                                    cx="50%" cy="40%"
                                    innerRadius={25} outerRadius={38}
                                    paddingAngle={2} dataKey="value" stroke="none"
                                >
                                    {dynamicChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip formatter={(value: number) => [`${value} 分钟`, '持续时间']} />
                                <Legend verticalAlign="bottom" height={15} iconSize={4} wrapperStyle={{ fontSize: '10px', fontWeight: '500' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Row 2: Consistent Header Font Sizes and No Bold Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* 1. Alert History */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="text-xs font-bold text-slate-800 flex items-center">
                            <Clock size={16} className="mr-2 text-slate-400" /> 报警历史记录
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead>
                                <tr className="bg-slate-50/20">
                                    <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">发生时间</th>
                                    <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">报警内容</th>
                                    <th className="px-5 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest pr-10">当前状态</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {stats?.alerts && stats.alerts.length > 0 ? (
                                    stats.alerts.map(alert => (
                                        <tr key={alert.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(alert.timestamp).toLocaleString()}</td>
                                            <td className="px-5 py-4 text-sm text-slate-800">{alert.message}</td>
                                            <td className="px-5 py-4 pr-10">
                                                <div className="flex justify-end pr-0">
                                                    {getStatusText(alert.status)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={3} className="px-5 py-8 text-center text-sm text-slate-400 italic">时段内无报警记录</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 2. Activity Timeline - Colorized and Clean */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="text-xs font-bold text-slate-800 flex items-center">
                            <Activity size={16} className="mr-2 text-slate-400" /> 动作识别流水
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[480px]">
                        {report?.activityTimeline && report.activityTimeline.map((item, idx) => {
                            const nextItem = report.activityTimeline[idx + 1];
                            const timeRangeStr = nextItem ? `${item.time} - ${nextItem.time}` : `${item.time} - 至今`;

                            return (
                                <div key={idx} className="flex items-center px-5 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                                    <div className="w-1/3 text-sm text-slate-400 tracking-tight">
                                        {timeRangeStr}
                                    </div>
                                    <div className="flex-1">
                                        <span className={`text-sm ${getActivityTextColor(item.status)}`}>
                                            {ACTIVITY_LABELS[item.status]}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default History;
