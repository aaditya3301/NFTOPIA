import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { interval, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MarketplaceService } from '../../core/services/marketplace.service';
import { NotificationService } from '../../core/services/notification.service';
import { Web3Service } from '../../core/services/web3.service';
import { AgentCardComponent } from '../../shared/components/agent-card/agent-card.component';
import { AgentConfig } from '../../core/models/agent.model';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [NgIf, NgFor, DecimalPipe, AgentCardComponent],
  template: `
    <section class="mx-auto max-w-7xl space-y-10">
      <div class="grid grid-cols-1 gap-8 rounded-3xl border border-forge-border/60 bg-[#0a1724]/70 p-8 grid-noise md:grid-cols-[1.2fr_1fr]">
        <div class="space-y-6 animate-reveal">
          <span class="inline-flex rounded-full border border-forge-secondary/40 bg-forge-secondary/10 px-3 py-1 text-xs uppercase tracking-wide text-forge-secondary">
            Living AI Agent Economy
          </span>
          <h1 class="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Mint AI Agents.<br />
            <span class="gradient-text">Own The Hustle.</span>
          </h1>
          <p class="max-w-xl text-base text-slate-300 sm:text-lg">
            Forge content and trading agents as NFTs, evolve their DNA with performance, and earn inside a self-sustaining $FORGE economy.
          </p>

          <div class="flex flex-wrap gap-3">
            <button class="btn-forge" (click)="connectAndForge()">Connect Wallet & Start Forging</button>
            <a class="btn-ghost" href="#how-it-works">How it works</a>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div class="glass-card p-4">
              <p class="text-xs uppercase text-forge-muted">Agents Minted</p>
              <p class="mt-1 font-mono text-xl text-white">{{ stats().agentsMinted | number }}</p>
            </div>
            <div class="glass-card p-4">
              <p class="text-xs uppercase text-forge-muted">FORGE Earned</p>
              <p class="mt-1 font-mono text-xl text-white">{{ stats().forgeEarned | number }}</p>
            </div>
            <div class="glass-card p-4">
              <p class="text-xs uppercase text-forge-muted">Content NFTs</p>
              <p class="mt-1 font-mono text-xl text-white">{{ stats().contentTraded | number }}</p>
            </div>
          </div>
        </div>

        <div *ngIf="featuredAgents.length > 0" class="relative overflow-hidden rounded-2xl border border-forge-border bg-[#0b1824] p-5">
          <div class="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-forge-primary/20 blur-3xl"></div>
          <div class="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-forge-secondary/20 blur-3xl"></div>
          <div class="relative space-y-4">
            <p class="text-xs uppercase tracking-wide text-forge-muted">Featured Agents</p>
            <app-agent-card
              *ngFor="let agent of featuredAgents"
              [agent]="agent"
              (onClick)="openAgent($event)"
            ></app-agent-card>
          </div>
        </div>
      </div>

      <div id="how-it-works" class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article class="glass-card p-5">
          <p class="font-mono text-xs text-forge-secondary">01</p>
          <h3 class="mt-2 font-display text-2xl text-white">Forge</h3>
          <p class="mt-2 text-sm text-slate-300">Choose type and specialization, then mint your agent NFT with on-chain DNA.</p>
        </article>
        <article class="glass-card p-5">
          <p class="font-mono text-xs text-forge-secondary">02</p>
          <h3 class="mt-2 font-display text-2xl text-white">Work</h3>
          <p class="mt-2 text-sm text-slate-300">Generate marketable content or run strategy bots using your agent brain.</p>
        </article>
        <article class="glass-card p-5">
          <p class="font-mono text-xs text-forge-secondary">03</p>
          <h3 class="mt-2 font-display text-2xl text-white">Earn</h3>
          <p class="mt-2 text-sm text-slate-300">Collect royalties, trading fees, and rental yield in the $FORGE economy.</p>
        </article>
      </div>
    </section>
  `
})
export class LandingComponent {
  private readonly web3 = inject(Web3Service);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);
  private readonly market = inject(MarketplaceService);
  private readonly destroyRef = inject(DestroyRef);

  readonly stats = signal({ agentsMinted: 0, forgeEarned: 0, contentTraded: 0 });

  readonly featuredAgents: AgentConfig[] = [];

  constructor() {
    interval(30000)
      .pipe(startWith(0), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.market.getPlatformStats().subscribe({
          next: (res) => this.stats.set(res),
          error: () => {
             // Let it return zeroes if the backend fails instead of mock data
          }
        });
      });
  }

  async connectAndForge(): Promise<void> {
    try {
      await this.web3.connectWallet();
      await this.router.navigateByUrl('/forge');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to connect wallet';
      this.notify.error(message);
    }
  }

  openAgent(tokenId: number): void {
    this.router.navigate(['/agent', tokenId]);
  }
}
