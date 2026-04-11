import { NgIf } from '@angular/common';
import { Component, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CustomBotConfig, TradeLog, TradingAgent } from '../../core/models/trade.model';
import { NotificationService } from '../../core/services/notification.service';
import { TradingService } from '../../core/services/trading.service';
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
    <section class="mx-auto max-w-7xl space-y-7">
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div class="page-header">
          <p class="section-kicker">Invest</p>
          <h1>Trading Dashboard</h1>
          <p>Allocate capital to verified bots or train your own RL model.</p>
        </div>
        <div class="pill-tabs">
          <button
            class="pill-tab"
            [class]="tab() === 'market' ? 'pill-tab--active' : 'pill-tab--inactive'"
            (click)="tab.set('market')"
          >Marketplace Bots</button>
          <button
            class="pill-tab"
            [class]="tab() === 'build' ? 'pill-tab--active' : 'pill-tab--inactive'"
            (click)="tab.set('build')"
          >Build Your Own</button>
        </div>
      </header>

      <div class="space-y-4" *ngIf="tab() === 'market'">
        <div class="glass-card p-4">
          <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
            <input class="input-light" placeholder="Strategy" [(ngModel)]="strategyFilter" />
            <select class="input-light" [(ngModel)]="riskFilter">
              <option value="">All risk levels</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <select class="input-light" [(ngModel)]="trackRecordFilter">
              <option value="">Any track record</option>
              <option value="7">7d+</option>
              <option value="30">30d+</option>
              <option value="90">90d+</option>
            </select>
            <select class="input-light" [(ngModel)]="sortBy" (ngModelChange)="sortLeaderboard()">
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
        <app-training-visualizer [epoch]="trainingEpoch()" [totalEpochs]="100" [rewards]="rewardCurve()" [sharpe]="trainingSharpe()" [maxDrawdown]="trainingDrawdown()"></app-training-visualizer>
      </div>
    </section>
  `
})
export class TradingComponent implements OnDestroy {
  private readonly trading = inject(TradingService);
  private readonly notify = inject(NotificationService);
  private readonly ws = inject(WebSocketService);

  private tradingFeedSub: Subscription | null = null;
  private trainingFeedSub: Subscription | null = null;
  private activeTrainingId: string | null = null;
  private activeTradingToken: number | null = null;

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

  strategyFilter = '';
  riskFilter = '';
  trackRecordFilter = '';
  sortBy: 'returns' | 'consistency' | 'popularity' = 'returns';

  constructor() {
    this.loadLeaderboard();
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
  }

  private loadLeaderboard(): void {
    this.trading.getLeaderboard().subscribe({
      next: (bots) => this.bots.set(bots),
      error: () => this.notify.error('Failed to load trading leaderboard')
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

  startTraining(config: CustomBotConfig): void {
    this.trainingEpoch.set(0);
    this.trainingSharpe.set(0);
    this.trainingDrawdown.set(0);
    this.rewardCurve.set([]);

    this.trading.createCustomBot(config).subscribe({
      next: (res) => {
        this.notify.info('Training started');

        if (this.activeTrainingId) {
          this.ws.disconnect(`training/${this.activeTrainingId}`);
        }
        this.trainingFeedSub?.unsubscribe();
        this.activeTrainingId = res.trainingId;

        this.trainingFeedSub = this.ws.subscribeTrainingFeed(res.trainingId).subscribe({
          next: (packet) => {
            if (typeof packet !== 'object' || packet === null) {
              return;
            }

            const data = packet as {
              status?: string;
              ready?: boolean;
              progress?: Record<string, unknown>;
              result?: { metrics?: { sharpe_ratio?: number; max_drawdown_pct?: number } };
              error?: string;
            };

            const progress = data.progress ?? {};
            const pct = Number(progress['progressPct'] ?? progress['progress_pct'] ?? 0);
            if (Number.isFinite(pct)) {
              this.trainingEpoch.set(Math.max(0, Math.min(100, Math.round(pct))));
            }

            const reward = Number(progress['current_reward'] ?? progress['reward'] ?? Number.NaN);
            if (Number.isFinite(reward)) {
              this.rewardCurve.update((current) => [...current, reward]);
            }

            const sharpe = Number(progress['sharpe_ratio'] ?? progress['sharpe'] ?? Number.NaN);
            if (Number.isFinite(sharpe)) {
              this.trainingSharpe.set(sharpe);
            }

            const drawdown = Number(progress['max_drawdown_pct'] ?? progress['max_drawdown'] ?? Number.NaN);
            if (Number.isFinite(drawdown)) {
              this.trainingDrawdown.set(drawdown);
            }

            if (data.result?.metrics) {
              const metrics = data.result.metrics;
              if (typeof metrics.sharpe_ratio === 'number') {
                this.trainingSharpe.set(metrics.sharpe_ratio);
              }
              if (typeof metrics.max_drawdown_pct === 'number') {
                this.trainingDrawdown.set(metrics.max_drawdown_pct);
              }
            }

            if (data.error) {
              this.notify.error(data.error);
            }

            if (data.ready || data.status === 'SUCCESS' || data.status === 'FAILURE') {
              this.trainingEpoch.set(100);
              this.notify.success('Training complete. You can now mint the custom bot.');
            }
          }
        });
      },
      error: () => this.notify.error('Could not start training job')
    });
  }
}
