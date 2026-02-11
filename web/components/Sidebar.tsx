
import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BellRing,
  Settings,
  Activity,
  LogOut,
  Map,
  History,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { logout } from '../services/authService';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard', path: '/dashboard', label: '实时监控', icon: LayoutDashboard },
    { id: 'elderly', path: '/elderly', label: '老人档案', icon: Users },
    { id: 'guardians', path: '/guardians', label: '监护人管理', icon: ShieldCheck },
    { id: 'devices', path: '/devices', label: '设备管理', icon: Smartphone },
    { id: 'alerts', path: '/alerts', label: '报警记录', icon: BellRing },
    { id: 'history', path: '/history', label: '历史数据', icon: History },
    { id: 'map', path: '/map', label: '位置追踪', icon: Map },
    { id: 'settings', path: '/settings', label: '系统设置', icon: Settings },
  ];

  const isActive = (path: string) => {
    // Exact match for most, but history might have parameters
    if (path === '/history') {
      return location.pathname.startsWith('/history');
    }
    return location.pathname === path;
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-full flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <Activity className="text-blue-600 w-8 h-8 mr-3" />
        <span className="text-xl font-bold text-slate-800 tracking-tight">老年卫士</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={onClose}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <Icon size={20} className={`mr-3 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors"
        >
          <LogOut size={20} className="mr-3 text-slate-400 group-hover:text-rose-500" />
          退出登录
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
