import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rental-listing-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="glass-card p-5">
      <h2 class="font-display text-2xl text-white">List Agent For Rent</h2>
      <div class="mt-3 grid grid-cols-1 gap-3">
        <label class="text-xs uppercase text-forge-muted">Token ID</label>
        <input type="number" min="1" class="rounded-lg border border-forge-border bg-[#081726] p-2" [(ngModel)]="tokenId" />

        <label class="text-xs uppercase text-forge-muted">Price per day ($FORGE)</label>
        <input type="number" min="1" class="rounded-lg border border-forge-border bg-[#081726] p-2" [(ngModel)]="pricePerDay" />

        <label class="text-xs uppercase text-forge-muted">Max duration (days)</label>
        <input type="number" min="1" max="30" class="rounded-lg border border-forge-border bg-[#081726] p-2" [(ngModel)]="maxDuration" />

        <button class="btn-forge" (click)="submit()">Create Listing</button>
      </div>
    </div>
  `
})
export class RentalListingFormComponent {
  @Output() createListing = new EventEmitter<{ tokenId: number; pricePerDay: number; maxDuration: number }>();

  tokenId = 42;
  pricePerDay = 25;
  maxDuration = 7;

  submit(): void {
    this.createListing.emit({
      tokenId: this.tokenId,
      pricePerDay: this.pricePerDay,
      maxDuration: this.maxDuration
    });
  }
}
