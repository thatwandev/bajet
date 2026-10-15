import type {
  PortfolioHolding,
  MonthlyBudget,
  SavingsGoal,
  DebtAccount,
  NetWorthSnapshot,
  FinancialData,
} from '../types/finance';

export const SAMPLE_PORTFOLIO: PortfolioHolding[] = [
  { id: 'p1', ticker: 'AAPL',  quantity: 15,   avgCost: 145.20, currentPrice: 189.50 },
  { id: 'p2', ticker: 'MSFT',  quantity: 10,   avgCost: 280.00, currentPrice: 415.30 },
  { id: 'p3', ticker: 'VTI',   quantity: 25,   avgCost: 195.00, currentPrice: 238.60 },
  { id: 'p4', ticker: 'BTC',   quantity: 0.45, avgCost: 28000,  currentPrice: 62400  },
  { id: 'p5', ticker: 'GOOGL', quantity: 8,    avgCost: 132.00, currentPrice: 175.80 },
];

export const SAMPLE_BUDGET: MonthlyBudget[] = [
  {
    id: 'b1',
    month: '2024-02',
    income: 6500,
    expenses: { rent: 1800, food: 420, transport: 180, entertainment: 95,  savings: 800 },
  },
  {
    id: 'b2',
    month: '2024-03',
    income: 6500,
    expenses: { rent: 1800, food: 390, transport: 165, entertainment: 120, savings: 900 },
  },
  {
    id: 'b3',
    month: '2024-04',
    income: 6800,
    expenses: { rent: 1800, food: 445, transport: 190, entertainment: 150, savings: 950 },
  },
  {
    id: 'b4',
    month: '2024-05',
    income: 6800,
    expenses: { rent: 1800, food: 410, transport: 175, entertainment: 110, savings: 1000 },
  },
  {
    id: 'b5',
    month: '2024-06',
    income: 7000,
    expenses: { rent: 1800, food: 460, transport: 200, entertainment: 130, savings: 1200 },
  },
  {
    id: 'b6',
    month: '2024-07',
    income: 7000,
    expenses: { rent: 1800, food: 435, transport: 185, entertainment: 100, savings: 1250 },
  },
];

export const SAMPLE_SAVINGS_GOALS: SavingsGoal[] = [
  { id: 'g1', name: 'Emergency Fund',     targetAmount: 15000, currentAmount: 9800  },
  { id: 'g2', name: 'Vacation',           targetAmount: 4000,  currentAmount: 1650  },
  { id: 'g3', name: 'House Down-payment', targetAmount: 60000, currentAmount: 18400 },
];

export const SAMPLE_DEBT: DebtAccount[] = [
  {
    id: 'd1',
    name: 'Credit Card',
    balance: 3240,
    interestRate: 0.1999, // 19.99%
    minimumPayment: 65,
  },
  {
    id: 'd2',
    name: 'Student Loan',
    balance: 22500,
    interestRate: 0.055, // 5.5%
    minimumPayment: 250,
  },
];

export const SAMPLE_NET_WORTH: NetWorthSnapshot[] = [
  { id: 'n1',  month: '2023-08', totalAssets: 48200,  totalLiabilities: 27500 },
  { id: 'n2',  month: '2023-09', totalAssets: 49800,  totalLiabilities: 27100 },
  { id: 'n3',  month: '2023-10', totalAssets: 51500,  totalLiabilities: 26700 },
  { id: 'n4',  month: '2023-11', totalAssets: 50200,  totalLiabilities: 26300 },
  { id: 'n5',  month: '2023-12', totalAssets: 54900,  totalLiabilities: 25900 },
  { id: 'n6',  month: '2024-01', totalAssets: 56300,  totalLiabilities: 25500 },
  { id: 'n7',  month: '2024-02', totalAssets: 58100,  totalLiabilities: 25100 },
  { id: 'n8',  month: '2024-03', totalAssets: 61400,  totalLiabilities: 24700 },
  { id: 'n9',  month: '2024-04', totalAssets: 63800,  totalLiabilities: 24200 },
  { id: 'n10', month: '2024-05', totalAssets: 65500,  totalLiabilities: 23800 },
  { id: 'n11', month: '2024-06', totalAssets: 68900,  totalLiabilities: 25740 },
  { id: 'n12', month: '2024-07', totalAssets: 72400,  totalLiabilities: 25740 },
];

export const SAMPLE_DATA: FinancialData = {
  portfolio:    SAMPLE_PORTFOLIO,
  budget:       SAMPLE_BUDGET,
  savingsGoals: SAMPLE_SAVINGS_GOALS,
  debt:         SAMPLE_DEBT,
  netWorth:     SAMPLE_NET_WORTH,
};
