import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-level-badge',
  standalone: true,
  template: `
    <span class="rounded-full border border-forge-secondary/50 bg-black/60 px-2 py-1 font-mono text-xs text-forge-secondary">
      LVL {{ level }}
    </span>
  `
})
export class LevelBadgeComponent {
  @Input() level = 1;
}
