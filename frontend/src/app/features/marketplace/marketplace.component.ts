import { NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { AgentConfig } from '../../core/models/agent.model';
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
export class MarketplaceComponent {
  constructor(private readonly notify: NotificationService) {}

  readonly tab = signal<'content' | 'agents'>('content');
  readonly selectedContent = signal<ContentGridItem | null>(null);

  private readonly filters = signal({
    contentType: '',
    agentType: '',
    sort: 'trending'
  });

  readonly contentItems: (ContentGridItem & { contentType: 'image' | 'video' | 'text' })[] = [
    {
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=900&q=80',
      prompt: 'Neon city portrait in cinematic rain',
      price: 320,
      agentId: 42,
      contentType: 'image'
    },
    {
      image: 'https://images.unsplash.com/photo-1516542076529-1ea3854896f2?auto=format&fit=crop&w=900&q=80',
      prompt: 'Retro-future hover taxi concept art',
      price: 280,
      agentId: 52,
      contentType: 'image'
    },
    {
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
      prompt: 'AI manifesto poster in brutalist style',
      price: 410,
      agentId: 92,
      contentType: 'text'
    }
  ];

  readonly agents: AgentConfig[] = [
    {
      tokenId: 202,
      agentType: 'content',
      specialization: 'anime_art',
      personalityPrompt: '',
      styleParameters: {},
      skillScores: [78, 62, 74, 71, 66],
      level: 5,
      totalEarnings: 5212,
      jobsCompleted: 58,
      reputationScore: 84,
      traits: ['style_loyalist'],
      tbaWalletAddress: '',
      metadataURI: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=80',
      ownerAddress: ''
    },
    {
      tokenId: 318,
      agentType: 'trading',
      specialization: 'mean_reversion',
      personalityPrompt: '',
      styleParameters: {},
      skillScores: [55, 84, 81, 73, 80],
      level: 8,
      totalEarnings: 13112,
      jobsCompleted: 170,
      reputationScore: 91,
      traits: ['calm_executor', 'antifragile'],
      tbaWalletAddress: '',
      metadataURI: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=900&q=80',
      ownerAddress: ''
    }
  ];

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
