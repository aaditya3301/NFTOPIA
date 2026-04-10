import { DecimalPipe, NgFor } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TradeLog } from '../../../core/models/trade.model';

@Component({
  selector: 'app-trade-log-table',
  standalone: true,
  imports: [NgFor, DecimalPipe],
  template: `
    <div class="glass-card overflow-hidden">
      <h3 class="border-b border-forge-border p-4 font-display text-xl text-white">Recent Trades</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-[#0b1f2e] text-xs uppercase text-forge-muted">
            <tr>
              <th class="px-4 py-2 text-left">Action</th>
              <th class="px-4 py-2 text-left">Asset</th>
              <th class="px-4 py-2 text-left">Entry</th>
              <th class="px-4 py-2 text-left">Exit</th>
              <th class="px-4 py-2 text-left">PnL</th>
              <th class="px-4 py-2 text-left">Time</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let trade of trades" class="border-t border-forge-border/70">
              <td class="px-4 py-2" [class.text-forge-secondary]="trade.action === 'BUY'" [class.text-forge-warning]="trade.action === 'HOLD'" [class.text-forge-danger]="trade.action === 'SELL'">{{ trade.action }}</td>
              <td class="px-4 py-2">{{ trade.asset }}</td>
              <td class="px-4 py-2">{{ trade.entryPrice | number: '1.2-2' }}</td>
              <td class="px-4 py-2">{{ trade.exitPrice ?? '-' }}</td>
              <td class="px-4 py-2" [class.text-forge-success]="(trade.pnlForge ?? 0) >= 0" [class.text-forge-danger]="(trade.pnlForge ?? 0) < 0">{{ trade.pnlForge ?? 0 | number: '1.2-2' }}</td>
              <td class="px-4 py-2 text-xs text-forge-muted">{{ trade.timestamp }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class TradeLogTableComponent {
  @Input() trades: TradeLog[] = [];
}
