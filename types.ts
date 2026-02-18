export interface MonthlyData {
  month: string;
  units: number;
  revenue: number;
  dateObj: Date;
}

export interface UnitData {
  region: string;
  code: string;
  price: number;
  monthlyData: MonthlyData[];
  totalUnits: number;
  totalRevenue: number;
}

export interface RegionSummary {
  region: string;
  totalRevenue: number;
  totalUnits: number;
  totalBudget: number;
  monthlyData: { month: string; revenue: number; units: number; budget: number }[];
}

export interface OperationalFinancials {
  month: string;
  payments: number;
  netCashflow: number;
  openingBalance: number;
  closingBalance: number;
  dateObj: Date;
}

export interface DashboardData {
  units: UnitData[];
  regions: RegionSummary[];
  operationalFinancials: OperationalFinancials[];
  grandTotalRevenue: number;
  grandTotalUnits: number;
  grandTotalBudget: number;
  months: string[];
}

// --- Scenario Types ---

export type AdjustmentType = 'PERCENTAGE' | 'FIXED_AMOUNT';
export type AdjustmentTarget = 'REVENUE' | 'EXPENSES';

export interface ScenarioAdjustment {
  target: AdjustmentTarget;
  type: AdjustmentType;
  value: number; // e.g., 10 for 10%, 5000 for $5000
  description: string;
  region?: string; // Optional: if null, applies to all
  startMonth?: string; // Optional: e.g. "Jan-26"
  endMonth?: string;
}

export interface ScenarioResult {
  adjustments: ScenarioAdjustment[];
  comparisonData: {
    month: string;
    baselineCashflow: number;
    scenarioCashflow: number;
    baselineBalance: number;
    scenarioBalance: number;
  }[];
  summaryText: string;
}

// --- Staffing Types ---

export interface StaffRole {
  id: string;
  label: string;
  baseWage: number;
  carAllowance: number;
  phoneAllowance: number;
  superRate: number; // e.g. 0.12
  payrollTaxRate: number; // e.g. 0.055
}

export interface StaffRoleCount {
  roleId: string;
  count: number;
}
