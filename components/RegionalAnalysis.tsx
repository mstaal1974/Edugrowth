import React, { useState, useMemo } from 'react';
import { DashboardData } from '../types';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { isMonthInPeriod } from '../services/dataProcessor';

interface Props {
  data: DashboardData;
  yearBasis: 'calendar' | 'financial';
  selectedYear: string;
}

const RegionalAnalysis: React.FC<Props> = ({ data, yearBasis, selectedYear }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>(data.regions[0]?.region || '');

  const regionUnits = useMemo(() => 
    data.units.filter(u => u.region === selectedRegion), 
  [data.units, selectedRegion]);

  const regionData = data.regions.find(r => r.region === selectedRegion);

  // Recalculate totals based on filter
  const regionStats = useMemo(() => {
    let totalRevenue = 0;
    let totalUnits = 0;
    let totalBudget = 0;
    const unitBreakdown: { code: string, count: number }[] = [];

    regionUnits.forEach(u => {
        let uUnits = 0;
        let uRev = 0;
        u.monthlyData.forEach(md => {
            if (isMonthInPeriod(md.dateObj, yearBasis, selectedYear)) {
                uUnits += md.units;
                uRev += md.revenue;
            }
        });
        totalRevenue += uRev;
        totalUnits += uUnits;
        unitBreakdown.push({ code: u.code, count: uUnits });
    });
    
    // Calculate Budget for period
    if (regionData) {
        regionData.monthlyData.forEach(md => {
             // We need date object to filter. Using a lookup or simple parse
             // Assuming months array in data has dates, let's find the matching month index or use explicit date if we added it to region summary.
             // Simpler: find the unit monthly data that matches
             const unitMd = regionUnits[0]?.monthlyData.find(uMd => uMd.month === md.month);
             if (unitMd && isMonthInPeriod(unitMd.dateObj, yearBasis, selectedYear)) {
                 totalBudget += md.budget;
             }
        });
    }

    return { totalRevenue, totalUnits, totalBudget, unitBreakdown };
  }, [regionUnits, regionData, yearBasis, selectedYear]);

  const stackedData = useMemo(() => {
    if (regionUnits.length === 0) return [];
    
    // Use first unit to map months
    return regionUnits[0].monthlyData
        .map((md, idx) => {
            if (!isMonthInPeriod(md.dateObj, yearBasis, selectedYear)) return null;

            const monthPoint: any = { month: md.month };
            regionUnits.forEach(u => {
                monthPoint[u.code] = u.monthlyData[idx].units;
            });
            return monthPoint;
        })
        .filter(item => item !== null);
  }, [regionUnits, yearBasis, selectedYear]);

  const variance = regionStats.totalRevenue - regionStats.totalBudget;
  const varianceColor = variance >= 0 ? "text-emerald-600" : "text-amber-600";
  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  if (!selectedRegion) return <div>No data available</div>;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
        <label className="text-sm font-medium text-slate-700">Select Region:</label>
        <div className="flex space-x-2">
            {data.regions.map(r => (
                <button
                    key={r.region}
                    onClick={() => setSelectedRegion(r.region)}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors font-medium border ${selectedRegion === r.region ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                    {r.region}
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Detail Card */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 col-span-1">
             <h3 className="text-xl font-bold text-slate-900 mb-2">{selectedRegion} Summary</h3>
             <p className="text-xs text-slate-500 mb-4 font-semibold uppercase">{selectedYear === 'All' ? 'All Time' : selectedYear}</p>
             <div className="space-y-4 mt-6">
                 <div>
                    <p className="text-slate-500 text-sm">Forecast Revenue</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(regionStats.totalRevenue)}
                    </p>
                 </div>
                 {regionStats.totalBudget > 0 && (
                     <div>
                        <p className="text-slate-500 text-sm">Budget Target</p>
                        <p className="text-lg font-semibold text-slate-700">
                            {new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(regionStats.totalBudget)}
                        </p>
                        <p className={`text-sm font-medium ${varianceColor} mt-1`}>
                            {variance >= 0 ? '+' : ''}{new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', notation: 'compact' }).format(variance)} vs Budget
                        </p>
                     </div>
                 )}
                 <div className="pt-4 border-t border-slate-100">
                    <p className="text-slate-500 text-sm">Total Acquired Units</p>
                    <p className="text-2xl font-bold text-emerald-600">
                        {regionStats.totalUnits.toLocaleString()}
                    </p>
                 </div>
                 <div className="pt-4 border-t border-slate-100">
                    <p className="text-slate-500 text-sm mb-2">Unit Type Breakdown</p>
                    {regionStats.unitBreakdown.map(u => (
                        <div key={u.code} className="flex justify-between items-center py-1">
                            <span className="text-sm font-medium text-slate-700">{u.code}</span>
                            <span className="text-sm text-slate-500">{u.count} units</span>
                        </div>
                    ))}
                 </div>
             </div>
         </div>

         {/* Chart */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 col-span-1 lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Unit Acquisition by Type (Monthly)</h3>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stackedData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} minTickGap={20} />
                        <YAxis fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend />
                        {regionUnits.map((u, i) => (
                            <Line 
                                key={u.code} 
                                type="monotone" 
                                dataKey={u.code} 
                                stroke={colors[i % colors.length]} 
                                strokeWidth={2}
                                dot={false}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
};

export default RegionalAnalysis;
