import React, { useState } from 'react';
import { DashboardData } from '../types';
import { isMonthInPeriod } from '../services/dataProcessor';

interface Props {
  data: DashboardData;
  yearBasis: 'calendar' | 'financial';
  selectedYear: string;
}

const RawDataTable: React.FC<Props> = ({ data, yearBasis, selectedYear }) => {
  const [filterRegion, setFilterRegion] = useState('All');

  const filteredUnits = filterRegion === 'All' 
    ? data.units 
    : data.units.filter(u => u.region === filterRegion);

  // Helper to calculate totals for the specific period dynamically
  const getUnitTotals = (unit: any) => {
      let revenue = 0;
      let units = 0;
      unit.monthlyData.forEach((md: any) => {
          if (isMonthInPeriod(md.dateObj, yearBasis, selectedYear)) {
              revenue += md.revenue;
              units += md.units;
          }
      });
      return { revenue, units };
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100">
          <div>
            <h3 className="font-bold text-slate-700">Detailed Unit Data</h3>
            <p className="text-xs text-slate-500 mt-1">
                Showing data for: <span className="font-semibold text-blue-600">{selectedYear === 'All' ? 'All Time' : selectedYear}</span> ({yearBasis === 'calendar' ? 'Calendar Year' : 'Financial Year'})
            </p>
          </div>
          <select 
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="All">All Regions</option>
            {data.regions.map(r => <option key={r.region} value={r.region}>{r.region}</option>)}
          </select>
       </div>

       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="overflow-x-auto">
           <table className="w-full text-sm text-left text-slate-600">
             <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
               <tr>
                 <th className="px-6 py-4 font-semibold">Region</th>
                 <th className="px-6 py-4 font-semibold">Unit Code</th>
                 <th className="px-6 py-4 font-semibold">Price per Unit</th>
                 <th className="px-6 py-4 font-semibold">Total Units ({selectedYear})</th>
                 <th className="px-6 py-4 font-semibold">Total Revenue ({selectedYear})</th>
               </tr>
             </thead>
             <tbody>
               {filteredUnits.map((unit, idx) => {
                 const { revenue, units } = getUnitTotals(unit);
                 return (
                    <tr key={`${unit.region}-${unit.code}-${idx}`} className="bg-white border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{unit.region}</td>
                    <td className="px-6 py-4">
                        <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-semibold">{unit.code}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500">
                        {new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(unit.price)}
                    </td>
                    <td className="px-6 py-4 font-semibold">{units.toLocaleString()}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">
                        {new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(revenue)}
                    </td>
                    </tr>
                 );
               })}
               {filteredUnits.length === 0 && (
                   <tr><td colSpan={5} className="text-center py-8">No data found</td></tr>
               )}
             </tbody>
           </table>
         </div>
       </div>
    </div>
  );
};

export default RawDataTable;
