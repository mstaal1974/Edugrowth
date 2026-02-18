import React from 'react';
import { LayoutDashboard, PieChart, TrendingUp, Table, Calendar, BrainCircuit, Users, Edit } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  yearBasis: 'calendar' | 'financial';
  setYearBasis: (basis: 'calendar' | 'financial') => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  availableYears: string[];
}

const Layout: React.FC<LayoutProps> = ({ 
    children, activeTab, onTabChange,
    yearBasis, setYearBasis, selectedYear, setSelectedYear, availableYears
}) => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">EduGrowth BI</h1>
          <p className="text-xs text-slate-400 mt-1">Financial Forecasting</p>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-2">
          <button 
            onClick={() => onTabChange('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Overview</span>
          </button>
          
          <button 
             onClick={() => onTabChange('regions')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'regions' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <PieChart size={20} />
            <span className="font-medium">Regional Analysis</span>
          </button>
          
          <button 
             onClick={() => onTabChange('units')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'units' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <TrendingUp size={20} />
            <span className="font-medium">Unit Performance</span>
          </button>

          <div className="pt-4 pb-2">
             <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Planning</p>
          </div>

          <button 
             onClick={() => onTabChange('modeler')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'modeler' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Edit size={20} />
            <span className="font-medium">Unit Modeler</span>
          </button>

          <button 
             onClick={() => onTabChange('scenario')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'scenario' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <BrainCircuit size={20} />
            <span className="font-medium">AI Scenario</span>
          </button>

          <button 
             onClick={() => onTabChange('staff')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'staff' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Users size={20} />
            <span className="font-medium">Staff Planner</span>
          </button>

          <div className="pt-4 pb-2">
             <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Source</p>
          </div>

          <button 
             onClick={() => onTabChange('data')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'data' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Table size={20} />
            <span className="font-medium">Raw Data</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800 rounded-lg p-3 text-xs text-slate-400">
            <p className="font-semibold text-white mb-1">Data Status</p>
            <p>Updated: Jan 2024</p>
            <p>Source: Internal CSV</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h2 className="text-xl font-semibold text-slate-800 capitalize">{activeTab.replace('_', ' ')} Dashboard</h2>
          
          <div className="flex items-center space-x-3">
             {/* Year Type Toggle */}
             <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                    onClick={() => setYearBasis('financial')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${yearBasis === 'financial' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Financial Year
                </button>
                <button
                    onClick={() => setYearBasis('calendar')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${yearBasis === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Calendar Year
                </button>
             </div>

             {/* Year Selector */}
             <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Calendar size={14} className="text-slate-500" />
                 </div>
                 <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="pl-9 pr-4 py-1.5 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-700"
                 >
                    <option value="All">All Time</option>
                    {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                 </select>
             </div>

             <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold border border-blue-200 ml-2">
                EG
             </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8">
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;