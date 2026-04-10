import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DnaVisualizerComponent } from '../../../shared/components/dna-visualizer/dna-visualizer.component';

@Component({
  selector: 'app-dna-preview',
  standalone: true,
  imports: [NgIf, DnaVisualizerComponent],
  template: `
    <div class="glass-card p-5" *ngIf="specialization">
      <p class="text-xs uppercase text-forge-muted">DNA Preview</p>
      <h3 class="mt-1 font-display text-xl text-white">{{ specialization }}</h3>
      <p class="mt-2 text-sm text-slate-300">{{ personality }}</p>
      <div class="mt-4">
        <app-dna-visualizer [skillScores]="scores"></app-dna-visualizer>
      </div>
      <p class="mt-4 text-xs text-forge-muted">Estimated mint cost: {{ estimatedMintCost }} HLUSD</p>
    </div>
  `
})
export class DnaPreviewComponent {
  @Input() specialization = '';
  @Input() personality = 'Adaptive and performance-obsessed, tuned for long-term evolution.';
  @Input() scores: number[] = [62, 68, 74, 71, 79];
  @Input() estimatedMintCost = '0.010';
}
