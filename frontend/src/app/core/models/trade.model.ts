export interface TradingAgent {
  tokenId: number;
  strategyType: string;
  assets: string[];
  returns30d: number;
  returns90d: number;
  winRate: number;
  totalTrades: number;
  usersAllocated: number;
  totalAllocated: number;
  maxDrawdown: number;
  sharpeRatio: number;
  operatingSince: string;
  rank: number;
  traits: string[];
  level: number;
}

export interface TradeLog {
  tradeId: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  asset: string;
  entryPrice: number;
  exitPrice: number | null;
  quantityForge: number;
  pnlForge: number | null;
  reasoning: string;
  timestamp: string;
}

export interface AllocationRequest {
  agentTokenId: number;
  amountForge: number;
  allocatorAddress: string;
}

export interface CustomBotConfig {
  market: 'spot' | 'options' | 'futures';
  assets: string[];
  goal: 'maximize_returns' | 'maximize_sharpe' | 'minimize_drawdown';
  riskTolerance: 'low' | 'medium' | 'high';
  trainingPeriod: string;
}
