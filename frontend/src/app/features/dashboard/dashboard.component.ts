import { NgFor, NgIf } from '@angular/common';
import { Component, inject, effect } from '@angular/core';
import { AgentConfig } from '../../core/models/agent.model';
import { AgentService } from '../../core/services/agent.service';
import { Web3Service } from '../../core/services/web3.service';
import { ActivityFeedComponent } from './components/activity-feed.component';
import { AgentRosterComponent } from './components/agent-roster.component';
import { EarningsSummaryComponent } from './components/earnings-summary.component';
import { PortfolioOverviewComponent } from './components/portfolio-overview.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, NgFor, PortfolioOverviewComponent, AgentRosterComponent, EarningsSummaryComponent, ActivityFeedComponent],
  template: `
    <section class="mx-auto max-w-7xl space-y-8">
      <header class="page-header">
        <p class="section-kicker">Overview</p>
        <h1>My Empire</h1>
      </header>

      <app-portfolio-overview [agentsOwned]="agents.length.toString()" forgeBalance="0 $FORGE" allTimeEarnings="0 $FORGE" passiveRate="0 $FORGE"></app-portfolio-overview>
      <app-agent-roster *ngIf="agents.length > 0" [agents]="agents"></app-agent-roster>
      
      <div *ngIf="agents.length === 0" class="glass-card--glow flex flex-col items-center justify-center py-12 text-center">
         <p class="text-slate-500 text-lg mb-2">You don't own any agents yet.</p>
         <a href="/forge" class="btn-forge">Go to Forge</a>
      </div>

      <div class="grid grid-cols-1 gap-7 lg:grid-cols-[1.2fr_1fr]">
        <app-earnings-summary></app-earnings-summary>
        <app-activity-feed [items]="activityItems"></app-activity-feed>
      </div>
    </section>
  `
})
export class DashboardComponent {
  private agentService = inject(AgentService);
  private web3Service = inject(Web3Service);

  readonly activityItems: string[] = [
    'System initialized',
    'Waiting for real-time events...'
  ];

  agents: AgentConfig[] = [];

  constructor() {
    effect(() => {
      const address = this.web3Service.walletAddress();
      if (address) {
        this.agentService.getMyAgents(address).subscribe(agents => {
          this.agents = agents;
        });
      } else {
        this.agents = [];
      }
    });
  }
}

