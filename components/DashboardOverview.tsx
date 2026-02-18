import React, { useMemo } from 'react';
import { DashboardData } from '../types';
import StatsCard from './StatsCard';
import { DollarSign, Box, Map, Target, CreditCard, Activity, Landmark } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Line, ComposedChart, ReferenceLine, Legend
} from 'recharts';
import { isMonthInPeriod } from '../services/dataProcessor';

interface Props {
  data: DashboardData;
  yearBasis: 'calendar' | 'financial';
  selectedYear: string;
}

const DashboardOverview: React.FC<Props> = ({ data, yearBasis, selectedYear }) => {
  const { regions, units, operationalFinancials } = data;

  // 1. Filter Data based on selected Period
  const filteredAggregates = useMemo(() => {
    let totalRevenue = 0;
    let totalUnits = 0;
    let totalBudget = 0;
    let totalPayments = 0;
    let totalNetCashflow = 0;
    let currentCashPosition = 0;
    
    const regionStats: { region: string; totalRevenue: number; totalUnits: number; totalBudget: number }[] = [];

    // Aggregate regional totals
    regions.forEach(r => {
        let rRevenue = 0;
        let rUnits = 0;
        let rBudget = 0;
        
        // Map based on first unit's monthly data structure (assuming alignment)
        const firstUnit = units.find(u => u.region === r.region);
        
        if (firstUnit) {
            firstUnit.monthlyData.forEach((md, idx) => {
                if (isMonthInPeriod(md.dateObj, yearBasis, selectedYear)) {
                    rRevenue += r.monthlyData[idx].revenue;
                    rUnits += r.monthlyData[idx].units;
                    rBudget += r.monthlyData[idx].budget;
                }
            });
        }
        
        totalRevenue += rRevenue;
        totalUnits += rUnits;
        totalBudget += rBudget;
        regionStats.push({ region: r.region, totalRevenue: rRevenue, totalUnits: rUnits, totalBudget: rBudget });
    });

    // Aggregate Operational Totals
    // Find the last month in the selected period to set "Current Cash Position"
    let lastMonthInPeriod: Date | null = null;

    operationalFinancials.forEach(op => {
        if (isMonthInPeriod(op.dateObj, yearBasis, selectedYear)) {
            totalPayments += op.payments;
            totalNetCashflow += op.netCashflow;
            
            // Track latest date to capture closing balance
            if (!lastMonthInPeriod || op.dateObj > lastMonthInPeriod) {
                lastMonthInPeriod = op.dateObj;
                currentCashPosition = op.closingBalance;
            }
        }
    });

    return { totalRevenue, totalUnits, totalBudget, totalPayments, totalNetCashflow, currentCashPosition, regionStats };
  }, [regions, units, operationalFinancials, yearBasis, selectedYear]);

  // 2. Prepare Trend Chart Data
  const chartData = useMemo(() => {
      if (regions.length === 0) return [];
      
      const firstUnit = units[0]; // Reference for dates
      if (!firstUnit) return [];

      return firstUnit.monthlyData
        .map((md, idx) => {
            if (!isMonthInPeriod(md.dateObj, yearBasis, selectedYear)) return null;

            const revenue = regions.reduce((sum, r) => sum + r.monthlyData[idx].revenue, 0);
            const budget = regions.reduce((sum, r) => sum + r.monthlyData[idx].budget, 0);
            
            // Get operational data for this month
            // Assuming index alignment matches operationalFinancials
            const ops = operationalFinancials[idx] || { payments: 0, netCashflow: 0, closingBalance: 0 };
            
            return { 
                month: md.month, 
                revenue, 
                budget, 
                payments: ops.payments,
                netCashflow: ops.netCashflow,
                cashPosition: ops.closingBalance
            };
        })
        .filter(item => item !== null);

  }, [regions, units, operationalFinancials, yearBasis, selectedYear]);

  const topRegion = useMemo(() => {
    if (filteredAggregates.regionStats.length === 0) return { region: 'N/A', totalRevenue: 0 };
    return filteredAggregates.regionStats.reduce((prev, current) => (prev.totalRevenue > current.totalRevenue) ? prev : current);
  }, [filteredAggregates]);

  const variance = filteredAggregates.totalRevenue - filteredAggregates.totalBudget;
  const variancePercent = filteredAggregates.totalBudget > 0 
    ? ((variance / filteredAggregates.totalBudget) * 100).toFixed(1) 
    : 'N/A';
    
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', notation: 'compact' }).format(val);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Forecasted Revenue" 
          value={formatCurrency(filteredAggregates.totalRevenue)} 
          trend={filteredAggregates.totalBudget > 0 ? `${variancePercent}% vs Budget` : 'Total Forecast'} 
          icon={DollarSign} 
          color={variance >= 0 ? "bg-emerald-500" : "bg-amber-500"} 
        />
        <StatsCard 
          title="Total Payments" 
          value={formatCurrency(filteredAggregates.totalPayments)} 
          trend="Operational Outflow" 
          icon={CreditCard} 
          color="bg-rose-500" 
        />
        <StatsCard 
          title="Net Cashflow" 
          value={formatCurrency(filteredAggregates.totalNetCashflow)} 
          trend="Period Cash Movement" 
          icon={Activity} 
          color={filteredAggregates.totalNetCashflow >= 0 ? "bg-blue-500" : "bg-red-500"} 
        />
        <StatsCard 
          title="Closing Cash Position" 
          value={formatCurrency(filteredAggregates.currentCashPosition)} 
          trend="Bank Balance" 
          icon={Landmark} 
          color={filteredAggregates.currentCashPosition >= 0 ? "bg-indigo-500" : "bg-orange-500"} 
        />
      </div>

      {/* Financial Performance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6">
                Financial Performance {selectedYear !== 'All' && `(${selectedYear})`}
            </h3>
            <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} minTickGap={30} />
                
                {/* Left Y Axis for Flow Metrics */}
                <YAxis 
                    yAxisId="left"
                    tickFormatter={(value) => `$${value / 1000}k`} 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                />
                
                {/* Right Y Axis for Cash Position (Stock Metric) */}
                <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(value) => `$${value / 1000}k`} 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                />

                <Tooltip 
                    formatter={(value: number, name: string) => [formatCurrency(value), name]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <ReferenceLine y={0} yAxisId="left" stroke="#94a3b8" />
                
                {/* Net Cashflow as Bar (Left Axis) */}
                <Bar yAxisId="left" dataKey="netCashflow" name="Net Cashflow" fill="#cbd5e1" opacity={0.6} barSize={20} />
                
                {/* Revenue Area (Left Axis) */}
                <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={0.1} 
                    fill="url(#colorRev)" 
                    name="Revenue"
                />
                
                {/* Payments Line (Left Axis) */}
                <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="payments" 
                    stroke="#e11d48" 
                    strokeWidth={2}
                    dot={false}
                    name="Payments"
                />

                {/* Cash Position Line (Right Axis) */}
                <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="cashPosition" 
                    stroke="#4f46e5" 
                    strokeWidth={3}
                    dot={{r: 2}}
                    name="Cash Position"
                />
                
                </ComposedChart>
            </ResponsiveContainer>
            </div>
        </div>

        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <h3 className="text-lg font-bold text-slate-800 mb-6">Cashflow Breakdown</h3>
             <div className="space-y-6">
                 <div>
                     <p className="text-sm text-slate-500 mb-1">Total Revenue</p>
                     <p className="text-xl font-bold text-blue-600">{formatCurrency(filteredAggregates.totalRevenue)}</p>
                     <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                         <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                     </div>
                 </div>
                 
                 <div>
                     <p className="text-sm text-slate-500 mb-1">Total Payments (Expenses)</p>
                     <p className="text-xl font-bold text-rose-600">{formatCurrency(filteredAggregates.totalPayments)}</p>
                     <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                         <div 
                            className="bg-rose-500 h-2 rounded-full" 
                            style={{ width: `${filteredAggregates.totalRevenue > 0 ? Math.min((filteredAggregates.totalPayments / filteredAggregates.totalRevenue) * 100, 100) : 0}%` }}
                        ></div>
                     </div>
                 </div>

                 <div className="pt-4 border-t border-slate-100">
                     <p className="text-sm text-slate-500 mb-1">Net Cashflow</p>
                     <p className={`text-2xl font-bold ${filteredAggregates.totalNetCashflow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                         {formatCurrency(filteredAggregates.totalNetCashflow)}
                     </p>
                     <p className="text-xs text-slate-400 mt-1">Period Total</p>
                 </div>

                 <div className="pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-lg">
                     <p className="text-sm text-slate-500 mb-1">Closing Bank Balance</p>
                     <p className={`text-2xl font-bold ${filteredAggregates.currentCashPosition >= 0 ? 'text-indigo-600' : 'text-orange-600'}`}>
                         {formatCurrency(filteredAggregates.currentCashPosition)}
                     </p>
                 </div>
             </div>
        </div>
      </div>

      {/* Regional Comparison Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue Performance vs Budget</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredAggregates.regionStats} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="region" type="category" width={60} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    cursor={{fill: '#f1f5f9'}}
                />
                <Bar dataKey="totalRevenue" fill="#6366f1" radius={[0, 4, 4, 0]} name="Forecast" barSize={12} />
                <Bar dataKey="totalBudget" fill="#d8b4fe" radius={[0, 4, 4, 0]} name="Budget" barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <h3 className="text-lg font-bold text-slate-800 mb-6">Unit Volume by Region</h3>
           <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredAggregates.regionStats} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="region" type="category" width={60} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="totalUnits" fill="#10b981" radius={[0, 4, 4, 0]} name="Total Units" barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;