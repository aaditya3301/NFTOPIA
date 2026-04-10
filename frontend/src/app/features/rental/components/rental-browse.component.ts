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
    <div class="glass-card p-5">
      <h2 class="font-display text-2xl text-white">Browse Rentals</h2>
      <div class="mt-3 space-y-3">
        <article *ngFor="let item of items" class="rounded-xl border border-forge-border bg-[#0a1a28] p-3">
          <p class="text-sm text-slate-200">Agent #{{ item.tokenId }} · {{ item.specialization }}</p>
          <p class="text-xs text-forge-muted">{{ item.rate }} $FORGE/day · max {{ item.maxDays }} days</p>
          <button class="btn-ghost mt-2" (click)="rent.emit(item)">Rent</button>
        </article>
      </div>
    </div>
  `
})
export class RentalBrowseComponent {
  @Input() items: RentalBrowseItem[] = [];
  @Output() rent = new EventEmitter<RentalBrowseItem>();
}
