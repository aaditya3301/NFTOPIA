import { NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { AgentConfig } from '../../core/models/agent.model';
import { ContentNft } from '../../core/models/content.model';
import { AgentService } from '../../core/services/agent.service';
import { ContentService } from '../../core/services/content.service';
import { NotificationService } from '../../core/services/notification.service';
import { AgentGridComponent } from './components/agent-grid.component';
import { ContentDetailModalComponent } from './components/content-detail-modal.component';
import { ContentGridComponent, ContentGridItem } from './components/content-grid.component';
import { FilterSidebarComponent } from './components/filter-sidebar.component';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [NgIf, NgFor, TitleCasePipe, FilterSidebarComponent, ContentGridComponent, AgentGridComponent, ContentDetailModalComponent],
  template: `
    <section class="mx-auto max-w-7xl space-y-6">
      <header>
        <h1 class="font-display text-4xl text-white">Marketplace</h1>
        <p class="text-forge-muted">Discover content drops and high-performing agents.</p>
      </header>

      <div class="rounded-xl border border-forge-border bg-forge-card/70 p-1 inline-flex">
        <button class="px-3 py-2 text-sm" [class.text-white]="tab() === 'content'" (click)="tab.set('content')">Content</button>
        <button class="px-3 py-2 text-sm" [class.text-white]="tab() === 'agents'" (click)="tab.set('agents')">Agents</button>
      </div>

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <app-filter-sidebar (changeFilters)="applyFilters($event)"></app-filter-sidebar>

        <div *ngIf="tab() === 'content'">
          <app-content-grid [items]="filteredContent()" (view)="openContentModal($event)" (buy)="buyContent($event)"></app-content-grid>
        </div>

        <div *ngIf="tab() === 'agents'">
          <app-agent-grid [agents]="filteredAgents()" (open)="openAgent($event)"></app-agent-grid>
        </div>
      </div>

      <app-content-detail-modal [item]="selectedContent()" (close)="selectedContent.set(null)" (buy)="buyContent($event)"></app-content-detail-modal>
    </section>
  `
})
export class MarketplaceComponent implements OnInit {
  private readonly notify = inject(NotificationService);
  private readonly contentService = inject(ContentService);
  private readonly agentService = inject(AgentService);

  readonly tab = signal<'content' | 'agents'>('content');
  readonly selectedContent = signal<ContentGridItem | null>(null);

  private readonly filters = signal({
    contentType: '',
    agentType: '',
    sort: 'trending'
  });

  contentItems: (ContentGridItem & { contentType: 'image' | 'video' | 'text' })[] = [];
  agents: AgentConfig[] = [];

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
        // Pass original raw item if needed by app
      }));
    });
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
      list.sort((a, b) => a.price - b.price);
    } else if (f.sort === 'price_high') {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }

  filteredAgents(): AgentConfig[] {
    const f = this.filters();
    if (!f.agentType) {
      return this.agents;
    }

    return this.agents.filter((agent) => agent.agentType === f.agentType);
  }

  openContentModal(item: ContentGridItem): void {
    this.selectedContent.set(item);
  }

  buyContent(item: ContentGridItem): void {
    this.notify.success(`Purchase flow opened for content by Agent #${item.agentId}`);
  }

  openAgent(tokenId: number): void {
    this.notify.info(`Open agent profile #${tokenId}`);
  }
}

