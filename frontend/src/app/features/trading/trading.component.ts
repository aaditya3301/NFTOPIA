import { NgIf } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TradeLog, TradingAgent } from '../../core/models/trade.model';
import { NotificationService } from '../../core/services/notification.service';
import { TradingService } from '../../core/services/trading.service';
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
          <app-pnl-chart [pnlValues]="pnlSeries()"></app-pnl-chart>
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
export class TradingComponent {
  private readonly trading = inject(TradingService);
  private readonly notify = inject(NotificationService);

  readonly tab = signal<'market' | 'build'>('market');
  readonly bots = signal<TradingAgent[]>([]);
  readonly selectedBot = signal<TradingAgent | null>(null);
  readonly tradeLog = signal<TradeLog[]>([]);
  readonly pnlSeries = signal<number[]>([0, 40, 62, 55, 80, 102, 116]);
  readonly trainingEpoch = signal(0);
  readonly trainingSharpe = signal(0);
  readonly trainingDrawdown = signal(0);
  readonly rewardCurve = signal<number[]>([0.1]);

  strategyFilter = '';
  riskFilter = '';
  trackRecordFilter = '';
  sortBy: 'returns' | 'consistency' | 'popularity' = 'returns';

  constructor() {
    this.trading.getLeaderboard().subscribe({
      next: (bots) => this.bots.set(bots),
      error: () => {
        this.bots.set([
          {
            tokenId: 88,
            strategyType: 'momentum_trader',
            assets: ['BTC', 'ETH'],
            returns30d: 18.4,
            returns90d: 42.1,
            winRate: 63,
            totalTrades: 142,
            usersAllocated: 31,
            totalAllocated: 125400,
            maxDrawdown: 12.1,
            sharpeRatio: 1.82,
            operatingSince: '2026-01-05',
            rank: 1,
            traits: ['antifragile'],
            level: 10
          }
        ]);
      }
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

        if (this.riskFilter === 'low') {
          return bot.maxDrawdown <= 8;
        }

        if (this.riskFilter === 'medium') {
          return bot.maxDrawdown > 8 && bot.maxDrawdown <= 15;
        }

        return bot.maxDrawdown > 15;
      })
      .filter((bot) => {
        if (!this.trackRecordFilter) {
          return true;
        }

        const days = Number(this.trackRecordFilter);
        const since = new Date(bot.operatingSince).getTime();
        const age = (Date.now() - since) / (1000 * 60 * 60 * 24);
        return age >= days;
      });
  }

  sortLeaderboard(): void {
    const sorted = [...this.bots()];
    if (this.sortBy === 'returns') {
      sorted.sort((a, b) => b.returns30d - a.returns30d);
    } else if (this.sortBy === 'consistency') {
      sorted.sort((a, b) => b.sharpeRatio - a.sharpeRatio);
    } else {
      sorted.sort((a, b) => b.usersAllocated - a.usersAllocated);
    }
    this.bots.set(sorted);
  }

  openAllocation(bot: TradingAgent): void {
    this.selectedBot.set(bot);
    this.tradeLog.set([
      {
        tradeId: 't_991',
        action: 'BUY',
        asset: bot.assets[0] ?? 'BTC',
        entryPrice: 67500,
        exitPrice: null,
        quantityForge: 1200,
        pnlForge: 0,
        reasoning: 'Momentum signal + volume breakout',
        timestamp: '2026-04-10T11:30:00Z'
      },
      {
        tradeId: 't_990',
        action: 'SELL',
        asset: bot.assets[1] ?? 'ETH',
        entryPrice: 3380,
        exitPrice: 3528,
        quantityForge: 900,
        pnlForge: 84,
        reasoning: 'Target reached and volatility rising',
        timestamp: '2026-04-10T09:05:00Z'
      }
    ]);
  }

  confirmAllocation(payload: { bot: TradingAgent; amount: number }): void {
    this.notify.success(`Successfully allocated ${payload.amount} $FORGE to Agent #${payload.bot.tokenId}`);
  }

  startTraining(_config: unknown): void {
    this.notify.info('Training started');
    let epoch = 0;
    const rewards: number[] = [0.08];
    const timer = setInterval(() => {
      epoch += 5;
      this.trainingEpoch.set(epoch);
      const reward = Number((rewards[rewards.length - 1] + Math.random() * 0.08).toFixed(3));
      rewards.push(reward);
      this.rewardCurve.set([...rewards]);
      this.trainingSharpe.set(0.8 + epoch / 100);
      this.trainingDrawdown.set(Math.max(2.5, 12 - epoch / 12));
      if (epoch >= 100) {
        clearInterval(timer);
        this.notify.success('Training complete. You can now mint the custom bot.');
      }
    }, 350);
  }
}
