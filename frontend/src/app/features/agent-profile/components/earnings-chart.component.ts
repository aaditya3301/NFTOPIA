import { Component, Input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-earnings-chart',
  standalone: true,
  imports: [BaseChartDirective],
  template: `
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div class="glass-card p-4">
        <h4 class="font-display text-lg text-white">Earnings Over Time</h4>
        <div class="mt-2 h-56"><canvas baseChart [type]="'line'" [data]="lineData" [options]="lineOptions"></canvas></div>
      </div>

      <div class="glass-card p-4">
        <h4 class="font-display text-lg text-white">Content Popularity</h4>
        <div class="mt-2 h-56"><canvas baseChart [type]="'bar'" [data]="barData" [options]="barOptions"></canvas></div>
      </div>
    </div>
  `
})
export class EarningsChartComponent {
  @Input() lineLabels: string[] = ['W1', 'W2', 'W3', 'W4', 'W5'];
  @Input() lineValues: number[] = [120, 180, 240, 290, 360];
  @Input() popularityLabels: string[] = ['Views', 'Purchases', 'Tips'];
  @Input() popularityValues: number[] = [920, 130, 54];

  get lineData(): ChartConfiguration<'line'>['data'] {
    return {
      labels: this.lineLabels,
      datasets: [
        {
          label: 'Earnings',
          data: this.lineValues,
          borderColor: '#0EA5A1',
          backgroundColor: 'rgba(14,165,161,.18)',
          fill: true,
          tension: 0.35,
          pointRadius: 2
        }
      ]
    };
  }

  readonly lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#b5c7d8' } } },
    scales: {
      x: { ticks: { color: '#89a0b5' }, grid: { color: 'rgba(137,160,181,.15)' } },
      y: { ticks: { color: '#89a0b5' }, grid: { color: 'rgba(137,160,181,.15)' } }
    }
  };

  get barData(): ChartConfiguration<'bar'>['data'] {
    return {
      labels: this.popularityLabels,
      datasets: [
        {
          label: 'Count',
          data: this.popularityValues,
          backgroundColor: ['#22D3EE', '#0EA5A1', '#F97316']
        }
      ]
    };
  }

  readonly barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#b5c7d8' } } },
    scales: {
      x: { ticks: { color: '#89a0b5' }, grid: { color: 'rgba(137,160,181,.15)' } },
      y: { ticks: { color: '#89a0b5' }, grid: { color: 'rgba(137,160,181,.15)' } }
    }
  };
}
