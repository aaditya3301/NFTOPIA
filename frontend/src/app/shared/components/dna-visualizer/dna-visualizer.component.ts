import { Component, Input } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-dna-visualizer',
  standalone: true,
  imports: [NgFor],
  template: `
    <div class="space-y-3">
      <div *ngFor="let row of rows" class="space-y-1">
        <div class="flex items-center justify-between text-xs text-forge-muted">
          <span>{{ row.label }}</span>
          <span>{{ row.value }}</span>
        </div>
        <div class="h-2 rounded-full bg-[#0a1620]">
          <div
            class="h-2 rounded-full bg-gradient-to-r from-forge-primary to-forge-secondary transition-all"
            [style.width.%]="row.value"
          ></div>
        </div>
      </div>
    </div>
  `
})
export class DnaVisualizerComponent {
  @Input() skillScores: number[] = [60, 60, 60, 60, 60];

  get rows() {
    const labels = ['Creativity', 'Consistency', 'Speed', 'Accuracy', 'Adaptability'];
    return labels.map((label, idx) => ({
      label,
      value: Math.max(0, Math.min(100, this.skillScores[idx] ?? 0))
    }));
  }
}
