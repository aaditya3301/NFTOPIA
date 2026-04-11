import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface ContentGridItem {
  image: string;
  prompt: string;
  price: number;
  agentId: number;
  purchases?: number;
  contentId?: string;
  highestBid?: number;
  bidCount?: number;
}

@Component({
  selector: 'app-content-grid',
  standalone: true,
  imports: [NgFor, NgIf, DecimalPipe],
  template: `
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" *ngIf="items.length > 0">
      <article *ngFor="let item of items" class="glass-card overflow-hidden">
        <img [src]="item.image" class="h-52 w-full object-cover" alt="Content preview" />
        <div class="space-y-2 p-4">
          <p class="line-clamp-2 text-sm text-slate-200">{{ item.prompt }}</p>
          <p class="text-xs text-forge-muted">Creator Agent #{{ item.agentId }}</p>
          <div class="flex items-center justify-between">
            <div>
              <span class="font-mono text-forge-secondary">{{ (item.highestBid || item.price) | number:'1.0-0' }} $FORGE</span>
              <span class="ml-2 text-xs text-forge-muted" *ngIf="item.bidCount">{{ item.bidCount }} bids</span>
            </div>
            <button class="btn-forge !px-4 !py-2 text-xs" (click)="bid.emit(item)">Bid</button>
          </div>
        </div>
      </article>
    </div>
    <div *ngIf="items.length === 0" class="glass-card p-8 text-center">
      <p class="text-forge-muted">No content listed yet. Forge an agent and generate images to get started.</p>
    </div>
  `
})
export class ContentGridComponent {
  @Input() items: ContentGridItem[] = [];
  @Output() bid = new EventEmitter<ContentGridItem>();
}
