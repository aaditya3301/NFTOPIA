import { NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ContentNft } from '../../../core/models/content.model';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-content-history',
  standalone: true,
  imports: [NgIf, NgFor, TitleCasePipe, TimeAgoPipe],
  template: `
    <div class="glass-card p-5">
      <h3 class="font-display text-xl text-white">Recent Outputs</h3>
      <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2" *ngIf="items.length; else emptyHistory">
        <button
          *ngFor="let item of items"
          class="rounded-xl border border-forge-border/80 bg-[#091927] p-3 text-left transition-all hover:border-forge-secondary/60"
          (click)="select.emit(item)"
        >
          <p class="truncate text-sm text-slate-200">{{ item.contentType | titlecase }} · {{ item.createdAt | timeAgo }}</p>
          <p class="text-xs text-forge-muted">Popularity {{ item.popularityScore }} · Views {{ item.views }} · Purchases {{ item.purchases }}</p>
        </button>
      </div>

      <ng-template #emptyHistory>
        <p class="mt-3 text-sm text-forge-muted">No generation history yet.</p>
      </ng-template>
    </div>
  `
})
export class ContentHistoryComponent {
  @Input() items: ContentNft[] = [];
  @Output() select = new EventEmitter<ContentNft>();
}
