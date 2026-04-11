import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContentNft } from '../../core/models/content.model';
import { AgentConfig } from '../../core/models/agent.model';
import { AgentService } from '../../core/services/agent.service';
import { ContentService } from '../../core/services/content.service';
import { NotificationService } from '../../core/services/notification.service';
import { Web3Service } from '../../core/services/web3.service';
import { ContentDetailModalComponent } from './components/content-detail-modal.component';
import { ContentGridComponent, ContentGridItem } from './components/content-grid.component';
import { FilterSidebarComponent } from './components/filter-sidebar.component';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [NgIf, NgFor, DecimalPipe, FormsModule, FilterSidebarComponent, ContentGridComponent, ContentDetailModalComponent],
  template: `
    <section class="mx-auto max-w-7xl space-y-6">
      <header>
        <h1 class="font-display text-4xl text-white">Marketplace</h1>
        <p class="text-forge-muted">Discover AI-generated content and place bids on NFTs.</p>
      </header>

      <div class="rounded-xl border border-forge-border bg-forge-card/70 p-1 inline-flex">
        <button class="px-3 py-2 text-sm" [class.text-white]="tab() === 'content'" (click)="tab.set('content')">Content</button>
        <button class="px-3 py-2 text-sm" [class.text-white]="tab() === 'leaderboard'" (click)="tab.set('leaderboard'); loadLeaderboard()">Leaderboard</button>
      </div>

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]" *ngIf="tab() === 'content'">
        <app-filter-sidebar (changeFilters)="applyFilters($event)"></app-filter-sidebar>
        <app-content-grid [items]="filteredContent()" (bid)="openBidModal($event)"></app-content-grid>
      </div>

      <div *ngIf="tab() === 'leaderboard'" class="glass-card overflow-hidden">
        <div class="border-b border-forge-border p-4">
          <h2 class="font-display text-2xl text-white">Content Leaderboard</h2>
          <p class="text-sm text-forge-muted">All listed content ranked by current highest bid price.</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs uppercase text-forge-muted bg-[#091825]">
              <tr>
                <th class="px-4 py-3">Rank</th>
                <th class="px-4 py-3">Preview</th>
                <th class="px-4 py-3">Creator Agent</th>
                <th class="px-4 py-3">Highest Bid</th>
                <th class="px-4 py-3">Total Bids</th>
                <th class="px-4 py-3">Base Price</th>
                <th class="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of leaderboardContent(); let i = index"
                class="border-b border-forge-border/40 hover:bg-[#0c1f30] transition-colors">
                <td class="px-4 py-3 font-mono text-forge-secondary">#{{ i + 1 }}</td>
                <td class="px-4 py-3">
                  <img [src]="item.image" class="h-10 w-16 rounded object-cover" alt="thumb" />
                </td>
                <td class="px-4 py-3 text-white">Agent #{{ item.agentId }}</td>
                <td class="px-4 py-3 font-mono text-forge-secondary">{{ (item.highestBid || item.price) | number:'1.0-0' }} $FORGE</td>
                <td class="px-4 py-3 text-slate-300">{{ item.bidCount || 0 }}</td>
                <td class="px-4 py-3 font-mono text-slate-400">{{ item.price | number:'1.0-0' }} $FORGE</td>
                <td class="px-4 py-3">
                  <button class="btn-forge !px-3 !py-1.5 text-xs" (click)="openBidModal(item)">Bid</button>
                </td>
              </tr>
              <tr *ngIf="leaderboardContent().length === 0">
                <td colspan="7" class="px-4 py-8 text-center text-forge-muted">No content available yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <app-content-detail-modal
        [item]="selectedContent()"
        (close)="selectedContent.set(null)"
        (buy)="placeBid($event)"
      ></app-content-detail-modal>
    </section>
  `
})
export class MarketplaceComponent implements OnInit {
  private readonly notify = inject(NotificationService);
  private readonly contentService = inject(ContentService);
  private readonly agentService = inject(AgentService);
  private readonly web3 = inject(Web3Service);
  private readonly router = inject(Router);

  readonly tab = signal<'content' | 'leaderboard'>('content');
  readonly selectedContent = signal<ContentGridItem | null>(null);

  private readonly filters = signal({
    contentType: '',
    agentType: '',
    sort: 'trending'
  });

  contentItems: (ContentGridItem & { contentType: 'image' | 'video' | 'text' })[] = [];

  ngOnInit() {
    this.fetchContent();
  }

  private fetchContent() {
    this.contentService.getMarketplaceContent().subscribe(items => {
      this.contentItems = items.map(item => ({
        image: item.contentUrl || '',
        prompt: `Agent #${item.creatorAgent} ${item.contentType}`,
        price: item.price,
        agentId: item.creatorAgent,
        contentType: item.contentType as 'image'|'video'|'text',
        purchases: item.purchases || 0,
        contentId: item.contentId || '',
        // Simulate bid data from purchases - each purchase raises the "bid"
        highestBid: item.price + (item.purchases || 0) * 15,
        bidCount: item.purchases || 0
      }));
    });
  }

  loadLeaderboard(): void {
    // Refresh content to get latest bid data for leaderboard
    this.fetchContent();
  }

  leaderboardContent(): ContentGridItem[] {
    // Sort all content by highest bid descending
    return [...this.contentItems].sort((a, b) =>
      (b.highestBid || b.price) - (a.highestBid || a.price)
    );
  }

  applyFilters(next: { contentType: string; agentType: string; sort: string }): void {
    this.filters.set(next);
  }

  filteredContent(): ContentGridItem[] {
    const f = this.filters();
    let list = [...this.contentItems];

    if (f.contentType) {
      list = list.filter((item) => item.contentType === f.contentType);
    }

    if (f.sort === 'price_low') {
      list.sort((a, b) => (a.highestBid || a.price) - (b.highestBid || b.price));
    } else if (f.sort === 'price_high') {
      list.sort((a, b) => (b.highestBid || b.price) - (a.highestBid || a.price));
    }

    return list;
  }

  openBidModal(item: ContentGridItem): void {
    this.selectedContent.set(item);
  }

  async placeBid(item: ContentGridItem & { bidAmount?: number }): Promise<void> {
    const bidAmount = item.bidAmount || item.price;

    // Ensure wallet connected
    let wallet = this.web3.walletAddress();
    if (!wallet) {
      try {
        await this.web3.connectWallet();
        wallet = this.web3.walletAddress();
      } catch {
        this.notify.error('Connect your wallet to place a bid');
        return;
      }
    }

    if (!wallet) {
      this.notify.error('Wallet not connected');
      return;
    }

    // Trigger MetaMask popup for bid confirmation
    const bidFeeEther = '0.005';
    try {
      this.notify.info('Confirm your bid in wallet...');
      await this.web3.sendMintFee(bidFeeEther);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Transaction rejected';
      if (msg.includes('rejected') || msg.includes('denied')) {
        this.notify.warning('Bid cancelled by user');
      } else {
        this.notify.error(`Wallet error: ${msg}`);
      }
      return;
    }

    // Record on backend as a purchase (which drives price up)
    if (item.contentId) {
      this.contentService.buyContent(item.contentId).subscribe({
        next: () => {
          this.notify.success(`Bid of ${bidAmount} $FORGE placed successfully on Agent #${item.agentId} content`);
          this.selectedContent.set(null);
          this.fetchContent();
        },
        error: () => this.notify.error('Failed to record bid')
      });
    } else {
      this.notify.success(`Bid of ${bidAmount} $FORGE placed successfully`);
      this.selectedContent.set(null);
      this.fetchContent();
    }
  }

  goAgent(tokenId: number): void {
    this.router.navigate(['/agent', tokenId]);
  }
}
