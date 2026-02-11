import React, { useState, useEffect } from 'react';
import { Bell, Search, Menu, LogOut, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAlerts } from '../services/alertService';
import { getElderlyList } from '../services/elderlyService';
import { logout, getCurrentUser } from '../services/authService';
import { AlertStatus, User } from '../types';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [hasPendingAlerts, setHasPendingAlerts] = useState(false);
  
  // 搜索联想状态
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const currentUser = getCurrentUser();

  useEffect(() => {
      const fetchData = async () => {
          try {
              const [usersData, alertsData] = await Promise.all([
                  getElderlyList(),
                  getAlerts()
              ]);
              setUsers(usersData);
              setHasPendingAlerts(alertsData.some(alert => alert.status === AlertStatus.PENDING));
          } catch (error) {
              console.error('Failed to fetch header data:', error);
          }
      };
      fetchData();
      
      // Poll for alerts
      const interval = setInterval(async () => {
          try {
              const alerts = await getAlerts();
              setHasPendingAlerts(alerts.some(alert => alert.status === AlertStatus.PENDING));
          } catch (e) {}
      }, 30000);
      return () => clearInterval(interval);
  }, []);

  // 监听输入变化进行搜索联想
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = users.filter(u => 
        u.name.includes(searchTerm.trim()) || 
        u.address.includes(searchTerm.trim())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, users]);

  // 处理回车搜索
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      // 优先跳转到第一个联想结果，或者精确匹配
      const user = suggestions.length > 0 ? suggestions[0] : users.find(u => u.name.includes(searchTerm.trim()));
      
      if (user) {
        navigate(`/history/${user.id}`);
        setSearchTerm('');
        setShowSuggestions(false);
      } else {
        alert('未找到相关老人档案');
      }
    }
  };

  // 点击联想项
  const handleSuggestionClick = (userId: string) => {
      navigate(`/history/${userId}`);
      setSearchTerm('');
      setShowSuggestions(false);
  };

  // 处理失焦 (使用延时以允许点击事件触发)
  const handleBlur = () => {
      setTimeout(() => {
          setShowSuggestions(false);
      }, 200);
  };

  const handleLogout = () => {
      logout();
      navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center">
          <button onClick={onMenuClick} className="mr-4 md:hidden text-slate-500 hover:text-slate-700">
              <Menu size={24} />
          </button>
          
          <div className="relative hidden md:block group z-50">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input 
                type="text" 
                placeholder="搜索老人姓名..." 
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                }}
                onFocus={() => {
                    if(searchTerm.trim()) setShowSuggestions(true);
                }}
                onBlur={handleBlur}
                onKeyDown={handleSearch}
                className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors w-64"
            />
            
            {/* 搜索联想下拉框 */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="py-2">
                        <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">匹配结果</div>
                        {suggestions.map(user => (
                            <div 
                                key={user.id}
                                onClick={() => handleSuggestionClick(user.id)}
                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center transition-colors group/item"
                            >
                                <div className="w-8 h-8 rounded-full bg-slate-200 mr-3 overflow-hidden flex-shrink-0">
                                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover"/>
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-700 group-hover/item:text-blue-700">{user.name}</div>
                                    <div className="text-xs text-slate-400 truncate w-40">{user.address}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
      </div>

      <div className="flex items-center space-x-4">
        <button 
            onClick={() => navigate('/alerts')}
            className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
        >
          <Bell size={20} />
          {hasPendingAlerts && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
          )}
        </button>
        
        <div className="flex items-center pl-4 border-l border-slate-200">
            <div className="text-right mr-3 hidden md:block">
                <div className="text-sm font-bold text-slate-800">{currentUser?.username || '管理员'}</div>
                <div className="text-xs text-slate-500">超级管理员</div>
            </div>
            <div className="relative group cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
                    <UserIcon size={18} />
                </div>
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden hidden group-hover:block animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="py-1">
                        <button 
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-rose-600 flex items-center"
                        >
                            <LogOut size={16} className="mr-2" />
                            退出登录
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;