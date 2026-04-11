import { Component, Input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-earnings-summary',
  standalone: true,
  imports: [BaseChartDirective],
  template: `
    <div class="glass-card p-5">
      <h3 class="font-display text-2xl text-white">Earnings Breakdown</h3>
      <div class="mt-3 h-64">
        <canvas baseChart [type]="'bar'" [data]="barData" [options]="barOptions"></canvas>
      </div>
    </div>
  `
})
export class EarningsSummaryComponent {
  @Input() labels: string[] = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

  readonly barData: ChartConfiguration<'bar'>['data'] = {
    labels: this.labels,
    datasets: [
      { label: 'Content Sales', data: [0, 0, 0, 0], backgroundColor: '#0EA5A1' },
      { label: 'Royalties', data: [0, 0, 0, 0], backgroundColor: '#22D3EE' },
      { label: 'Trading Fees', data: [0, 0, 0, 0], backgroundColor: '#F97316' },
      { label: 'Rental Income', data: [0, 0, 0, 0], backgroundColor: '#A78BFA' }
    ]
  };

  readonly barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#b5c7d8' } } },
    scales: {
      x: { stacked: true, ticks: { color: '#89a0b5' }, grid: { color: 'rgba(137,160,181,.15)' } },
      y: { stacked: true, ticks: { color: '#89a0b5' }, grid: { color: 'rgba(137,160,181,.15)' } }
    }
  };
}
