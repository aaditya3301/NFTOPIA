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
    <div class="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3" *ngIf="items.length > 0">
      <article *ngFor="let item of items; let i = index" class="glass-card--glow overflow-hidden group transition-all duration-500 hover:-translate-y-2" [style.animation-delay.ms]="i * 80">
        <div class="overflow-hidden relative">
          <img [src]="item.image" class="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Content preview" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
             <button class="btn-forge w-full !py-2 !text-xs !rounded-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-500" (click)="bid.emit(item)">Place Bid</button>
          </div>
        </div>
        <div class="space-y-3 p-5">
          <p class="line-clamp-2 text-sm font-semibold text-nft-text leading-snug">{{ item.prompt }}</p>
          <div class="flex items-center justify-between">
            <p class="text-[10px] uppercase tracking-wider font-bold text-nft-muted">Agent #{{ item.agentId }}</p>
            <span class="text-[10px] font-mono font-bold text-nft-primary bg-nft-primary/10 px-2 py-0.5 rounded-full" *ngIf="item.bidCount">{{ item.bidCount }} Bids</span>
          </div>
          <div class="flex items-center justify-between pt-1 border-t border-nft-border/30">
            <span class="font-mono text-sm font-black text-nft-primary">{{ (item.highestBid || item.price) | number:'1.0-0' }} $FORGE</span>
            <button class="btn-ghost !px-3.5 !py-1.5 !text-[11px] !rounded-full font-bold" (click)="bid.emit(item)">View Details</button>
          </div>
        </div>
      </article>
    </div>
    <div *ngIf="items.length === 0" class="glass-card--glow p-12 text-center animate-fade-up">
      <p class="text-nft-muted font-medium">No content listed yet. Forge an agent and generate images to get started.</p>
    </div>
  `
})
export class ContentGridComponent {
  @Input() items: ContentGridItem[] = [];
  @Output() bid = new EventEmitter<ContentGridItem>();
}
