import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  template: `
    <div class="glass-card p-4">
      <p class="text-xs uppercase tracking-wide text-forge-muted">{{ label }}</p>
      <p class="mt-1 font-display text-2xl text-white">{{ value }}</p>
      <p class="mt-1 text-xs" [class.text-forge-success]="delta && delta.startsWith('+')" [class.text-forge-danger]="delta && delta.startsWith('-')">
        {{ delta }}
      </p>
    </div>
  `
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value = '';
  @Input() delta = '';
}
