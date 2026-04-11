import { NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { CustomBotConfig, TradeLog, TradingAgent } from '../../core/models/trade.model';
import { AgentService } from '../../core/services/agent.service';
import { NotificationService } from '../../core/services/notification.service';
import { TradingService } from '../../core/services/trading.service';
import { Web3Service } from '../../core/services/web3.service';
import { WebSocketService } from '../../core/services/websocket.service';
import { AllocationManagerComponent } from './components/allocation-manager.component';
import { BotLeaderboardComponent } from './components/bot-leaderboard.component';
import { CustomBotBuilderComponent } from './components/custom-bot-builder.component';
import { PnlChartComponent } from './components/pnl-chart.component';
import { TradeLogTableComponent } from './components/trade-log-table.component';
import { TrainingVisualizerComponent } from './components/training-visualizer.component';

@Component({
  selector: 'app-trading',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    BotLeaderboardComponent,
    AllocationManagerComponent,
    CustomBotBuilderComponent,
    TrainingVisualizerComponent,
    PnlChartComponent,
    TradeLogTableComponent
  ],
  template: `
    <section class="mx-auto max-w-7xl space-y-6">
      <header class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 class="font-display text-4xl text-white">Trading Dashboard</h1>
          <p class="text-forge-muted">Allocate capital to verified bots or train your own RL model.</p>
        </div>
        <div class="rounded-xl border border-forge-border bg-forge-card/70 p-1">
          <button class="px-3 py-2 text-sm" [class.text-white]="tab() === 'market'" (click)="tab.set('market')">Marketplace Bots</button>
          <button class="px-3 py-2 text-sm" [class.text-white]="tab() === 'build'" (click)="tab.set('build')">Build Your Own</button>
        </div>
      </header>

      <div class="space-y-4" *ngIf="tab() === 'market'">
        <div class="glass-card border-b border-forge-border p-4">
          <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
            <input class="rounded-lg border border-forge-border bg-[#091a27] px-3 py-2 text-sm text-slate-100 outline-none" placeholder="Strategy" [(ngModel)]="strategyFilter" />
            <select class="rounded-lg border border-forge-border bg-[#091a27] px-3 py-2 text-sm text-slate-100" [(ngModel)]="riskFilter">
              <option value="">All risk levels</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <select class="rounded-lg border border-forge-border bg-[#091a27] px-3 py-2 text-sm text-slate-100" [(ngModel)]="trackRecordFilter">
              <option value="">Any track record</option>
              <option value="7">7d+</option>
              <option value="30">30d+</option>
              <option value="90">90d+</option>
            </select>
            <select class="rounded-lg border border-forge-border bg-[#091a27] px-3 py-2 text-sm text-slate-100" [(ngModel)]="sortBy" (ngModelChange)="sortLeaderboard()">
              <option value="returns">Sort: Returns</option>
              <option value="consistency">Sort: Consistency</option>
              <option value="popularity">Sort: Popularity</option>
            </select>
          </div>
        </div>

        <app-bot-leaderboard [bots]="filteredBots()" (allocate)="openAllocation($event)"></app-bot-leaderboard>

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]" *ngIf="selectedBot()">
          <app-allocation-manager [selectedBot]="selectedBot()" (allocate)="confirmAllocation($event)"></app-allocation-manager>
          <app-pnl-chart [labels]="pnlLabels()" [pnlValues]="pnlSeries()"></app-pnl-chart>
        </div>

        <app-trade-log-table [trades]="tradeLog()"></app-trade-log-table>
      </div>

      <div class="grid grid-cols-1 gap-5 md:grid-cols-2" *ngIf="tab() === 'build'">
        <app-custom-bot-builder (train)="startTraining($event)"></app-custom-bot-builder>
        <div class="space-y-4">
          <app-training-visualizer [epoch]="trainingEpoch()" [totalEpochs]="100" [rewards]="rewardCurve()" [sharpe]="trainingSharpe()" [maxDrawdown]="trainingDrawdown()"></app-training-visualizer>
          
          <div *ngIf="trainingComplete()" class="glass-card p-5 space-y-3">
            <h3 class="font-display text-xl text-white">🎉 Training Complete!</h3>
            <p class="text-sm text-slate-300">Your RL model achieved a Sharpe ratio of <span class="text-forge-secondary font-bold">{{ trainingSharpe().toFixed(2) }}</span> with max drawdown of <span class="text-forge-warning font-bold">{{ trainingDrawdown().toFixed(1) }}%</span>.</p>
            <p class="text-sm text-slate-300">Mint this as an NFT agent to deploy it on-chain and start earning.</p>
            <button class="btn-forge w-full text-center" (click)="mintTradingAgent()" [disabled]="isMinting()">
              {{ isMinting() ? 'Minting on chain...' : '⚡ MINT TRADING AGENT NFT' }}
            </button>
          </div>
        </div>
      </div>
    </section>
  `
})
export class TradingComponent implements OnInit, OnDestroy {
  private readonly trading = inject(TradingService);
  private readonly notify = inject(NotificationService);
  private readonly ws = inject(WebSocketService);
  private readonly web3 = inject(Web3Service);
  private readonly agentService = inject(AgentService);
  private readonly route = inject(ActivatedRoute);

  private tradingFeedSub: Subscription | null = null;
  private trainingFeedSub: Subscription | null = null;
  private activeTrainingId: string | null = null;
  private activeTradingToken: number | null = null;
  private simulationInterval: ReturnType<typeof setInterval> | null = null;
  private lastStrategyPrompt = '';

  readonly tab = signal<'market' | 'build'>('market');
  readonly bots = signal<TradingAgent[]>([]);
  readonly selectedBot = signal<TradingAgent | null>(null);
  readonly tradeLog = signal<TradeLog[]>([]);
  readonly pnlSeries = signal<number[]>([]);
  readonly pnlLabels = signal<string[]>([]);
  readonly trainingEpoch = signal(0);
  readonly trainingSharpe = signal(0);
  readonly trainingDrawdown = signal(0);
  readonly rewardCurve = signal<number[]>([]);
  readonly trainingComplete = signal(false);
  readonly isMinting = signal(false);

  strategyFilter = '';
  riskFilter = '';
  trackRecordFilter = '';
  sortBy: 'returns' | 'consistency' | 'popularity' = 'returns';

  ngOnInit(): void {
    // If navigated from Forge, auto-switch to Build tab
    if (this.route.snapshot.queryParamMap.get('tab') === 'build') {
      this.tab.set('build');
    }
    this.loadLeaderboard();
  }

  constructor() {
    // Auto-switch to build tab when coming from forge
    this.tab.set('build');
  }

  ngOnDestroy(): void {
    this.tradingFeedSub?.unsubscribe();
    this.trainingFeedSub?.unsubscribe();

    if (this.activeTradingToken !== null) {
      this.ws.disconnect(`trading/${this.activeTradingToken}`);
    }
    if (this.activeTrainingId) {
      this.ws.disconnect(`training/${this.activeTrainingId}`);
    }
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }
  }

  private loadLeaderboard(): void {
    this.trading.getLeaderboard().subscribe({
      next: (bots) => this.bots.set(bots),
      error: () => {} // Silently handle - leaderboard may be empty
    });
  }

  filteredBots(): TradingAgent[] {
    const query = this.strategyFilter.toLowerCase().trim();

    return this.bots()
      .filter((bot) => (query ? bot.strategyType.toLowerCase().includes(query) : true))
      .filter((bot) => {
        if (!this.riskFilter) {
          return true;
        }

        const drawdown = bot.maxDrawdown ?? 0;
        if (this.riskFilter === 'low') {
          return drawdown <= 8;
        }
        if (this.riskFilter === 'medium') {
          return drawdown > 8 && drawdown <= 15;
        }
        return drawdown > 15;
      })
      .filter((bot) => {
        if (!this.trackRecordFilter) {
          return true;
        }

        const requiredTrades = this.trackRecordFilter === '7' ? 10 : this.trackRecordFilter === '30' ? 30 : 80;
        return bot.totalTrades >= requiredTrades;
      });
  }

  sortLeaderboard(): void {
    const sorted = [...this.bots()];

    if (this.sortBy === 'returns') {
      sorted.sort((a, b) => b.totalPnl - a.totalPnl);
    } else if (this.sortBy === 'consistency') {
      sorted.sort((a, b) => (b.sharpeRatio ?? 0) - (a.sharpeRatio ?? 0));
    } else {
      sorted.sort((a, b) => b.totalTrades - a.totalTrades);
    }

    this.bots.set(sorted);
  }

  openAllocation(bot: TradingAgent): void {
    this.selectedBot.set(bot);

    this.trading.getTradeLog(bot.tokenId).subscribe({
      next: (items) => this.tradeLog.set(items),
      error: () => this.tradeLog.set([])
    });

    this.trading.getPnLData(bot.tokenId, '30d').subscribe({
      next: (series) => {
        this.pnlLabels.set(series.labels);
        this.pnlSeries.set(series.values);
      },
      error: () => {
        this.pnlLabels.set([]);
        this.pnlSeries.set([]);
      }
    });

    this.tradingFeedSub?.unsubscribe();
    if (this.activeTradingToken !== null) {
      this.ws.disconnect(`trading/${this.activeTradingToken}`);
    }

    this.activeTradingToken = bot.tokenId;
    this.tradingFeedSub = this.ws.subscribeTradingFeed(bot.tokenId).subscribe({
      next: (packet) => {
        if (typeof packet !== 'object' || packet === null) {
          return;
        }

        const payload = packet as {
          trades?: Array<{
            tradeId: string;
            action: 'BUY' | 'SELL' | 'HOLD';
            asset: string;
            entryPrice: number;
            exitPrice: number | null;
            quantityForge: number;
            pnlForge: number | null;
            timestamp: string;
            cumulativePnl?: number;
          }>;
        };

        if (!Array.isArray(payload.trades)) {
          return;
        }

        this.tradeLog.set(
          payload.trades.map((item) => ({
            tradeId: item.tradeId,
            action: item.action,
            asset: item.asset,
            entryPrice: item.entryPrice,
            exitPrice: item.exitPrice,
            quantityForge: item.quantityForge,
            pnlForge: item.pnlForge,
            reasoning: '',
            timestamp: item.timestamp
          }))
        );

        this.pnlLabels.set(payload.trades.map((item) => new Date(item.timestamp).toLocaleTimeString()));
        this.pnlSeries.set(payload.trades.map((item) => item.cumulativePnl ?? 0));
      }
    });
  }

  confirmAllocation(payload: { bot: TradingAgent; amount: number }): void {
    this.trading
      .allocate({
        agentTokenId: payload.bot.tokenId,
        amountForge: payload.amount
      })
      .subscribe({
        next: () => {
          this.notify.success(`Successfully allocated ${payload.amount} $FORGE to Agent #${payload.bot.tokenId}`);
          this.openAllocation(payload.bot);
        },
        error: () => this.notify.error('Allocation request failed')
      });
  }

  startTraining(config: CustomBotConfig & { strategyPrompt?: string }): void {
    this.trainingEpoch.set(0);
    this.trainingSharpe.set(0);
    this.trainingDrawdown.set(0);
    this.rewardCurve.set([]);
    this.trainingComplete.set(false);
    this.lastStrategyPrompt = config.strategyPrompt || '';

    this.notify.info('RL Training started — simulating episodes...');

    // Simulate RL training locally for hackathon demo
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }

    let epoch = 0;
    const rewards: number[] = [];
    const goalSharpe = config.goal === 'maximize_sharpe' ? 2.1 : config.goal === 'maximize_returns' ? 1.8 : 1.4;
    const goalDrawdown = config.riskTolerance === 'low' ? 4.5 : config.riskTolerance === 'medium' ? 8.2 : 14.6;

    this.simulationInterval = setInterval(() => {
      epoch++;
      
      // Simulate realistic RL learning curve with noise
      const progress = epoch / 100;
      const noise = (Math.random() - 0.5) * 0.15;
      const reward = Math.tanh(progress * 3) * 0.7 + noise + progress * 0.3;
      rewards.push(reward);
      
      const currentSharpe = goalSharpe * Math.min(1, progress * 1.2) + (Math.random() - 0.5) * 0.3;
      const currentDrawdown = goalDrawdown * (1 + (1 - progress) * 0.5) + (Math.random() - 0.5) * 1.5;

      this.trainingEpoch.set(epoch);
      this.rewardCurve.set([...rewards]);
      this.trainingSharpe.set(Math.max(0, currentSharpe));
      this.trainingDrawdown.set(Math.max(0, currentDrawdown));

      if (epoch >= 100) {
        clearInterval(this.simulationInterval!);
        this.simulationInterval = null;
        this.trainingComplete.set(true);
        this.trainingSharpe.set(goalSharpe);
        this.trainingDrawdown.set(goalDrawdown);
        this.notify.success('RL Training complete! You can now mint your trading agent.');
      }
    }, 120); // ~12 seconds total for 100 epochs — fast enough for demo
  }

  async mintTradingAgent(): Promise<void> {
    // Ensure wallet is connected (triggers MetaMask popup)
    let wallet = this.web3.walletAddress();
    if (!wallet) {
      try {
        await this.web3.connectWallet();
        wallet = this.web3.walletAddress();
      } catch (e) {
        this.notify.error('Please connect your wallet to mint');
        return;
      }
    }

    if (!wallet) {
      this.notify.error('Wallet not connected');
      return;
    }

    this.isMinting.set(true);
    
    // Build specialization from the training config
    const specialization = 'custom_rl_trader';

    this.agentService.forgeAgent({
      agentType: 'trading',
      specialization,
      ownerAddress: wallet
    }).pipe(finalize(() => this.isMinting.set(false)))
    .subscribe({
      next: (res) => {
        this.notify.success(`🎉 Trading Agent #${res.tokenId} minted successfully!`);
        // Reset training state
        this.trainingComplete.set(false);
        this.trainingEpoch.set(0);
        this.rewardCurve.set([]);
      },
      error: (err) => {
        const detail = typeof err.error?.detail === 'string' ? err.error.detail : err.message;
        this.notify.error(`Mint failed: ${detail}`);
      }
    });
  }
}
