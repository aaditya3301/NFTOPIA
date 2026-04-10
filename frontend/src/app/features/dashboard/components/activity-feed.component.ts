import { NgFor } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [NgFor],
  template: `
    <div class="glass-card p-5">
      <h3 class="font-display text-2xl text-white">Activity Feed</h3>
      <ul class="mt-3 space-y-3 text-sm text-slate-300">
        <li *ngFor="let item of items">{{ item }}</li>
      </ul>
    </div>
  `
})
export class ActivityFeedComponent {
  @Input() items: string[] = [];
}
