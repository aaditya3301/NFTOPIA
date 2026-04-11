import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomBotConfig } from '../../../core/models/trade.model';

@Component({
  selector: 'app-custom-bot-builder',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="glass-card space-y-4 p-5">
      <h2 class="font-display text-2xl text-white">Custom Bot Builder</h2>

      <label class="block text-sm text-forge-muted">Strategy Prompt</label>
      <textarea
        class="w-full rounded-lg border border-forge-border bg-[#081726] p-2 text-sm text-slate-100 placeholder:text-slate-500"
        rows="3"
        placeholder="Describe your trading strategy... e.g. 'Aggressive momentum trader that buys on breakouts and sells on RSI divergence'"
        [(ngModel)]="strategyPrompt"
      ></textarea>

      <label class="block text-sm text-forge-muted">Market</label>
      <select class="w-full rounded-lg border border-forge-border bg-[#081726] p-2" [(ngModel)]="form.market">
        <option value="spot">Spot</option>
        <option value="options">Options</option>
        <option value="futures">Futures</option>
      </select>

      <label class="block text-sm text-forge-muted">Assets (comma separated)</label>
      <input class="w-full rounded-lg border border-forge-border bg-[#081726] p-2" [(ngModel)]="assetsInput" />

      <label class="block text-sm text-forge-muted">Goal</label>
      <select class="w-full rounded-lg border border-forge-border bg-[#081726] p-2" [(ngModel)]="form.goal">
        <option value="maximize_returns">Maximize Returns</option>
        <option value="maximize_sharpe">Maximize Sharpe Ratio</option>
        <option value="minimize_drawdown">Minimize Drawdown</option>
      </select>

      <label class="block text-sm text-forge-muted">Risk Tolerance</label>
      <select class="w-full rounded-lg border border-forge-border bg-[#081726] p-2" [(ngModel)]="form.riskTolerance">
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <label class="block text-sm text-forge-muted">Training Period</label>
      <select class="w-full rounded-lg border border-forge-border bg-[#081726] p-2" [(ngModel)]="form.trainingPeriod">
        <option value="3m">3 months</option>
        <option value="6m">6 months</option>
        <option value="12m">1 year</option>
      </select>

      <button class="btn-forge" (click)="submit()">Start RL Training</button>
    </div>
  `
})
export class CustomBotBuilderComponent {
  @Output() train = new EventEmitter<CustomBotConfig & { strategyPrompt?: string }>();

  strategyPrompt = '';
  assetsInput = 'BTC,ETH';
  form: CustomBotConfig = {
    market: 'spot',
    assets: ['BTC', 'ETH'],
    goal: 'maximize_returns',
    riskTolerance: 'medium',
    trainingPeriod: '6m'
  };

  submit(): void {
    this.train.emit({
      ...this.form,
      assets: this.assetsInput
        .split(',')
        .map((asset) => asset.trim().toUpperCase())
        .filter(Boolean),
      strategyPrompt: this.strategyPrompt
    });
  }
}
