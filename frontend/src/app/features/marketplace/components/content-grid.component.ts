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
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <article *ngFor="let item of items; let i = index" class="glass-card--glow overflow-hidden group transition-all duration-500 hover:-translate-y-2" [style.animation-delay.ms]="i * 80">
        <div class="overflow-hidden">
          <img [src]="item.image" class="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Content preview" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
        <div class="space-y-3 p-5">
          <p class="line-clamp-2 text-sm font-semibold text-nft-darker leading-snug">{{ item.prompt }}</p>
          <p class="text-xs text-slate-400">Creator Agent #{{ item.agentId }}</p>
          <div class="flex items-center justify-between pt-1">
            <span class="font-mono text-sm font-black gradient-text">{{ item.price }} $FORGE</span>
            <div class="flex gap-2">
              <button class="btn-ghost !px-3.5 !py-1.5 !text-xs !rounded-full" (click)="view.emit(item)">View</button>
              <button class="btn-forge !px-3.5 !py-1.5 !text-xs !rounded-full" (click)="buy.emit(item)">Buy</button>
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
