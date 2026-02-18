import { GoogleGenAI, Type } from "@google/genai";
import { DashboardData, ScenarioAdjustment, ScenarioResult, OperationalFinancials } from "../types";
import { parseDate } from "./dataProcessor";

export const generateScenario = async (
  prompt: string, 
  currentData: DashboardData
): Promise<ScenarioResult> => {
  
  // 1. Prepare Context for AI
  // We don't send all data, just a summary to save tokens and keep it focused
  const summaryContext = {
    totalRevenue: currentData.grandTotalRevenue,
    totalExpenses: currentData.operationalFinancials.reduce((acc, curr) => acc + curr.payments, 0),
    regions: currentData.regions.map(r => r.region),
    timeRange: `${currentData.months[0]} to ${currentData.months[currentData.months.length - 1]}`
  };

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // 2. Call Gemini to parse intent
  // We want the AI to return a specific list of adjustments to apply
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `
      You are a financial analyst engine. 
      Current Context: ${JSON.stringify(summaryContext)}.
      
      User Request: "${prompt}"

      Task: Analyze the user request and determine what financial adjustments need to be made to the forecast.
      Return a list of adjustments. 
      
      Rules:
      1. If the user says "increase revenue", target is REVENUE.
      2. If the user says "add cost" or "hire staff", target is EXPENSES.
      3. value should be a number. If percentage, e.g. 5%, value is 5. If fixed, value is the raw number.
      4. region is optional. If specified (e.g. "in QLD"), include it.
      5. startMonth is optional. If user says "starting Jan 2026", format it as "Jan-26".

      Response Format (JSON):
      {
        "adjustments": [
          {
             "target": "REVENUE" | "EXPENSES",
             "type": "PERCENTAGE" | "FIXED_AMOUNT",
             "value": number,
             "description": "Short explanation",
             "region": "string (optional)",
             "startMonth": "string (optional)"
          }
        ],
        "summary": "A friendly summary of what you are doing to the model."
      }
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          adjustments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                target: { type: Type.STRING, enum: ["REVENUE", "EXPENSES"] },
                type: { type: Type.STRING, enum: ["PERCENTAGE", "FIXED_AMOUNT"] },
                value: { type: Type.NUMBER },
                description: { type: Type.STRING },
                region: { type: Type.STRING, nullable: true },
                startMonth: { type: Type.STRING, nullable: true },
              },
              required: ["target", "type", "value", "description"]
            }
          },
          summary: { type: Type.STRING }
        }
      }
    }
  });

  const aiResult = JSON.parse(response.text || '{}');
  const adjustments: ScenarioAdjustment[] = aiResult.adjustments || [];
  const summaryText = aiResult.summary || "Scenario generated.";

  // 3. Apply Logic to Data (The "Engine")
  
  // Deep copy operational financials to modify them
  // We primarily modify operationalFinancials because that holds the Cashflow/Balance
  // However, Revenue adjustments technically come from Regions. 
  // For simplicity in this "What If" builder, we will apply revenue adjustments directly to the aggregate Revenue flow
  // and Expense adjustments to the aggregate Payment flow.

  const comparisonData = currentData.operationalFinancials.map((op, idx) => {
    const monthLabel = op.month;
    const opDate = op.dateObj;

    // Calculate Baseline Revenue for this month (derived from netCashflow + payments)
    // NetCashflow = Revenue - Payments => Revenue = NetCashflow + Payments
    const baselineRevenue = op.netCashflow + op.payments;
    
    let scenarioRevenue = baselineRevenue;
    let scenarioPayments = op.payments;

    adjustments.forEach(adj => {
        // Check Date Filter
        if (adj.startMonth) {
            const startDate = parseDate(adj.startMonth);
            if (opDate < startDate) return; 
        }

        // Apply Logic
        if (adj.target === 'REVENUE') {
            if (adj.type === 'PERCENTAGE') {
                scenarioRevenue += (baselineRevenue * (adj.value / 100));
            } else {
                scenarioRevenue += adj.value;
            }
        } else if (adj.target === 'EXPENSES') {
            if (adj.type === 'PERCENTAGE') {
                scenarioPayments += (op.payments * (adj.value / 100));
            } else {
                scenarioPayments += adj.value;
            }
        }
    });

    const scenarioNetCashflow = scenarioRevenue - scenarioPayments;

    return {
        month: monthLabel,
        baselineCashflow: op.netCashflow,
        scenarioCashflow: scenarioNetCashflow,
        baselineBalance: op.closingBalance,
        scenarioBalance: 0, // Calculated in next pass
        deltaCashflow: scenarioNetCashflow - op.netCashflow
    };
  });

  // 4. Recalculate Running Bank Balances
  // We need the initial opening balance. 
  // We assume the scenario starts affecting things, but the historical opening balance of the *first* record is the anchor.
  let runningBalance = currentData.operationalFinancials[0]?.openingBalance || 0;

  comparisonData.forEach(item => {
      // The closing balance is Previous + NetCashflow
      runningBalance += item.scenarioCashflow;
      item.scenarioBalance = runningBalance;
  });

  return {
    adjustments,
    comparisonData,
    summaryText
  };
};