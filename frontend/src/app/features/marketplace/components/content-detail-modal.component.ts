import { DecimalPipe, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentGridItem } from './content-grid.component';

@Component({
  selector: 'app-content-detail-modal',
  standalone: true,
  imports: [NgIf, FormsModule, DecimalPipe],
  template: `
    <div *ngIf="item" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" (click)="close.emit()">
      <div class="glass-card max-h-[90vh] w-full max-w-lg overflow-auto p-6 space-y-4" (click)="$event.stopPropagation()">
        <img [src]="item.image" class="h-56 w-full rounded-xl object-cover" alt="Content detail" />

        <div>
          <h3 class="font-display text-2xl text-white">Place a Bid</h3>
          <p class="text-sm text-slate-300 mt-1">{{ item.prompt }}</p>
          <p class="text-xs text-forge-muted mt-1">Creator Agent #{{ item.agentId }}</p>
        </div>

        <div class="rounded-xl border border-forge-border bg-[#091825] p-4 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-forge-muted">Current highest bid</span>
            <span class="font-mono text-forge-secondary">{{ (item.highestBid || item.price) | number:'1.0-0' }} $FORGE</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-forge-muted">Total bids placed</span>
            <span class="text-white">{{ item.bidCount || 0 }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-forge-muted">Auction ends in</span>
            <span class="font-mono text-forge-warning">{{ timeRemaining }}</span>
          </div>
        </div>

        <div>
          <label class="block text-xs uppercase text-forge-muted mb-1">Your bid amount ($FORGE)</label>
          <input
            type="number"
            [min]="(item.highestBid || item.price) + 1"
            class="w-full rounded-lg border border-forge-border bg-[#081726] p-3 text-sm text-white font-mono outline-none focus:border-forge-primary"
            [(ngModel)]="bidAmount"
            placeholder="Enter bid amount"
          />
          <p class="text-xs text-forge-muted mt-1">Minimum bid: {{ ((item.highestBid || item.price) + 1) | number:'1.0-0' }} $FORGE</p>
        </div>

        <div class="flex gap-3">
          <button class="btn-ghost flex-1" (click)="close.emit()">Cancel</button>
          <button
            class="btn-forge flex-1"
            (click)="placeBid()"
            [disabled]="!bidAmount || bidAmount <= (item.highestBid || item.price)"
          >Place Bid</button>
        </div>
      </div>
    </div>
  `
})
export class ContentDetailModalComponent implements OnChanges, OnDestroy {
  @Input() item: ContentGridItem | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() buy = new EventEmitter<ContentGridItem & { bidAmount: number }>();

  bidAmount = 0;
  timeRemaining = '00h 00m 00s';
  private countdownInterval: ReturnType<typeof setInterval> | null = null;
  private auctionEndTime = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item'] && this.item) {
      this.bidAmount = (this.item.highestBid || this.item.price) + 10;
      // Set auction end to 24 hours from now (simulated)
      this.auctionEndTime = Date.now() + 24 * 60 * 60 * 1000;
      this.startCountdown();
    }
  }

  ngOnDestroy(): void {
    this.stopCountdown();
  }

  private startCountdown(): void {
    this.stopCountdown();
    this.updateTimeRemaining();
    this.countdownInterval = setInterval(() => this.updateTimeRemaining(), 1000);
  }

  private stopCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  private updateTimeRemaining(): void {
    const diff = Math.max(0, this.auctionEndTime - Date.now());
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    this.timeRemaining = `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  }

  placeBid(): void {
    if (this.item && this.bidAmount > (this.item.highestBid || this.item.price)) {
      this.buy.emit({ ...this.item, bidAmount: this.bidAmount });
    }
  }
}
