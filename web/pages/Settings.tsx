
import React, { useState } from 'react';
import { Save, Bell, Shield, Smartphone, User, Clock, AlertTriangle, Battery, Mail } from 'lucide-react';

const Settings: React.FC = () => {
  const [fallSensitivity, setFallSensitivity] = useState(50);
  const [staticTimeoutHours, setStaticTimeoutHours] = useState(3);
  const [staticTimeoutMinutes, setStaticTimeoutMinutes] = useState(0);
  const [batteryThreshold, setBatteryThreshold] = useState(20);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">系统设置</h1>
          <p className="text-slate-500 mt-1">配置 9 种动作检测灵敏度与报警阈值</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors text-sm font-medium flex items-center">
            <Save size={18} className="mr-2" />
            保存全局配置
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center">
              <Shield className="text-blue-600 mr-3" size={24} />
              <h2 className="text-lg font-bold text-slate-800">手机传感器算法参数</h2>
          </div>
          <div className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                          <AlertTriangle size={16} className="mr-2 text-slate-400"/>
                          跌倒识别灵敏度 (重力异常)
                      </label>
                      <div className="relative">
                          <input type="number" min="1" max="100" value={fallSensitivity} onChange={(e) => setFallSensitivity(Number(e.target.value))} className="w-full pl-3 pr-12 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">手机跌落或剧烈冲击时触发报警的敏感程度。</p>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                          <Battery size={16} className="mr-2 text-slate-400"/>
                          手机低电量报警阈值
                      </label>
                      <div className="relative">
                          <input type="number" min="1" max="100" value={batteryThreshold} onChange={(e) => setBatteryThreshold(Number(e.target.value))} className="w-full pl-3 pr-12 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                      </div>
                  </div>
              </div>

              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                      <Clock size={16} className="mr-2 text-slate-400"/>
                      静止超时报警时长 (手机无位移检测)
                  </label>
                  <div className="flex gap-4">
                      <div className="relative flex-1">
                          <input type="number" value={staticTimeoutHours} onChange={(e) => setStaticTimeoutHours(parseInt(e.target.value) || 0)} className="w-full pl-3 pr-14 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">小时</span>
                      </div>
                      <div className="relative flex-1">
                          <input type="number" value={staticTimeoutMinutes} onChange={(e) => setStaticTimeoutMinutes(parseInt(e.target.value) || 0)} className="w-full pl-3 pr-14 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">分钟</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center">
              <Bell className="text-amber-500 mr-3" size={24} />
              <h2 className="text-lg font-bold text-slate-800">通知策略</h2>
          </div>
          <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div><h4 className="text-sm font-bold text-slate-800">手机强力震动提醒</h4><p className="text-xs text-slate-500">检测到异常时，监护人手机APP产生持续震动</p></div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-transparent hover:border-blue-100 transition-colors">
                  <div>
                      <h4 className="text-sm font-bold text-slate-800">跌倒短信紧急报警</h4>
                      <p className="text-xs text-slate-500">检测到异常跌倒后，自动向所有关联监护人发送告警短信</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
              </div>
          </div>
      </div>
    </div>
  );
};

export default Settings;
