import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string; // Tailwind bg class for icon container
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, colorClass }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${colorClass} text-white shadow-sm`}>
        <Icon size={24} />
      </div>
    </div>
  );
};

export default StatCard;