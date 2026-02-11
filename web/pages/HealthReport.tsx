
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Clock, Footprints, Zap, Coffee, FileText, AlertCircle, Calendar, Accessibility, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { getHealthReport } from '../services/statsService';
import { getElderlyById } from '../services/elderlyService';
import { ActivityStatus, ACTIVITY_LABELS, HealthReport as HealthReportType, User } from '../types';

const HealthReport: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [report, setReport] = useState<HealthReportType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const [userData, reportData] = await Promise.all([
                    getElderlyById(id),
                    getHealthReport(id)
                ]);
                setUser(userData);
                setReport(reportData);
            } catch (error) {
                console.error("Failed to fetch health report data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) {
        return <div className="p-8 text-center text-slate-500">加载中...</div>;
    }

    if (!user || !report) {
        return <div className="p-8 text-center text-slate-500">未找到用户档案或报告</div>;
    }

    const getActivityIcon = (type: ActivityStatus) => {
        switch (type) {
            case ActivityStatus.WALKING: return <Footprints size={18} />;
            case ActivityStatus.JOGGING:
            case ActivityStatus.RUNNING: return <Zap size={18} />;
            case ActivityStatus.SITTING: return <Coffee size={18} />;
            case ActivityStatus.STANDING: return <Accessibility size={18} />;
            case ActivityStatus.GOING_UPSTAIRS: return <ArrowUpCircle size={18} />;
            case ActivityStatus.GOING_DOWNSTAIRS: return <ArrowDownCircle size={18} />;
            default: return <Activity size={18} />;
        }
    };

    const getActivityColor = (type: ActivityStatus) => {
        switch (type) {
            case ActivityStatus.RUNNING: return 'bg-orange-100 text-orange-600 border-orange-200';
            case ActivityStatus.WALKING: return 'bg-emerald-100 text-emerald-600 border-emerald-200';
            case ActivityStatus.SITTING:
            case ActivityStatus.STANDING:
            case ActivityStatus.STILL: return 'bg-slate-100 text-slate-600 border-slate-200';
            case ActivityStatus.GOING_UPSTAIRS:
            case ActivityStatus.GOING_DOWNSTAIRS: return 'bg-blue-100 text-blue-600 border-blue-200';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    const calculateEndTime = (startTime: string, duration: string) => {
        try {
            let minutes = 0;
            if (duration.includes('小时')) {
                const parts = duration.split('小时');
                minutes += parseInt(parts[0] || '0') * 60;
                if (parts[1] && parts[1].includes('分钟')) {
                    minutes += parseInt(parts[1].replace('分钟', '') || '0');
                }
            } else {
                minutes = parseInt(duration.replace('分钟', '') || '0');
            }
            const [h, m] = startTime.split(':').map(Number);
            const totalMinutes = h * 60 + m + minutes;
            const endH = Math.floor(totalMinutes / 60) % 24;
            const endM = totalMinutes % 60;
            return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
        } catch (e) { return ''; }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-slate-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{user.name} - 运动状态报告</h1>
                    <p className="text-slate-500 text-sm">基于手机重力感应与陀螺仪分析</p>
                </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl p-6 text-white shadow-md">
                <h3 className="text-lg font-bold mb-2">状态分析摘要</h3>
                <p className="opacity-90 leading-relaxed">{report.summary}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center text-blue-600">
                        <Clock className="mr-2" size={20} />
                        <h3 className="font-bold text-slate-800 text-lg">智能状态识别时间轴 (当日)</h3>
                    </div>
                    <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">手机高频采样识别</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {report.activityTimeline.map((item, index) => (
                        <div key={index} className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:shadow-md transition-all group">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 border-2 transition-transform group-hover:scale-110 ${getActivityColor(item.status)}`}>
                                {getActivityIcon(item.status)}
                            </div>
                            <div className="flex-1 flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-slate-800">{ACTIVITY_LABELS[item.status]}</div>
                                    <div className="text-xs text-slate-400 mt-0.5">持续时长: {item.duration}</div>
                                </div>
                                <div className="text-sm text-slate-500 font-bold bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
                                    {item.time} - {calculateEndTime(item.time, item.duration)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-8 pt-4 border-t border-slate-50">
                    <button onClick={() => navigate(`/history/${user.id}`)} className="px-6 py-2 bg-slate-100 text-slate-600 rounded-full text-sm font-bold hover:bg-blue-600 hover:text-white transition-all">
                        查看历史动作详情表 &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HealthReport;
