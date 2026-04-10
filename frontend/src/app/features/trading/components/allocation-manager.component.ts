import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TradingAgent } from '../../../core/models/trade.model';

@Component({
  selector: 'app-allocation-manager',
  standalone: true,
  imports: [NgIf, FormsModule],
  template: `
    <div class="glass-card p-5" *ngIf="selectedBot">
      <h3 class="font-display text-xl text-white">Allocate to Agent #{{ selectedBot.tokenId }}</h3>
      <p class="mt-1 text-sm text-forge-muted">Strategy: {{ selectedBot.strategyType }} · Win rate {{ selectedBot.winRate }}%</p>

      <label class="mt-4 block text-xs uppercase text-forge-muted">Amount ($FORGE)</label>
      <input
        type="number"
        min="1"
        class="mt-2 w-full rounded-lg border border-forge-border bg-[#081726] px-3 py-2 text-sm text-slate-200"
        [(ngModel)]="amount"
      />

      <p class="mt-2 text-xs text-forge-warning">Risk reminder: capital allocation is subject to trading volatility.</p>

      <button class="btn-forge mt-4" (click)="submitAllocation()">Confirm Allocation</button>
    </div>
  `
})
export class AllocationManagerComponent {
  @Input() selectedBot: TradingAgent | null = null;
  @Output() allocate = new EventEmitter<{ bot: TradingAgent; amount: number }>();

  amount = 100;

  submitAllocation(): void {
    if (!this.selectedBot || this.amount <= 0) {
      return;
    }

    this.allocate.emit({ bot: this.selectedBot, amount: this.amount });
  }
}
