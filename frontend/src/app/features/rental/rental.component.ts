import { Component } from '@angular/core';
import { NotificationService } from '../../core/services/notification.service';
import { ActiveRentalsComponent } from './components/active-rentals.component';
import { RentalBrowseComponent, RentalBrowseItem } from './components/rental-browse.component';
import { RentalListingFormComponent } from './components/rental-listing-form.component';

@Component({
  selector: 'app-rental',
  standalone: true,
  imports: [RentalBrowseComponent, RentalListingFormComponent, ActiveRentalsComponent],
  template: `
    <section class="mx-auto max-w-7xl space-y-6">
      <header>
        <h1 class="font-display text-4xl text-white">Rental Market</h1>
        <p class="text-forge-muted">List your agents for passive yield or lease top performers.</p>
      </header>

      <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <app-rental-browse [items]="browse" (rent)="rentAgent($event)"></app-rental-browse>
        <div class="space-y-5">
          <app-rental-listing-form (createListing)="createListing($event)"></app-rental-listing-form>
          <app-active-rentals [items]="listings"></app-active-rentals>
        </div>
      </div>
    </section>
  `
})
export class RentalComponent {
  constructor(private readonly notify: NotificationService) {}

  readonly browse: RentalBrowseItem[] = [
    { tokenId: 450, specialization: 'trend_following', rate: 42, maxDays: 7 },
    { tokenId: 451, specialization: 'anime_art', rate: 26, maxDays: 14 }
  ];

  readonly listings = [
    { tokenId: 42, income: 920, renter: '0x9f...2ab4' },
    { tokenId: 318, income: 1570, renter: '0xe3...91cd' }
  ];

  rentAgent(item: RentalBrowseItem): void {
    this.notify.success(`Rental flow opened for Agent #${item.tokenId}`);
  }

  createListing(payload: { tokenId: number; pricePerDay: number; maxDuration: number }): void {
    this.notify.success(`Listing created: Agent #${payload.tokenId} at ${payload.pricePerDay} $FORGE/day`);
  }
}
