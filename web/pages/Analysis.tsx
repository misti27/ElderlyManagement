
import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Activity, AlertTriangle, TrendingUp, Smartphone } from 'lucide-react';
import { getSystemAnalysis } from '../services/statsService';
import { SystemAnalysis as SystemAnalysisType } from '../types';

const Analysis: React.FC = () => {
  const [data, setData] = useState<SystemAnalysisType | null>(null);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const analysis = await getSystemAnalysis();
            setData(analysis);
        } catch (error) {
            console.error('Failed to fetch analysis data:', error);
        }
    };
    fetchData();
  }, []);

  const COLORS = ['#ef4444', '#f59e0b', '#64748b', '#3b82f6'];

  if (!data) {
      return <div className="p-8 text-center text-slate-500">加载中...</div>;
  }

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">智能行为分析</h1>
          <p className="text-slate-500 mt-1">深度挖掘手机端上传的 9 种动作行为统计</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
             <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors text-sm font-medium">生成月度分析报告</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 md:col-span-2">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800 flex items-center">
                      <TrendingUp className="mr-2 text-blue-500" size={20}/>
                      群体平均运动强度 (分值)
                  </h3>
              </div>
              <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.movementIntensityStats}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                          <Tooltip cursor={{fill: '#f8fafc'}} />
                          <Legend />
                          <Bar dataKey="intensity" name="整体活跃度" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="upstairs" name="垂直运动(楼梯)" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800 flex items-center">
                      <AlertTriangle className="mr-2 text-rose-500" size={20}/>
                      异常事件分布
                  </h3>
              </div>
              <div className="h-72 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie data={data.alertTypeDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {data.alertTypeDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                   </ResponsiveContainer>
              </div>
          </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 flex items-center">
                  <Smartphone className="mr-2 text-indigo-500" size={20}/>
                  传感器数据质量分析
              </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {data.sensorQuality.map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-center">
                      <div className="text-xs text-slate-400 mb-1">{item.label}</div>
                      <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default Analysis;
