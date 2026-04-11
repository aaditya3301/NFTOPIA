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
    <!-- ═══ HERO SECTION ═══ -->
    <section class="relative mx-auto max-w-7xl overflow-visible pb-0">
      <!-- Dot pattern overlay -->
      <div class="absolute inset-0 dot-pattern opacity-40 pointer-events-none"></div>

      <!-- Decorative floating dots -->
      <div class="deco-dot deco-dot--md deco-dot--warning" style="top: 120px; left: 6%; animation-delay: 0s"></div>
      <div class="deco-dot deco-dot--sm deco-dot--primary" style="top: 200px; left: 22%; animation-delay: 0.5s"></div>
      <div class="deco-dot deco-dot--sm deco-dot--secondary" style="top: 80px; right: 38%; animation-delay: 1s"></div>
      <div class="deco-dot deco-dot--md deco-dot--primary" style="top: 320px; right: 15%; animation-delay: 1.5s"></div>
      <div class="deco-dot deco-dot--sm deco-dot--muted" style="top: 400px; left: 12%; animation-delay: 0.8s"></div>
      <div class="deco-dot deco-dot--sm deco-dot--muted" style="top: 180px; right: 8%; animation-delay: 2s"></div>

      <!-- Scribble arrow SVG -->
      <svg class="absolute left-[10%] top-[240px] opacity-20 pointer-events-none hidden md:block" width="48" height="36" viewBox="0 0 48 36" fill="none">
        <path d="M2 34C10 22 22 10 46 4" stroke="#0F172A" stroke-width="2" stroke-linecap="round"/>
        <path d="M36 2L46 4L42 14" stroke="#0F172A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>

      <!-- Paper plane SVG -->
      <svg class="absolute right-[8%] bottom-[28%] opacity-15 pointer-events-none hidden lg:block animate-float" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="1.2">
        <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>

      <!-- Hero Content Grid -->
      <div class="relative grid min-h-[65vh] grid-cols-1 items-center gap-6 md:grid-cols-2">

        <!-- LEFT: Text -->
        <div class="relative z-10 space-y-7 py-6 animate-fade-up">
          <h1 class="font-display text-[3.2rem] font-black leading-[1.05] tracking-tight text-nft-darker sm:text-[4rem] lg:text-[4.8rem]">
            Develop<br/>Your Own
            <span class="relative inline-block">
              Collectible
              <!-- Chevron deco -->
              <svg class="absolute -right-10 -top-5 hidden sm:block" width="30" height="30" viewBox="0 0 30 30" fill="none">
                <path d="M5 20L15 8L25 20" stroke="#6366F1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </h1>

          <p class="max-w-md text-lg leading-relaxed text-slate-500">
            Your Unique Collectible Journey From Concept to Creation. Mint AI agents, evolve their DNA, and earn inside a self-sustaining economy.
          </p>

          <div class="flex flex-wrap items-center gap-4">
            <button class="btn-forge !rounded-full !px-9 !py-4 text-[15px]" (click)="connectAndForge()">
              Discover Now →
            </button>
            <a class="btn-ghost !rounded-full" href="#how-it-works">How it works</a>
          </div>
        </div>

        <!-- RIGHT: Character + Floating Cards -->
        <div class="relative flex items-center justify-center animate-fade-up" style="animation-delay: 0.15s">
          <!-- Floating NFT Card (top-right) -->
          <div class="absolute -right-2 top-4 z-20 animate-float hidden sm:block">
            <div class="glass-card--glow rounded-2xl bg-white p-4 shadow-float" style="min-width: 170px;">
              <div class="flex items-center gap-3 mb-3">
                <img src="assets/nft-avatar.png" alt="NFT creator" class="h-12 w-12 rounded-full object-cover ring-2 ring-nft-primary/20" />
              </div>
              <p class="text-xl font-black text-nft-darker">◆ 9.05 ETH</p>
              <p class="mt-1 text-xs text-slate-400">Create by</p>
              <p class="text-sm font-bold text-nft-darker tracking-wide">89HHFFL</p>
            </div>
          </div>

          <!-- Hero Character Image -->
          <div class="relative">
            <img
              src="assets/hero-character.png"
              alt="3D NFT Character"
              class="relative z-10 mx-auto w-[320px] sm:w-[400px] lg:w-[460px] drop-shadow-[0_30px_60px_rgba(99,102,241,0.15)]"
            />
            <!-- Subtle glow behind character -->
            <div class="absolute inset-0 -z-10 blur-[80px] opacity-30 bg-gradient-to-br from-nft-primary/40 via-transparent to-nft-secondary/30 rounded-full scale-75"></div>
          </div>

          <!-- Bottom creator tag -->
          <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 animate-float-slow hidden sm:flex items-center gap-3 rounded-full bg-nft-dark/90 backdrop-blur-xl px-5 py-2.5 shadow-float">
            <img src="assets/nft-avatar.png" alt="Creator" class="h-8 w-8 rounded-full object-cover ring-1 ring-white/20" />
            <div>
              <p class="text-xs font-bold text-white tracking-wide">ZCX551KL7</p>
              <p class="text-[11px] text-slate-400">◆ 9.05 ETH</p>
            </div>
            <button class="rounded-full border border-white/20 px-3.5 py-1 text-[11px] font-semibold text-white hover:bg-white/10 transition-all">Follow</button>
          </div>
        </div>
      </div>

      <!-- ═══ DARK STATS BAR ═══ -->
      <div class="mt-4 -mx-4 sm:-mx-6 lg:-mx-10 rounded-t-[2.5rem] overflow-hidden">
        <div class="bg-gradient-to-br from-nft-dark to-[#0B1120] px-6 py-12 sm:px-10">
          <div class="mx-auto max-w-7xl grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div class="text-center sm:text-left group">
              <p class="text-4xl font-black text-white font-mono tracking-tight group-hover:text-nft-primary-light transition-colors">{{ stats().agentsMinted | number }}</p>
              <p class="mt-2 text-sm text-slate-400">Agents Minted</p>
            </div>
            <div class="text-center sm:text-left group">
              <p class="text-4xl font-black text-white font-mono tracking-tight group-hover:text-nft-secondary-light transition-colors">{{ stats().forgeEarned | number }}</p>
              <p class="mt-2 text-sm text-slate-400">FORGE Earned</p>
            </div>
            <div class="text-center sm:text-left group">
              <p class="text-4xl font-black text-white font-mono tracking-tight group-hover:text-nft-primary-light transition-colors">{{ stats().contentTraded | number }}</p>
              <p class="mt-2 text-sm text-slate-400">Content NFTs</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ HOW IT WORKS ═══ -->
    <section id="how-it-works" class="mx-auto max-w-7xl py-20 space-y-10">
      <div class="text-center space-y-3">
        <p class="section-kicker">How It Works</p>
        <h2 class="font-display text-4xl font-extrabold text-nft-darker sm:text-5xl">Three Simple Steps</h2>
      </div>

      <div class="grid grid-cols-1 gap-7 md:grid-cols-3">
        <article class="glass-card--glow p-8 text-center group hover:-translate-y-2 transition-all duration-500 animate-fade-up stagger-1">
          <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-nft-primary/10 to-nft-primary/5 text-nft-primary font-mono text-2xl font-black group-hover:from-nft-primary group-hover:to-nft-primary-dark group-hover:text-white group-hover:shadow-btn transition-all duration-500">01</div>
          <h3 class="font-display text-xl font-bold text-nft-darker">Forge</h3>
          <p class="mt-3 text-sm text-slate-500 leading-relaxed">Choose type and specialization, then mint your agent NFT with unique on-chain DNA.</p>
        </article>
        <article class="glass-card--glow p-8 text-center group hover:-translate-y-2 transition-all duration-500 animate-fade-up stagger-2">
          <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-nft-secondary/10 to-nft-secondary/5 text-nft-secondary font-mono text-2xl font-black group-hover:from-nft-secondary group-hover:to-[#0D9488] group-hover:text-white group-hover:shadow-[0_4px_14px_rgba(20,184,166,0.3)] transition-all duration-500">02</div>
          <h3 class="font-display text-xl font-bold text-nft-darker">Work</h3>
          <p class="mt-3 text-sm text-slate-500 leading-relaxed">Generate marketable content or run strategy bots using your agent's AI brain.</p>
        </article>
        <article class="glass-card--glow p-8 text-center group hover:-translate-y-2 transition-all duration-500 animate-fade-up stagger-3">
          <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-nft-primary/10 to-nft-primary/5 text-nft-primary font-mono text-2xl font-black group-hover:from-nft-primary group-hover:to-nft-primary-dark group-hover:text-white group-hover:shadow-btn transition-all duration-500">03</div>
          <h3 class="font-display text-xl font-bold text-nft-darker">Earn</h3>
          <p class="mt-3 text-sm text-slate-500 leading-relaxed">Collect royalties, trading fees, and rental yield in the $FORGE economy.</p>
        </article>
      </div>
    </section>

    <!-- ═══ FEATURED AGENTS ═══ -->
    <section class="mx-auto max-w-7xl py-8 space-y-7">
      <div class="flex items-end justify-between">
        <div>
          <p class="section-kicker">Featured</p>
          <h2 class="font-display text-3xl font-extrabold text-nft-darker">Top Agents</h2>
        </div>
        <a routerLink="/marketplace" class="btn-ghost !rounded-full text-xs">View All →</a>
      </div>
      <div class="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
        <app-agent-card
          *ngFor="let agent of featuredAgents"
          [agent]="agent"
          (onClick)="openAgent($event)"
        ></app-agent-card>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
  `]
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
