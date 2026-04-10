import { Component, Input } from '@angular/core';
import { DnaVisualizerComponent } from '../../../shared/components/dna-visualizer/dna-visualizer.component';

@Component({
  selector: 'app-dna-card',
  standalone: true,
  imports: [DnaVisualizerComponent],
  template: `
    <div class="glass-card p-5">
      <h2 class="font-display text-2xl text-white">DNA Card</h2>
      <p class="mt-2 text-sm text-slate-300">{{ personality }}</p>
      <div class="mt-4">
        <app-dna-visualizer [skillScores]="skillScores"></app-dna-visualizer>
      </div>
    </div>
  `
})
export class DnaCardComponent {
  @Input() personality = 'Adaptive creator tuned for quality and virality.';
  @Input() skillScores: number[] = [84, 73, 68, 81, 76];
}
