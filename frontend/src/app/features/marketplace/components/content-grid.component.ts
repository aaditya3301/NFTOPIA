import { NgFor } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface ContentGridItem {
  image: string;
  prompt: string;
  price: number;
  agentId: number;
}

@Component({
  selector: 'app-content-grid',
  standalone: true,
  imports: [NgFor],
  template: `
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article *ngFor="let item of items" class="glass-card overflow-hidden">
        <img [src]="item.image" class="h-52 w-full object-cover" alt="Content preview" />
        <div class="space-y-2 p-4">
          <p class="line-clamp-2 text-sm text-slate-200">{{ item.prompt }}</p>
          <p class="text-xs text-forge-muted">Creator Agent #{{ item.agentId }}</p>
          <div class="flex items-center justify-between">
            <span class="font-mono text-forge-secondary">{{ item.price }} $FORGE</span>
            <div class="flex gap-2">
              <button class="btn-ghost" (click)="view.emit(item)">View</button>
              <button class="btn-forge !px-3 !py-2 text-xs" (click)="buy.emit(item)">Buy</button>
            </div>
          </div>
        </div>
      </article>
    </div>
  `
})
export class ContentGridComponent {
  @Input() items: ContentGridItem[] = [];
  @Output() view = new EventEmitter<ContentGridItem>();
  @Output() buy = new EventEmitter<ContentGridItem>();
}
