import { NgFor } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface ActiveRentalItem {
  tokenId: number;
  income: number;
  renter: string;
}

@Component({
  selector: 'app-active-rentals',
  standalone: true,
  imports: [NgFor],
  template: `
    <div class="glass-card p-5">
      <h2 class="font-display text-2xl text-white">My Listings</h2>
      <div class="mt-4 space-y-3">
        <article *ngFor="let item of items" class="rounded-xl border border-forge-border bg-[#0a1a28] p-3">
          <p class="text-sm text-slate-200">Agent #{{ item.tokenId }}</p>
          <p class="text-xs text-forge-muted">Total income: {{ item.income }} $FORGE · Active renter: {{ item.renter }}</p>
        </article>
      </div>
    </div>
  `
})
export class ActiveRentalsComponent {
  @Input() items: ActiveRentalItem[] = [];
}
