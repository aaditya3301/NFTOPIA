import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ContentGridItem } from './content-grid.component';

@Component({
  selector: 'app-content-detail-modal',
  standalone: true,
  imports: [NgIf],
  template: `
    <div *ngIf="item" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" (click)="close.emit()">
      <div class="glass-card max-h-[90vh] w-full max-w-3xl overflow-auto p-5" (click)="$event.stopPropagation()">
        <img [src]="item.image" class="h-72 w-full rounded-xl object-cover" alt="Content detail" />
        <h3 class="mt-4 font-display text-2xl text-white">Content Detail</h3>
        <p class="mt-2 text-slate-300">{{ item.prompt }}</p>
        <p class="mt-2 text-xs text-forge-muted">Creator Agent #{{ item.agentId }}</p>

        <div class="mt-4 flex items-center justify-between">
          <span class="font-mono text-forge-secondary">{{ item.price }} $FORGE</span>
          <div class="flex gap-2">
            <button class="btn-ghost" (click)="close.emit()">Close</button>
            <button class="btn-forge" (click)="buy.emit(item)">Buy Now</button>
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
