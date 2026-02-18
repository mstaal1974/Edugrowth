import React, { useState } from 'react';
import { DashboardData, ScenarioResult } from '../types';
import { generateScenario } from '../services/scenarioService';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area
} from 'recharts';
import { Sparkles, ArrowRight, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  data: DashboardData;
}

const ScenarioBuilder: React.FC<Props> = ({ data }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScenarioResult | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const scenarioResult = await generateScenario(prompt, data);
      setResult(scenarioResult);
    } catch (error) {
      console.error("Failed to generate scenario", error);
      alert("Something went wrong generating the scenario. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', notation: 'compact' }).format(val);

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* Input Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Sparkles className="text-purple-500" size={20} />
            AI Scenario Builder
        </h2>
        <p className="text-sm text-slate-500 mb-4">
            Ask "What if" questions to model financial impacts. 
            <span className="italic opacity-70 ml-2">(e.g., "What if sales drop by 15% starting Jan 2026?" or "Add a $50k marketing cost in March 2026")</span>
        </p>
        
        <div className="flex gap-4">
            <input 
                type="text" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder="Describe a scenario..."
                className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none text-slate-700"
            />
            <button 
                onClick={handleGenerate}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
                {loading ? <RefreshCw className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                {loading ? 'Simulating...' : 'Simulate'}
            </button>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
            
            {/* Impact Summary Sidebar */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                    <h3 className="font-semibold text-purple-900 mb-2">Analysis</h3>
                    <p className="text-purple-800 text-sm">{result.summaryText}</p>
                    
                    <div className="mt-4 space-y-2">
                        {result.adjustments.map((adj, i) => (
                            <div key={i} className="bg-white p-3 rounded-md shadow-sm border border-purple-100 text-sm">
                                <div className="flex justify-between font-medium text-slate-700">
                                    <span>{adj.target}</span>
                                    <span className={adj.type === 'PERCENTAGE' ? 'text-blue-600' : 'text-emerald-600'}>
                                        {adj.type === 'PERCENTAGE' ? `${adj.value > 0 ? '+' : ''}${adj.value}%` : formatCurrency(adj.value)}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">{adj.description}</p>
                                {adj.startMonth && <p className="text-xs text-slate-400 mt-0.5">Starts: {adj.startMonth}</p>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4">Total Impact</h3>
                    {(() => {
                        const totalBaseline = result.comparisonData.reduce((acc, c) => acc + c.baselineCashflow, 0);
                        const totalScenario = result.comparisonData.reduce((acc, c) => acc + c.scenarioCashflow, 0);
                        const diff = totalScenario - totalBaseline;
                        
                        return (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-slate-500">Net Cashflow Delta</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-2xl font-bold ${diff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {diff > 0 ? '+' : ''}{formatCurrency(diff)}
                                        </span>
                                        {diff >= 0 ? <TrendingUp size={20} className="text-emerald-500"/> : <TrendingDown size={20} className="text-rose-500"/>}
                                    </div>
                                </div>
                                <div className="w-full bg-slate-100 h-px"></div>
                                <div>
                                    <p className="text-xs text-slate-500">Ending Bank Balance</p>
                                    <div className="flex justify-between items-end mt-1">
                                        <div>
                                            <p className="text-xs text-slate-400">Baseline</p>
                                            <p className="font-medium text-slate-600">{formatCurrency(result.comparisonData[result.comparisonData.length-1].baselineBalance)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-purple-400">Scenario</p>
                                            <p className="font-bold text-purple-700">{formatCurrency(result.comparisonData[result.comparisonData.length-1].scenarioBalance)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Charts Area */}
            <div className="lg:col-span-2 space-y-6">
                {/* Bank Balance Comparison */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
                    <h3 className="font-bold text-slate-800 mb-4">Bank Balance Forecast (Baseline vs Scenario)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={result.comparisonData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} minTickGap={30} />
                            <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
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
                            <Area 
                                type="monotone" 
                                dataKey="scenarioBalance" 
                                name="Scenario Balance" 
                                stroke="#8b5cf6" 
                                fill="#8b5cf6" 
                                fillOpacity={0.1}
                                strokeWidth={3} 
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                 {/* Cashflow Comparison */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
                    <h3 className="font-bold text-slate-800 mb-4">Monthly Net Cashflow Impact</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={result.comparisonData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} minTickGap={30} />
                            <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                            <Legend />
                            <Bar 
                                dataKey="baselineCashflow" 
                                name="Baseline CF" 
                                fill="#cbd5e1" 
                                radius={[2, 2, 0, 0]} 
                                barSize={20}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="scenarioCashflow" 
                                name="Scenario CF" 
                                stroke="#2563eb" 
                                strokeWidth={2} 
                                dot={{r: 2}} 
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioBuilder;
