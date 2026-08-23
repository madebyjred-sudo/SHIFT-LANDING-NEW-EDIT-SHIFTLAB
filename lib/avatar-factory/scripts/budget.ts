import fs from 'fs';
import path from 'path';

const BUDGET_FILE = '/var/www/shiftlatam-web/config/cost-tracker.json';
const DAILY_LIMIT = 5.50; // USD

interface CostEntry {
  model: string;
  cost: number;
  purpose: string;
  timestamp: string;
}

interface DailyRecord {
  totalSpent: number;
  calls: CostEntry[];
}

export function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function loadBudget(): Record<string, DailyRecord> {
  if (!fs.existsSync(BUDGET_FILE)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(BUDGET_FILE, 'utf-8'));
}

export function saveBudget(data: Record<string, DailyRecord>) {
  fs.writeFileSync(BUDGET_FILE, JSON.stringify(data, null, 2));
}

export function checkBudget(): boolean {
  const data = loadBudget();
  const today = getTodayStr();
  const todayRecord = data[today] || { totalSpent: 0, calls: [] };
  
  if (todayRecord.totalSpent >= DAILY_LIMIT) {
    console.error(`[BUDGET] Daily limit of $${DAILY_LIMIT} reached. Total spent today: $${todayRecord.totalSpent.toFixed(2)}`);
    return false;
  }
  return true;
}

export function registerCost(model: string, cost: number, purpose: string) {
  const data = loadBudget();
  const today = getTodayStr();
  
  if (!data[today]) {
    data[today] = { totalSpent: 0, calls: [] };
  }
  
  data[today].calls.push({
    model,
    cost,
    purpose,
    timestamp: new Date().toISOString()
  });
  data[today].totalSpent += cost;
  
  saveBudget(data);
  console.log(`[BUDGET] Registered $${cost.toFixed(4)} for ${purpose}. Today's total: $${data[today].totalSpent.toFixed(4)}`);
}

// Precios de Perplexity via OpenRouter (aproximados)
// sonar-small-online: $0.20 / 1M input, $0.20 / 1M output + $5/1000 requests
export function calculatePerplexityCost(inputTokens: number, outputTokens: number): number {
  const baseCost = (inputTokens / 1000000) * 0.20 + (outputTokens / 1000000) * 0.20;
  const requestCost = 5 / 1000; // $0.005 per request
  return baseCost + requestCost;
}
