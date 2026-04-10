import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-trait-badge',
  standalone: true,
  template: `
    <span class="rounded-full border border-forge-primary/40 bg-forge-primary/10 px-2 py-0.5 text-xs text-forge-primary">
      {{ trait }}
    </span>
  `
})
export class TraitBadgeComponent {
  @Input() trait = '';
}
