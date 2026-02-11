import React, { useState, useMemo, useEffect } from 'react';
import { MapPin, Navigation, User, Target, RotateCcw } from 'lucide-react';
import { getElderlyList } from '../services/elderlyService';
import { getElderlyStatuses } from '../services/statsService';
import { User as ElderlyUser, ElderlyStatus } from '../types';

const MapTracking: React.FC = () => {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [users, setUsers] = useState<ElderlyUser[]>([]);
    const [statuses, setStatuses] = useState<Record<string, ElderlyStatus>>({});

    // 视图状态：控制地图的位移和缩放
    // x, y 是百分比偏移量
    const [viewState, setViewState] = useState({ x: 0, y: 0, scale: 1 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersData, statusesData] = await Promise.all([
                    getElderlyList(),
                    getElderlyStatuses()
                ]);
                setUsers(usersData);
                setStatuses(statusesData);
            } catch (error) {
                console.error('Failed to fetch map data:', error);
            }
        };
        fetchData();
        // Set up polling for real-time updates
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    // 地图参数常量
    const MAP_CONFIG = {
        baseLat: 39.9,
        baseLng: 116.4,
        scaleFactor: 3000
    };

    // 核心算法：将经纬度转换为相对百分比坐标 (0-100)
    const getRelativePosition = (lat: number, lng: number) => {
        const y = 50 - (lat - MAP_CONFIG.baseLat) * MAP_CONFIG.scaleFactor;
        const x = 50 + (lng - MAP_CONFIG.baseLng) * MAP_CONFIG.scaleFactor;
        return { x, y };
    };

    // 点击用户时的处理函数
    const focusOnUser = (userId: string) => {
        const status = statuses[userId];
        if (!status || !status.location) return;

        const { x, y } = getRelativePosition(status.location.latitude, status.location.longitude);

        setSelectedUserId(userId);

        // 计算偏移量：目标是为了让 (x, y) 移动到视口中心 (50, 50)
        // 偏移量 = 50 - 目标坐标
        // 同时放大地图 (scale: 2) 以聚焦
        setViewState({
            x: 50 - x,
            y: 50 - y,
            scale: 1.8
        });
    };

    // 重置地图视图
    const resetView = () => {
        setSelectedUserId(null);
        setViewState({ x: 0, y: 0, scale: 1 });
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-4">
            {/* Sidebar List */}
            <div className="w-full md:w-80 flex flex-col bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex-shrink-0">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h2 className="font-bold text-slate-800 flex items-center">
                        <MapPin className="mr-2 text-blue-600" size={20} />
                        在线设备定位
                    </h2>
                    {selectedUserId && (
                        <button onClick={resetView} className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                            <RotateCcw size={12} className="mr-1" /> 重置
                        </button>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {users.map(user => {
                        const status = statuses[user.id];
                        if (!status) return null;
                        const isSelected = selectedUserId === user.id;

                        return (
                            <div
                                key={user.id}
                                onClick={() => focusOnUser(user.id)}
                                className={`p-3 rounded-lg border transition-all cursor-pointer ${isSelected
                                    ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-100'
                                    : 'hover:bg-slate-50 border-transparent hover:border-slate-200'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <img src={user.avatarUrl} className="w-8 h-8 rounded-full bg-slate-200" alt={user.name} />
                                        <div className="ml-3">
                                            <h4 className={`text-sm font-bold ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                                                {user.name}
                                            </h4>
                                            <p className="text-xs text-slate-500 truncate max-w-[120px]">{status.location.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        {status.isFall && <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-600 text-[10px] font-bold">跌倒</span>}
                                        {isSelected && <Target size={14} className="text-blue-500 animate-pulse" />}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Visual Map Area */}
            <div className="flex-1 bg-slate-200 rounded-xl shadow-inner relative overflow-hidden group">

                {/* Map Container (This layer moves and scales) */}
                <div
                    className="absolute inset-0 w-full h-full transition-transform duration-700 cubic-bezier(0.25, 1, 0.5, 1)"
                    style={{
                        transform: `scale(${viewState.scale}) translate(${viewState.x}%, ${viewState.y}%)`,
                        transformOrigin: 'center center'
                    }}
                >
                    {/* Grid Background (Moves with container) */}
                    <div className="absolute inset-[-100%] w-[300%] h-[300%] opacity-20 pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)',
                            backgroundSize: '40px 40px'
                        }}>
                    </div>

                    {/* Markers */}
                    {users.map(user => {
                        const status = statuses[user.id];
                        if (!status || !status.location) return null;
                        const { x, y } = getRelativePosition(status.location.latitude, status.location.longitude);
                        const isSelected = selectedUserId === user.id;

                        return (
                            <div
                                key={user.id}
                                className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer hover:z-20 transition-all duration-300 ${isSelected ? 'z-30 scale-110' : 'z-10'}`}
                                style={{ top: `${y}%`, left: `${x}%` }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    focusOnUser(user.id);
                                }}
                            >
                                <div className={`relative p-1 rounded-full shadow-lg border-2 border-white transition-colors ${status.isFall ? 'bg-rose-500' : (isSelected ? 'bg-blue-600' : 'bg-slate-500')
                                    }`}>
                                    {status.isFall && <span className="absolute -inset-1 rounded-full bg-rose-400 opacity-75 animate-ping"></span>}
                                    <User className="text-white w-5 h-5 relative z-10" />
                                </div>

                                {/* Label Bubble */}
                                <div className={`mt-2 px-3 py-1.5 rounded-lg shadow-md text-xs font-bold whitespace-nowrap transition-all ${isSelected
                                    ? 'bg-blue-600 text-white -translate-y-1'
                                    : 'bg-white/90 text-slate-800'
                                    }`}>
                                    {user.name}
                                    {isSelected && <span className="block text-[10px] opacity-80 font-normal">{status.location.address}</span>}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Map UI Overlay (Static Controls) */}
                <div className="absolute bottom-4 right-4 bg-white/90 px-3 py-1 rounded text-xs text-slate-500 pointer-events-none backdrop-blur-sm border border-slate-200">
                    模拟地图视图
                </div>

                <div className="absolute top-4 right-4 flex flex-col space-y-2">
                    <button
                        onClick={resetView}
                        className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                        title="重置视图"
                    >
                        <Navigation size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MapTracking;