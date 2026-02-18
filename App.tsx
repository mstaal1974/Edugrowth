import React, { useState, useMemo, useEffect } from 'react';
import Layout from './components/Layout';
import DashboardOverview from './components/DashboardOverview';
import RegionalAnalysis from './components/RegionalAnalysis';
import RawDataTable from './components/RawDataTable';
import ScenarioBuilder from './components/ScenarioBuilder';
import StaffPlanner from './components/StaffPlanner';
import UnitModeler from './components/UnitModeler';
import { processCSVData, getFinancialYear, getCalendarYear, recalculateFinancials } from './services/dataProcessor';
import { DashboardData } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [yearBasis, setYearBasis] = useState<'calendar' | 'financial'>('financial');
  const [selectedYear, setSelectedYear] = useState('All');
  
  // 1. Load Baseline Data (Synchronized to Revenue)
  const baselineData = useMemo(() => processCSVData(), []);

  // 2. User Adjustments State: Key = "Region|Code|Month", Value = NewUnits
  const [unitAdjustments, setUnitAdjustments] = useState<Record<string, number>>({});

  // 3. Compute Active Data (Baseline + Adjustments)
  const currentData: DashboardData = useMemo(() => {
      // If no adjustments, return baseline
      if (Object.keys(unitAdjustments).length === 0) return baselineData;

      // Deep Clone Units to modify
      const newUnits = baselineData.units.map(u => ({
          ...u,
          monthlyData: u.monthlyData.map(md => ({ ...md }))
      }));

      // Apply Adjustments (Direct Update Logic)
      Object.entries(unitAdjustments).forEach(([key, value]) => {
          const newAmount = Math.round(value as number);
          const [region, code, month] = key.split('|');
          
          // Find specific unit
          const unit = newUnits.find(u => u.region === region && u.code === code);
          
          if (unit) {
             const md = unit.monthlyData.find(m => m.month === month);
             if (md) {
                 const oldUnits = md.units;
                 const oldRevenue = md.revenue;
                 
                 // Determine rate to use for new calculation
                 // For normal units, use unit.price
                 // For 'Misc Adjustment', calculate effective rate from existing data (Revenue / Units) if available
                 let rate = unit.price;
                 if (unit.code === 'Misc Adjustment' && oldUnits > 0) {
                     rate = oldRevenue / oldUnits;
                 }

                 md.units = newAmount;
                 md.revenue = newAmount * rate;
             }
          }
      });

      // Recalculate Unit Totals
      newUnits.forEach(u => {
          u.totalRevenue = u.monthlyData.reduce((acc, m) => acc + m.revenue, 0);
          u.totalUnits = u.monthlyData.reduce((acc, m) => acc + m.units, 0);
      });

      // Re-run Financial Engine to update Regions and Cashflow
      return recalculateFinancials({
          ...baselineData,
          units: newUnits
      });

  }, [baselineData, unitAdjustments]);

  // Handle Adjustment Update from Modeler
  const handleUpdateUnits = (region: string, code: string, month: string, newUnits: number) => {
      setUnitAdjustments(prev => ({
          ...prev,
          [`${region}|${code}|${month}`]: newUnits
      }));
  };

  // Compute available years based on the data and selected basis
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    if (currentData.regions.length > 0) {
        currentData.regions[0].monthlyData.forEach(md => {
             const dateObj = currentData.units[0]?.monthlyData.find(m => m.month === md.month)?.dateObj;
             if (dateObj) {
                 const label = yearBasis === 'calendar' ? getCalendarYear(dateObj) : getFinancialYear(dateObj);
                 yearsSet.add(label);
             }
        });
    }
    return Array.from(yearsSet).sort();
  }, [currentData, yearBasis]);

  useEffect(() => {
      if (selectedYear !== 'All' && !availableYears.includes(selectedYear)) {
          setSelectedYear('All');
      }
  }, [yearBasis, availableYears, selectedYear]);

  const commonProps = {
      data: currentData,
      yearBasis,
      selectedYear
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview {...commonProps} />;
      case 'regions':
        return <RegionalAnalysis {...commonProps} />;
      case 'units':
        return <RegionalAnalysis {...commonProps} />; 
      case 'modeler':
        return <UnitModeler {...commonProps} onUpdateUnits={handleUpdateUnits} />;
      case 'scenario':
        return <ScenarioBuilder data={currentData} />;
      case 'staff':
        return <StaffPlanner data={currentData} />;
      case 'data':
        return <RawDataTable {...commonProps} />;
      default:
        return <DashboardOverview {...commonProps} />;
    }
  };

  return (
    <Layout 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        yearBasis={yearBasis}
        setYearBasis={setYearBasis}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        availableYears={availableYears}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;