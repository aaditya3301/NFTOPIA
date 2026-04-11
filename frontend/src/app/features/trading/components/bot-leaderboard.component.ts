import { DecimalPipe, NgFor } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TradingAgent } from '../../../core/models/trade.model';

@Component({
  selector: 'app-bot-leaderboard',
  standalone: true,
  imports: [NgFor, DecimalPipe],
  template: `
    <div class="glass-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-[#0b1f2e] text-xs uppercase text-forge-muted">
            <tr>
              <th class="px-4 py-3 text-left">Rank</th>
              <th class="px-4 py-3 text-left">Agent</th>
              <th class="px-4 py-3 text-left">Strategy</th>
              <th class="px-4 py-3 text-left">Total P&L</th>
              <th class="px-4 py-3 text-left">Trades</th>
              <th class="px-4 py-3 text-left">Win Rate</th>
              <th class="px-4 py-3 text-left">Sharpe</th>
              <th class="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let bot of bots" class="cursor-pointer border-t border-forge-border/70 hover:bg-[#0d2030]" (click)="open.emit(bot)">
              <td class="px-4 py-3">#{{ bot.rank }}</td>
              <td class="px-4 py-3">Agent #{{ bot.tokenId }}</td>
              <td class="px-4 py-3">{{ bot.strategyType }}</td>
              <td class="px-4 py-3" [class.text-forge-success]="bot.totalPnl >= 0" [class.text-forge-danger]="bot.totalPnl < 0">{{ bot.totalPnl | number: '1.1-2' }}</td>
              <td class="px-4 py-3">{{ bot.totalTrades }}</td>
              <td class="px-4 py-3">{{ bot.winRate | number: '1.0-0' }}%</td>
              <td class="px-4 py-3">{{ (bot.sharpeRatio ?? 0) | number: '1.1-2' }}</td>
              <td class="px-4 py-3">
                <button class="btn-ghost" (click)="allocate.emit(bot); $event.stopPropagation()">Allocate</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class BotLeaderboardComponent {
  @Input() bots: TradingAgent[] = [];
  @Output() allocate = new EventEmitter<TradingAgent>();
  @Output() open = new EventEmitter<TradingAgent>();
}
