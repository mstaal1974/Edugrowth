import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: string;
  icon: LucideIcon;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, trend, icon: Icon, color }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
          {trend && (
             <p className="text-xs mt-2 font-medium text-emerald-600 bg-emerald-50 inline-block px-2 py-0.5 rounded-full">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-white`}>
            {/* The icon color needs to be set via text class since background uses bg-opacity */}
            <div className={color.replace('bg-', 'text-')}>
                <Icon size={24} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
