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
    <section class="mx-auto max-w-7xl space-y-7">
      <!-- Page Header -->
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div class="page-header">
          <p class="section-kicker">Explore</p>
          <h1>Marketplace</h1>
          <p>Discover content drops and high-performing agents.</p>
        </div>
        <div class="pill-tabs mb-2">
          <button
            class="pill-tab"
            [class]="tab() === 'content' ? 'pill-tab--active' : 'pill-tab--inactive'"
            (click)="tab.set('content')"
          >Content</button>
          <button
            class="pill-tab"
            [class]="tab() === 'agents' ? 'pill-tab--active' : 'pill-tab--inactive'"
            (click)="tab.set('agents')"
          >Agents</button>
        </div>
      </header>

      <!-- Grid -->
      <div class="grid grid-cols-1 items-start gap-7 lg:grid-cols-[260px_1fr]">
        <app-filter-sidebar (changeFilters)="applyFilters($event)"></app-filter-sidebar>

        <div *ngIf="tab() === 'content'" class="animate-fade-up">
          <app-content-grid [items]="filteredContent()" (view)="openContentModal($event)" (buy)="buyContent($event)"></app-content-grid>
        </div>

        <div *ngIf="tab() === 'agents'" class="animate-fade-up">
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

  applyFilters(next: { contentType: string; agentType: string; sort: string }): void { this.filters.set(next); }

  filteredContent(): ContentGridItem[] {
    const f = this.filters();
    let list = [...this.contentItems];
    if (f.contentType) list = list.filter((item) => item.contentType === f.contentType);
    if (f.sort === 'price_low') list.sort((a, b) => a.price - b.price);
    else if (f.sort === 'price_high') list.sort((a, b) => b.price - a.price);
    return list;
  }

  filteredAgents(): AgentConfig[] {
    const f = this.filters();
    return !f.agentType ? this.agents : this.agents.filter((a) => a.agentType === f.agentType);
  }

  openContentModal(item: ContentGridItem): void { this.selectedContent.set(item); }
  buyContent(item: ContentGridItem): void { this.notify.success(`Purchase flow opened for content by Agent #${item.agentId}`); }
  openAgent(tokenId: number): void { this.notify.info(`Open agent profile #${tokenId}`); }
}

