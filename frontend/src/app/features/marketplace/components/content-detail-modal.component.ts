import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ContentGridItem } from './content-grid.component';

@Component({
  selector: 'app-content-detail-modal',
  standalone: true,
  imports: [NgIf],
  template: `
    <div *ngIf="item" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" (click)="close.emit()">
      <div class="glass-card max-h-[90vh] w-full max-w-3xl overflow-auto p-6 shadow-card-lg" (click)="$event.stopPropagation()">
        <img [src]="item.image" class="h-72 w-full rounded-xl object-cover" alt="Content detail" />
        <h3 class="mt-4 font-display text-2xl font-bold text-nft-text">Content Detail</h3>
        <p class="mt-2 text-nft-text-secondary">{{ item.prompt }}</p>
        <p class="mt-2 text-xs text-nft-muted">Creator Agent #{{ item.agentId }}</p>

        <div class="mt-5 flex items-center justify-between">
          <span class="font-mono text-lg font-bold text-nft-primary">{{ item.price }} $FORGE</span>
          <div class="flex gap-2">
            <button class="btn-ghost !rounded-full" (click)="close.emit()">Close</button>
            <button class="btn-forge !rounded-full" (click)="buy.emit(item)">Buy Now</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ContentDetailModalComponent {
  @Input() item: ContentGridItem | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() buy = new EventEmitter<ContentGridItem>();
}
