import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="inline-flex items-center gap-3" [class.text-sm]="small">
      <div class="h-5 w-5 animate-spin rounded-full border-2 border-forge-border border-t-forge-secondary"></div>
      <span class="text-forge-muted">{{ label }}</span>
    </div>
  `
})
export class LoadingSpinnerComponent {
  @Input() label = 'Loading...';
  @Input() small = false;
}
