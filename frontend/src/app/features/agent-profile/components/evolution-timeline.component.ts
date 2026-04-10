import { NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface EvolutionTimelineItem {
  title: string;
  time: string;
  reason?: string;
}

@Component({
  selector: 'app-evolution-timeline',
  standalone: true,
  imports: [NgFor, NgIf],
  template: `
    <div class="glass-card p-5">
      <h3 class="font-display text-2xl text-white">Evolution Timeline</h3>
      <div class="mt-4 space-y-3">
        <div *ngFor="let event of events" class="rounded-xl border border-forge-border bg-[#091a27] p-3">
          <p class="text-sm text-slate-200">{{ event.title }}</p>
          <p class="text-xs text-forge-muted">{{ event.time }}</p>
          <p class="mt-1 text-xs text-slate-400" *ngIf="event.reason">{{ event.reason }}</p>
        </div>
      </div>
    </div>
  `
})
export class EvolutionTimelineComponent {
  @Input() events: EvolutionTimelineItem[] = [];
}
