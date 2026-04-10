import { NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AgentConfig } from '../../../core/models/agent.model';
import { ForgeAmountComponent } from '../forge-amount/forge-amount.component';
import { LevelBadgeComponent } from '../level-badge/level-badge.component';
import { TraitBadgeComponent } from '../trait-badge/trait-badge.component';

@Component({
  selector: 'app-agent-card',
  standalone: true,
  imports: [NgIf, NgFor, TitleCasePipe, ForgeAmountComponent, LevelBadgeComponent, TraitBadgeComponent],
  template: `
    <article
      class="glass-card group cursor-pointer p-4 transition-all duration-300 hover:-translate-y-1"
      (click)="onCardClick()"
    >
      <div class="relative mb-3 overflow-hidden rounded-xl">
        <img
          [src]="agent.metadataURI || fallbackImage"
          [alt]="'Agent #' + agent.tokenId"
          class="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <app-level-badge [level]="agent.level" class="absolute right-2 top-2"></app-level-badge>
        <span
          class="absolute left-2 top-2 rounded-full px-2 py-1 text-xs font-mono"
          [class]="agent.agentType === 'content' ? 'bg-forge-primary/80 text-black' : 'bg-forge-secondary/80 text-black'"
        >
          {{ agent.agentType === 'content' ? 'CONTENT' : 'TRADING' }}
        </span>
      </div>

      <h3 class="font-display text-lg font-semibold text-white">Agent #{{ agent.tokenId }}</h3>
      <p class="mb-2 text-sm text-forge-muted">{{ agent.specialization | titlecase }}</p>

      <div class="mb-2 flex justify-between text-sm">
        <span class="text-forge-muted">Earned</span>
        <app-forge-amount [amount]="agent.totalEarnings"></app-forge-amount>
      </div>
      <div class="mb-3 flex justify-between text-sm">
        <span class="text-forge-muted">Reputation</span>
        <span class="font-mono text-white">{{ agent.reputationScore }}/100</span>
      </div>

      <div class="mb-3 flex flex-wrap gap-1" *ngIf="agent.traits.length">
        <app-trait-badge *ngFor="let trait of agent.traits.slice(0, 3)" [trait]="trait"></app-trait-badge>
      </div>

      <div class="flex gap-2" *ngIf="showActions">
        <button
          *ngIf="agent.agentType === 'content'"
          class="flex-1 rounded-lg bg-forge-primary/20 py-2 text-sm text-forge-primary hover:bg-forge-primary/30"
          (click)="onAction.emit('studio'); $event.stopPropagation()"
        >
          Studio
        </button>
        <button
          class="flex-1 rounded-lg bg-forge-border py-2 text-sm text-white hover:bg-forge-border/80"
          (click)="onAction.emit('rent'); $event.stopPropagation()"
        >
          Rent
        </button>
      </div>
    </article>
  `
})
export class AgentCardComponent {
  @Input({ required: true }) agent!: AgentConfig;
  @Input() showActions = false;
  @Output() onAction = new EventEmitter<string>();
  @Output() onClick = new EventEmitter<number>();

  readonly fallbackImage =
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';

  onCardClick(): void {
    this.onClick.emit(this.agent.tokenId);
  }
}
