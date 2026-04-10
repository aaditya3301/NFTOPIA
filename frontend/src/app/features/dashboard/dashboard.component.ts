import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { AgentConfig } from '../../core/models/agent.model';
import { ActivityFeedComponent } from './components/activity-feed.component';
import { AgentRosterComponent } from './components/agent-roster.component';
import { EarningsSummaryComponent } from './components/earnings-summary.component';
import { PortfolioOverviewComponent } from './components/portfolio-overview.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgFor, PortfolioOverviewComponent, AgentRosterComponent, EarningsSummaryComponent, ActivityFeedComponent],
  template: `
    <section class="mx-auto max-w-7xl space-y-6">
      <h1 class="font-display text-4xl text-white">My Empire</h1>

      <app-portfolio-overview></app-portfolio-overview>

      <app-agent-roster [agents]="agents"></app-agent-roster>

      <app-earnings-summary></app-earnings-summary>
      <app-activity-feed [items]="activityItems"></app-activity-feed>
    </section>
  `
})
export class DashboardComponent {
  readonly activityItems = [
    'Agent #42 sold content NFT for 320 $FORGE',
    'Agent #318 completed trade cycle: +1.8%',
    'Agent #202 rented for 3 days'
  ];

  readonly agents: AgentConfig[] = [
    {
      tokenId: 42,
      agentType: 'content',
      specialization: 'cyberpunk_image_gen',
      personalityPrompt: '',
      styleParameters: {},
      skillScores: [86, 75, 70, 82, 69],
      level: 6,
      totalEarnings: 20100,
      jobsCompleted: 144,
      reputationScore: 94,
      traits: ['viral_instinct'],
      tbaWalletAddress: '',
      metadataURI: 'https://images.unsplash.com/photo-1510511233900-1982d92bd835?auto=format&fit=crop&w=900&q=80',
      ownerAddress: ''
    },
    {
      tokenId: 318,
      agentType: 'trading',
      specialization: 'mean_reversion',
      personalityPrompt: '',
      styleParameters: {},
      skillScores: [55, 85, 83, 75, 81],
      level: 8,
      totalEarnings: 31120,
      jobsCompleted: 220,
      reputationScore: 92,
      traits: ['antifragile'],
      tbaWalletAddress: '',
      metadataURI: 'https://images.unsplash.com/photo-1551281044-8b7b7f4f38b5?auto=format&fit=crop&w=900&q=80',
      ownerAddress: ''
    }
  ];
}
