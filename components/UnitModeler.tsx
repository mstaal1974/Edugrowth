import React, { useState, useMemo, useEffect } from 'react';
import { DashboardData } from '../types';
import { isMonthInPeriod } from '../services/dataProcessor';
import { Edit2, Save, X, Tag, AlertTriangle } from 'lucide-react';

interface Props {
  data: DashboardData;
  yearBasis: 'calendar' | 'financial';
  selectedYear: string;
  onUpdateUnits: (region: string, code: string, month: string, newUnits: number) => void;
}

const UnitModeler: React.FC<Props> = ({ data, yearBasis, selectedYear, onUpdateUnits }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>(data.regions[0]?.region || 'QLD');
  const [selectedCode, setSelectedCode] = useState<string>('');
  const [editingCell, setEditingCell] = useState<{month: string, value: string} | null>(null);

  // 1. Get Available Unit Codes for the Selected Region
  const availableCodes = useMemo(() => {
    const codes = new Set<string>();
    data.units
        .filter(u => u.region === selectedRegion)
        .forEach(u => codes.add(u.code));
    return Array.from(codes).sort();
  }, [data.units, selectedRegion]);

  // 2. Auto-select first code if current selection is invalid for new region
  useEffect(() => {
      if (availableCodes.length > 0 && (!selectedCode || !availableCodes.includes(selectedCode))) {
          setSelectedCode(availableCodes[0]);
      }
  }, [availableCodes, selectedCode]);

  // 3. Filter months based on view
  const displayMonths = useMemo(() => {
    return data.months.filter(m => {
        const d = data.units[0]?.monthlyData.find(md => md.month === m)?.dateObj;
        return d && isMonthInPeriod(d, yearBasis, selectedYear);
    });
  }, [data.months, yearBasis, selectedYear, data.units]);

  // 4. Get Data for Selected Region AND Code
  const activeUnitData = useMemo(() => {
    const unit = data.units.find(u => u.region === selectedRegion && u.code === selectedCode);
    if (!unit) return [];

    return displayMonths.map(month => {
        const md = unit.monthlyData.find(m => m.month === month);
        const units = md ? md.units : 0;
        const revenue = md ? md.revenue : 0;
        // Calculate effective price for display (handles dynamic "Misc Adjustment" rates)
        const effectivePrice = (units > 0) ? (revenue / units) : unit.price;

        return {
            month,
            units,
            revenue,
            price: effectivePrice
        };
    });
  }, [data.units, selectedRegion, selectedCode, displayMonths]);

  const handleEditClick = (month: string, currentVal: number) => {
      setEditingCell({ month, value: Math.round(currentVal).toString() });
  };

  const handleSave = () => {
      if (!editingCell) return;
      // Force whole number
      const newVal = parseInt(editingCell.value, 10);
      if (!isNaN(newVal)) {
          onUpdateUnits(selectedRegion, selectedCode, editingCell.month, newVal);
      }
      setEditingCell(null);
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(val);

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Edit2 size={20} className="text-emerald-500" />
                    Unit Acquisition Modeler
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Adjust specific unit volumes by qualification. 
                    <span className="ml-1 inline-block bg-slate-100 px-2 py-0.5 rounded text-slate-600 text-xs font-medium">
                        Rate applied automatically based on selection.
                    </span>
                </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-700">Region:</label>
                    <select 
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none min-w-[120px]"
                    >
                        {data.regions.map(r => (
                            <option key={r.region} value={r.region}>{r.region}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                        <Tag size={14} /> Code:
                    </label>
                    <select 
                        value={selectedCode}
                        onChange={(e) => setSelectedCode(e.target.value)}
                        className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none min-w-[140px]"
                    >
                        {availableCodes.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
      </div>

      {/* Misc Adjustment Info */}
      {selectedCode === 'Misc Adjustment' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-amber-900">
                <p className="font-semibold">System Generated Allocation</p>
                <p className="mt-1 opacity-90 leading-relaxed">
                    "Misc Adjustments" are created automatically when the <strong>Financial Forecast</strong> shows revenue for a month, 
                    but the <strong>Unit Data</strong> shows zero units. 
                    <br/><br/>
                    In these cases, the system sets the <strong>Unit Count to 1</strong> and the <strong>Unit Value to the full forecast amount</strong> for that month.
                </p>
            </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col">
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr>
                        <th className="px-6 py-4 font-semibold w-32">Month</th>
                        <th className="px-6 py-4 font-semibold text-right">Unit Rate</th>
                        <th className="px-6 py-4 font-semibold text-right">Revenue</th>
                        <th className="px-6 py-4 font-semibold text-center w-40">Units</th>
                        <th className="px-6 py-4 font-semibold text-center w-32">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {activeUnitData.map((row) => (
                        <tr key={row.month} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900">{row.month}</td>
                            <td className="px-6 py-4 text-right text-slate-500 font-mono">
                                {formatCurrency(row.price)}
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-emerald-600">
                                {formatCurrency(row.revenue)}
                            </td>
                            <td className="px-6 py-4 text-center">
                                {editingCell?.month === row.month ? (
                                    <input 
                                        type="number" 
                                        step="1"
                                        value={editingCell.value}
                                        onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                                        className="w-24 text-center border border-emerald-300 rounded px-2 py-1 focus:ring-2 focus:ring-emerald-500 outline-none bg-white shadow-sm"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSave();
                                            if (e.key === 'Escape') setEditingCell(null);
                                        }}
                                    />
                                ) : (
                                    <span className="font-bold text-slate-800 bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200">
                                        {row.units.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-center">
                                {editingCell?.month === row.month ? (
                                    <div className="flex justify-center gap-2">
                                        <button onClick={handleSave} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Save">
                                            <Save size={18} />
                                        </button>
                                        <button onClick={() => setEditingCell(null)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors" title="Cancel">
                                            <X size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => handleEditClick(row.month, row.units)}
                                        className="text-indigo-600 hover:text-indigo-800 font-medium text-xs flex items-center justify-center gap-1 mx-auto hover:bg-indigo-50 px-3 py-1.5 rounded transition-colors"
                                    >
                                        <Edit2 size={14} /> <span className="ml-1">Edit</span>
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    {activeUnitData.length === 0 && (
                        <tr><td colSpan={5} className="text-center py-12 text-slate-400">Select a valid Region and Code to view data</td></tr>
                    )}
                </tbody>
            </table>
          </div>
      </div>
    </div>
  );
};

export default UnitModeler;