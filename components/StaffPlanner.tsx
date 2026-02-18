import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { DashboardData, StaffRole } from '../types';
import { 
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, Bar
} from 'recharts';
import { Users, Calculator, Plus, Trash2, CalendarClock, AlertCircle, MapPin, TrendingUp, DollarSign } from 'lucide-react';

interface Props {
  data: DashboardData;
}

interface HiringEvent {
  id: string;
  roleId: string;
  count: number;
  startMonth: string;
  region: string; // Mandatory for calculations
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

// Trainer Ramp Up Logic
const getTrainerUnitOutput = (monthsActive: number): number => {
    if (monthsActive < 0) return 0;
    if (monthsActive < 2) return 10; // Month 1 & 2
    if (monthsActive === 2) return 20; // Month 3
    return 40; // Month 4+
};

// Sales Logic: 1 Sale/Mo, 400 Units Total, 3 Mo Delay, 12 Mo Distribution
const getSalesUnitOutput = (monthsActive: number): number => {
    if (monthsActive < 0) return 0;

    const unitsPerSale = 400;
    const payoutDuration = 12; // Distributed over 12 months
    const delay = 3; // Starts paying 3 months after sale
    const unitsPerMonthPerSale = unitsPerSale / payoutDuration; // ~33.33 units

    let totalMonthlyUnits = 0;

    // We assume the salesperson makes 1 sale every month they are active (0, 1, 2, ... monthsActive)
    // We iterate through every sale they have made up to this point to see if it's paying out now
    for (let saleMonthIndex = 0; saleMonthIndex <= monthsActive; saleMonthIndex++) {
        // Calculate the payout window for this specific sale
        const payoutStart = saleMonthIndex + delay;
        const payoutEnd = payoutStart + payoutDuration; // Exclusive

        // If the current time (monthsActive) is within the window of this sale's payout
        if (monthsActive >= payoutStart && monthsActive < payoutEnd) {
            totalMonthlyUnits += unitsPerMonthPerSale;
        }
    }

    return totalMonthlyUnits;
};

const StaffPlanner: React.FC<Props> = ({ data }) => {
  // Use operational financials as the master timeline to ensure chart alignment
  const scheduleMonths = useMemo(() => data.operationalFinancials.map(op => op.month), [data.operationalFinancials]);
  const regions = useMemo(() => data.regions.map(r => r.region).filter(r => r !== 'Total' && r !== 'Other Income'), [data.regions]);

  // Calculate Average Revenue Per Unit Per Region (Historical Baseline)
  const regionUnitValues = useMemo(() => {
    const map = new Map<string, number>();
    data.regions.forEach(r => {
        const totalRev = r.totalRevenue;
        const totalUnits = r.totalUnits;
        const avgVal = totalUnits > 0 ? totalRev / totalUnits : 0;
        map.set(r.region, avgVal);
    });
    return map;
  }, [data.regions]);

  // State for hiring events
  const [hiringEvents, setHiringEvents] = useState<HiringEvent[]>([]);
  
  // Form State
  const [selectedRole, setSelectedRole] = useState(STAFF_ROLES[0].id);
  const [count, setCount] = useState(1);
  const [startMonth, setStartMonth] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>(regions[0] || '');

  // Robust initialization
  useEffect(() => {
    if (scheduleMonths.length > 0 && !startMonth) {
      setStartMonth(scheduleMonths[0]);
    }
    if (regions.length > 0 && !selectedRegion) {
        setSelectedRegion(regions[0]);
    }
  }, [scheduleMonths, startMonth, regions, selectedRegion]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(val);

  const addEvent = useCallback(() => {
    // Ensure we have a valid start month
    const effectiveStartMonth = startMonth || (scheduleMonths.length > 0 ? scheduleMonths[0] : '');
    
    if (!effectiveStartMonth) return;

    const newEvent: HiringEvent = {
        id: Math.random().toString(36).substr(2, 9),
        roleId: selectedRole,
        count: Math.max(1, Number(count)),
        startMonth: effectiveStartMonth,
        region: selectedRegion
    };
    setHiringEvents(prev => [...prev, newEvent]);
  }, [selectedRole, count, startMonth, scheduleMonths, selectedRegion]);

  const removeEvent = useCallback((id: string) => {
    setHiringEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  // Project Financials
  const projectionData = useMemo(() => {
    const baseline = data.operationalFinancials;
    if (baseline.length === 0) return [];

    // Pre-calculate start indices for all valid events to avoid lookups inside the loop
    const validEvents = hiringEvents
      .map(ev => ({
        ...ev,
        startIndex: scheduleMonths.indexOf(ev.startMonth),
        count: Number(ev.count) // Force number here for safety
      }))
      .filter(ev => ev.startIndex !== -1);

    let runningBalance = baseline[0].openingBalance;
    
    return baseline.map((op, index) => {
        let monthlyStaffCost = 0;
        let activeHeadcount = 0;
        let generatedUnits = 0;
        let generatedRevenue = 0;

        validEvents.forEach(ev => {
            // Check if current timeline index is at or after the start index
            if (index >= ev.startIndex) {
                // 1. Cost Calculation
                const costPerHead = getMonthlyCostForRole(ev.roleId);
                monthlyStaffCost += (costPerHead * ev.count);
                activeHeadcount += ev.count;

                // 2. Revenue Calculation (Trainers & Sales)
                let unitsPerPerson = 0;
                
                if (ev.roleId === 'trainer') {
                    const monthsActive = index - ev.startIndex;
                    unitsPerPerson = getTrainerUnitOutput(monthsActive);
                } else if (ev.roleId === 'sales') {
                    const monthsActive = index - ev.startIndex;
                    unitsPerPerson = getSalesUnitOutput(monthsActive);
                }

                if (unitsPerPerson > 0) {
                    const totalNewUnits = unitsPerPerson * ev.count;
                    const unitValue = regionUnitValues.get(ev.region) || 0;
                    
                    generatedUnits += totalNewUnits;
                    generatedRevenue += (totalNewUnits * unitValue);
                }
            }
        });

        // Apply Impact: Revenue increases cashflow, Staff Cost decreases it
        const newNetCashflow = (op.netCashflow + generatedRevenue) - monthlyStaffCost;
        
        // Recalculate Balance
        // For index 0, use original opening. For others, use running balance from previous iteration.
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
            generatedRevenue: generatedRevenue,
            generatedUnits: generatedUnits,
            headcount: activeHeadcount
        };
    });
  }, [data.operationalFinancials, hiringEvents, regionUnitValues, scheduleMonths]);

  const totalProjectedCost = projectionData.reduce((acc, curr) => acc + curr.staffCost, 0);
  const totalGeneratedRevenue = projectionData.reduce((acc, curr) => acc + curr.generatedRevenue, 0);
  const netImpact = totalGeneratedRevenue - totalProjectedCost;

  const isRevenueGeneratingRole = selectedRole === 'trainer' || selectedRole === 'sales';

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
            Schedule staff hires and model revenue ramp-up for trainers and sales staff.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 flex-1">
          {/* Controls */}
          <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2">
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

                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Allocation Region</label>
                        <div className="relative">
                            <MapPin size={14} className="absolute left-3 top-2.5 text-slate-400" />
                            <select 
                                value={selectedRegion}
                                onChange={(e) => setSelectedRegion(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                {regions.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>
                        {isRevenueGeneratingRole && (
                             <div className="mt-2 text-[10px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                                <p className="font-semibold text-emerald-600 mb-1 flex items-center gap-1">
                                    <TrendingUp size={10} /> Revenue Model Active
                                </p>
                                {selectedRole === 'sales' ? (
                                    <span>Model: 1 Sale/Mo (400 units). Starts paying 3 months later, distributed over 12 months. Sales stack cumulatively.</span>
                                ) : (
                                    <span>Model: 10 units (M1-2), 20 units (M3), 40 units (M4+) flat ramp up.</span>
                                )}
                             </div>
                        )}
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
                                {scheduleMonths.map(m => (
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
                            const generatesRevenue = event.roleId === 'trainer' || event.roleId === 'sales';
                            return (
                                <div key={event.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-800 text-sm">
                                                    {event.count}x {role?.label}
                                                </span>
                                                <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                                                    {event.region}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5">Starts: {event.startMonth}</p>
                                        </div>
                                        <button 
                                            onClick={() => removeEvent(event.id)}
                                            className="text-slate-400 hover:text-rose-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200">
                                        <p className="text-xs text-rose-600 font-medium">
                                            -{formatCurrency(getMonthlyCostForRole(event.roleId) * event.count)}/mo
                                        </p>
                                        {generatesRevenue && (
                                            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                                                <TrendingUp size={12} /> Revenue Active
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        
                        <div className="pt-4 border-t border-slate-100 mt-4 space-y-2">
                             <div className="flex justify-between items-center text-sm">
                                 <span className="text-slate-500">Projected Cost</span>
                                 <span className="font-medium text-rose-600">{formatCurrency(totalProjectedCost)}</span>
                             </div>
                             <div className="flex justify-between items-center text-sm">
                                 <span className="text-slate-500">Generated Revenue</span>
                                 <span className="font-medium text-emerald-600">{formatCurrency(totalGeneratedRevenue)}</span>
                             </div>
                             <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                                 <span className="font-bold text-slate-700">Net Impact</span>
                                 <span className={`font-bold text-lg ${netImpact >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                     {netImpact > 0 ? '+' : ''}{formatCurrency(netImpact)}
                                 </span>
                             </div>
                        </div>
                    </div>
                  )}
              </div>
          </div>

          {/* Visualization */}
          <div className="lg:col-span-8 flex flex-col space-y-6">
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex-1 min-h-[350px]">
                    <h3 className="font-bold text-slate-800 mb-6">Net Cashflow & Bank Balance Impact</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart key={`balance-chart-${hiringEvents.length}`} data={projectionData} margin={{top: 10, right: 30, left: 0, bottom: 0}}>
                            <defs>
                                <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
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
                                name="Projected Balance" 
                                stroke="#6366f1" 
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

               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
                    <h3 className="font-bold text-slate-800 mb-4">Staff Costs vs. Generated Revenue (ROI)</h3>
                     <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart key={`roi-chart-${hiringEvents.length}`} data={projectionData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} minTickGap={30} />
                            <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                            
                            <Tooltip 
                                formatter={(value: number) => formatCurrency(value)} 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend />
                            
                            <Area 
                                type="step" 
                                dataKey="staffCost" 
                                name="Staff Cost" 
                                fill="#fecaca" 
                                stroke="#ef4444" 
                            />
                             <Area 
                                type="step" 
                                dataKey="generatedRevenue" 
                                name="New Revenue" 
                                fill="#d1fae5" 
                                stroke="#10b981" 
                            />
                            <Line 
                                type="monotone" 
                                dataKey="projectedCashflow" 
                                name="Net Cashflow" 
                                stroke="#3b82f6" 
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