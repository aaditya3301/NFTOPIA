import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AgentConfig } from '../../../core/models/agent.model';

interface TrainingParam {
  name: string;
  value: number;
  target: number;
  unit: string;
}

@Component({
  selector: 'app-trading-agent-monitor',
  standalone: true,
  imports: [NgFor, NgIf, DecimalPipe],
  template: `
    <section class="space-y-4" *ngIf="tradingAgents.length > 0">
      <h2 class="font-display text-2xl text-white">Trading Agent Monitor</h2>
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div *ngFor="let agent of tradingAgents" class="glass-card p-5 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-display text-lg text-white">Agent #{{ agent.tokenId }}</h3>
              <p class="text-xs text-forge-muted">{{ agent.specialization }} -- {{ agent.agentType }}</p>
            </div>
            <div class="rounded-lg border border-forge-secondary/30 bg-forge-secondary/10 px-3 py-1">
              <span class="text-xs font-mono text-forge-secondary">Training</span>
            </div>
          </div>

          <div class="rounded-xl border border-forge-border bg-[#091825] p-4 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-forge-muted">Time remaining</span>
              <span class="font-mono text-forge-warning">{{ timeRemaining }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-forge-muted">Overall progress</span>
              <span class="font-mono text-forge-secondary">{{ overallProgress | number:'1.1-1' }}%</span>
            </div>
            <div class="w-full rounded-full bg-[#0a1a28] h-2 mt-1">
              <div class="h-2 rounded-full bg-gradient-to-r from-forge-primary to-forge-secondary transition-all duration-500"
                [style.width.%]="overallProgress"></div>
            </div>
          </div>

          <div class="rounded-xl border border-forge-border bg-[#091825] p-4">
            <p class="text-xs uppercase text-forge-muted mb-3">Training Parameters (15)</p>
            <div class="grid grid-cols-1 gap-2">
              <div *ngFor="let param of trainingParams" class="flex items-center justify-between text-xs">
                <span class="text-slate-400 w-40 truncate">{{ param.name }}</span>
                <div class="flex-1 mx-3 rounded-full bg-[#0a1a28] h-1.5">
                  <div class="h-1.5 rounded-full transition-all duration-700"
                    [style.width.%]="(param.value / param.target) * 100"
                    [class]="param.value >= param.target * 0.8 ? 'bg-forge-secondary' : 'bg-forge-primary'"></div>
                </div>
                <span class="font-mono text-slate-300 w-20 text-right">{{ param.value | number:'1.2-2' }}{{ param.unit }}</span>
              </div>
            </div>
          </div>

          <button class="btn-forge w-full" (click)="allocate.emit(agent)">Allocate Funds</button>
        </div>
      </div>
    </section>
  `
})
export class TradingAgentMonitorComponent implements OnInit, OnDestroy {
  @Input() tradingAgents: AgentConfig[] = [];
  @Output() allocate = new EventEmitter<AgentConfig>();

  timeRemaining = '4d 00h 00m';
  overallProgress = 0;
  trainingParams: TrainingParam[] = [];
  private interval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.initTrainingParams();
    this.startSimulation();
  }

  ngOnDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private initTrainingParams(): void {
    this.trainingParams = [
      { name: 'Sharpe Ratio', value: 0.12, target: 2.5, unit: '' },
      { name: 'Max Drawdown', value: 18.4, target: 5.0, unit: '%' },
      { name: 'Win Rate', value: 32.1, target: 65.0, unit: '%' },
      { name: 'Risk-Reward Ratio', value: 0.8, target: 3.2, unit: '' },
      { name: 'Sortino Ratio', value: 0.05, target: 1.8, unit: '' },
      { name: 'Alpha Generation', value: -0.3, target: 4.5, unit: '%' },
      { name: 'Beta Exposure', value: 1.4, target: 0.3, unit: '' },
      { name: 'Calmar Ratio', value: 0.2, target: 2.0, unit: '' },
      { name: 'Profit Factor', value: 0.7, target: 2.8, unit: '' },
      { name: 'Avg Trade Duration', value: 45.0, target: 12.0, unit: 'min' },
      { name: 'Position Sizing', value: 15.2, target: 85.0, unit: '%' },
      { name: 'Entry Accuracy', value: 28.5, target: 72.0, unit: '%' },
      { name: 'Exit Timing', value: 22.1, target: 68.0, unit: '%' },
      { name: 'Volatility Adj.', value: 0.3, target: 1.5, unit: '' },
      { name: 'Momentum Score', value: 18.0, target: 80.0, unit: '' },
    ];
  }

  private startSimulation(): void {
    // Very slow simulation — realistic training that takes "days" 
    // Update every 3 seconds, small increments to simulate slow progress
    this.interval = setInterval(() => {
      let totalProgress = 0;

      this.trainingParams = this.trainingParams.map(param => {
        // Small random increment toward target
        const step = (param.target - param.value) * (0.001 + Math.random() * 0.003);
        const noise = (Math.random() - 0.4) * step * 0.5;
        const newValue = param.value + step + noise;
        const clampedValue = Math.min(param.target * 1.05, Math.max(0, newValue));

        const paramProgress = Math.min(100, (clampedValue / param.target) * 100);
        totalProgress += paramProgress;

        return { ...param, value: clampedValue };
      });

      this.overallProgress = Math.min(99.9, totalProgress / this.trainingParams.length);

      // Update time remaining (simulated countdown)
      const remainingMs = (100 - this.overallProgress) / 100 * 4 * 24 * 60 * 60 * 1000;
      const days = Math.floor(remainingMs / 86400000);
      const hours = Math.floor((remainingMs % 86400000) / 3600000);
      const minutes = Math.floor((remainingMs % 3600000) / 60000);
      this.timeRemaining = `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
    }, 3000);
  }
}
