import { NgFor } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface RentalBrowseItem {
  tokenId: number;
  specialization: string;
  rate: number;
  maxDays: number;
}

@Component({
  selector: 'app-rental-browse',
  standalone: true,
  imports: [NgFor],
  template: `
    <div class="glass-card p-6">
      <h2 class="font-display text-2xl font-bold text-nft-text">Browse Rentals</h2>
      <div class="mt-4 space-y-3">
        <article *ngFor="let item of items" class="rounded-xl border border-nft-border bg-nft-surface p-4 hover:shadow-card transition-all">
          <p class="text-sm font-semibold text-nft-text">Agent #{{ item.tokenId }} · {{ item.specialization }}</p>
          <p class="text-xs text-nft-muted mt-1">{{ item.rate }} $FORGE/day · max {{ item.maxDays }} days</p>
          <button class="btn-forge !px-4 !py-1.5 !text-xs !rounded-full mt-3" (click)="rent.emit(item)">Rent</button>
        </article>
      </div>
    </div>
  `
})
export class RentalBrowseComponent {
  @Input() items: RentalBrowseItem[] = [];
  @Output() rent = new EventEmitter<RentalBrowseItem>();
}
