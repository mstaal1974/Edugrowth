import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { DashboardData, StaffRole } from '../types';
import { 
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area
} from 'recharts';
import { Users, Calculator, Plus, Trash2, CalendarClock, AlertCircle } from 'lucide-react';

interface Props {
  data: DashboardData;
}

interface HiringEvent {
  id: string;
  roleId: string;
  count: number;
  startMonth: string;
}

// Configuration based on user requirements
const STAFF_ROLES: StaffRole[] = [
  { 
    id: 'trainer', 
    label: 'Trainer', 
    baseWage: 85000, 
    carAllowance: 12000, 
    phoneAllowance: 1200, 
    superRate: 0.12, 
    payrollTaxRate: 0.055 
  },
  { 
    id: 'sales', 
    label: 'Sales Person', 
    baseWage: 100000, 
    carAllowance: 12000, 
    phoneAllowance: 12000, 
    superRate: 0.12, 
    payrollTaxRate: 0.055 
  },
  { 
    id: 'admin', 
    label: 'Administration', 
    baseWage: 67500, 
    carAllowance: 0, 
    phoneAllowance: 0, 
    superRate: 0.12, 
    payrollTaxRate: 0.055 
  },
  { 
    id: 'manager', 
    label: 'Manager', 
    baseWage: 110000, 
    carAllowance: 0, 
    phoneAllowance: 0, 
    superRate: 0.12, 
    payrollTaxRate: 0.055 
  },
  { 
    id: 'snr_manager', 
    label: 'Senior Manager', 
    baseWage: 120000, 
    carAllowance: 0, 
    phoneAllowance: 0, 
    superRate: 0.12, 
    payrollTaxRate: 0.055 
  }
];

// Helper to calculate monthly cost
const getMonthlyCostForRole = (roleId: string): number => {
    const role = STAFF_ROLES.find(r => r.id === roleId);
    if (!role) return 0;

    const annualBase = role.baseWage;
    const annualAllowances = role.carAllowance + role.phoneAllowance;
    const annualSuper = annualBase * role.superRate;
    const grossForTax = annualBase + annualAllowances + annualSuper;
    const annualPayrollTax = grossForTax * role.payrollTaxRate;

    return (annualBase + annualAllowances + annualSuper + annualPayrollTax) / 12;
};

const StaffPlanner: React.FC<Props> = ({ data }) => {
  // State for hiring events
  const [hiringEvents, setHiringEvents] = useState<HiringEvent[]>([]);
  
  // Form State
  const [selectedRole, setSelectedRole] = useState(STAFF_ROLES[0].id);
  const [count, setCount] = useState(1);
  // Robust initialization of startMonth to ensure it matches data.months keys
  const [startMonth, setStartMonth] = useState<string>(data.months.length > 0 ? data.months[0] : '');

  // Effect to ensure startMonth is set properly if data loads asynchronously or changes
  useEffect(() => {
    if (!startMonth && data.months.length > 0) {
      setStartMonth(data.months[0]);
    }
  }, [data.months, startMonth]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(val);

  const addEvent = useCallback(() => {
    const effectiveStartMonth = startMonth || (data.months.length > 0 ? data.months[0] : '');
    
    if (!effectiveStartMonth) return;

    const newEvent: HiringEvent = {
        id: Math.random().toString(36).substr(2, 9),
        roleId: selectedRole,
        count: Number(count),
        startMonth: effectiveStartMonth
    };
    setHiringEvents(prev => [...prev, newEvent]);
  }, [selectedRole, count, startMonth, data.months]);

  const removeEvent = useCallback((id: string) => {
    setHiringEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  // Project Financials
  // Uses strict index comparison to ensure costs are applied correctly along the timeline
  const projectionData = useMemo(() => {
    const baseline = data.operationalFinancials;
    if (baseline.length === 0) return [];

    let runningBalance = baseline[0].openingBalance;
    
    return baseline.map((op, index) => {
        let monthlyStaffCost = 0;
        let activeHeadcount = 0;
        
        // Use the current loop index as the time cursor.
        // This assumes baseline (operationalFinancials) maps 1:1 to data.months, which is true by design.
        const currentIdx = index;

        hiringEvents.forEach(event => {
            // Find when this event starts in the master month list
            const startIdx = data.months.indexOf(event.startMonth);
            
            // Apply cost if valid start found AND current month is on or after start
            if (startIdx !== -1 && currentIdx >= startIdx) {
                const costPerHead = getMonthlyCostForRole(event.roleId);
                monthlyStaffCost += (costPerHead * event.count);
                activeHeadcount += event.count;
            }
        });

        // Apply Impact
        const newNetCashflow = op.netCashflow - monthlyStaffCost;
        
        // Recalculate Balance
        // If first month, use original opening balance. Else use running balance from previous iteration.
        const opening = index === 0 ? op.openingBalance : runningBalance;
        const closing = opening + newNetCashflow;
        runningBalance = closing;

        return {
            month: op.month,
            baselineBalance: op.closingBalance,
            projectedBalance: closing,
            baselineCashflow: op.netCashflow,
            projectedCashflow: newNetCashflow,
            staffCost: monthlyStaffCost,
            headcount: activeHeadcount
        };
    });
  }, [data.operationalFinancials, data.months, hiringEvents]);

  const totalProjectedCost = projectionData.reduce((acc, curr) => acc + curr.staffCost, 0);

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <Users size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Timeline Staff Planner</h2>
        </div>
        <p className="text-sm text-slate-500">
            Schedule staff hires at specific months to see the cash flow impact over time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 flex-1">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-6 overflow-y-auto pr-2">
              {/* Form */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Calculator size={18} /> Plan New Hire
                  </h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Role</label>
                          <select 
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                          >
                              {STAFF_ROLES.map(r => (
                                  <option key={r.id} value={r.id}>{r.label} ({formatCurrency(r.baseWage)})</option>
                              ))}
                          </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Count</label>
                            <input 
                                type="number" 
                                min="1"
                                value={count}
                                onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 0))}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Start Month</label>
                            <select 
                                value={startMonth}
                                onChange={(e) => setStartMonth(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                {data.months.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                          </div>
                      </div>

                      <button 
                        onClick={addEvent}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                          <Plus size={16} /> Add to Plan
                      </button>
                  </div>
              </div>

              {/* List */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <CalendarClock size={18} /> Hiring Schedule
                  </h3>
                  
                  {hiringEvents.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-lg">
                          No staff planned yet.
                      </div>
                  ) : (
                    <div className="space-y-3">
                        {hiringEvents.map((event) => {
                            const role = STAFF_ROLES.find(r => r.id === event.roleId);
                            return (
                                <div key={event.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">
                                            {event.count}x {role?.label}
                                        </p>
                                        <p className="text-xs text-slate-500">Starts: {event.startMonth}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-xs font-medium text-slate-700">
                                                {formatCurrency(getMonthlyCostForRole(event.roleId) * event.count)}/mo
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => removeEvent(event.id)}
                                            className="text-slate-400 hover:text-rose-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        
                        <div className="pt-4 border-t border-slate-100 mt-2">
                             <div className="flex justify-between items-center">
                                 <span className="text-sm text-slate-500">Total Projection Impact</span>
                                 <span className="font-bold text-rose-600 text-lg">{formatCurrency(totalProjectedCost)}</span>
                             </div>
                             <p className="text-xs text-slate-400 mt-1 text-right">Cumulative cost across entire period</p>
                        </div>
                        
                        <div className="text-xs text-slate-400 mt-2 flex items-start gap-1 pt-2">
                            <AlertCircle size={12} className="mt-0.5" />
                            <p>Includes allowances, 12% Super & 5.5% Payroll Tax.</p>
                        </div>
                    </div>
                  )}
              </div>
          </div>

          {/* Visualization */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex-1 min-h-[400px]">
                    <h3 className="font-bold text-slate-800 mb-6">Projected Bank Balance Impact</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={projectionData} margin={{top: 10, right: 30, left: 0, bottom: 0}}>
                            <defs>
                                <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} minTickGap={30} />
                            <YAxis 
                                fontSize={11} 
                                tickLine={false} 
                                axisLine={false} 
                                tickFormatter={(val) => `$${val/1000}k`} 
                            />
                            <Tooltip 
                                formatter={(value: number) => formatCurrency(value)}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="baselineBalance" 
                                name="Baseline Balance" 
                                stroke="#94a3b8" 
                                strokeWidth={2} 
                                dot={false} 
                                strokeDasharray="5 5"
                            />
                            <Line 
                                type="monotone" 
                                dataKey="projectedBalance" 
                                name="With Staff Plan" 
                                stroke="#ef4444" 
                                strokeWidth={3} 
                                dot={false} 
                            />
                            <Area
                                type="monotone"
                                dataKey="projectedBalance"
                                stroke="none"
                                fill="url(#splitColor)"
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
               </div>

               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-72">
                    <h3 className="font-bold text-slate-800 mb-4">Staff Costs & Headcount Timeline</h3>
                     <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={projectionData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} minTickGap={30} />
                            <YAxis yAxisId="left" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                            <YAxis yAxisId="right" orientation="right" fontSize={11} tickLine={false} axisLine={false} />
                            
                            <Tooltip 
                                formatter={(value: number, name: string) => name === 'Headcount' ? value : formatCurrency(value)} 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend />
                            
                            <Area 
                                yAxisId="left"
                                type="step" 
                                dataKey="staffCost" 
                                name="Monthly Staff Cost" 
                                fill="#fecaca" 
                                stroke="#ef4444" 
                            />
                            <Line 
                                yAxisId="right"
                                type="step"
                                dataKey="headcount"
                                name="Headcount"
                                stroke="#6366f1"
                                strokeWidth={2}
                                dot={false}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
               </div>
          </div>
      </div>
    </div>
  );
};

export default StaffPlanner;