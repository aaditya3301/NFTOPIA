import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { WalletButtonComponent } from '../wallet-button/wallet-button.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, WalletButtonComponent],
  template: `
    <header class="fixed inset-x-0 top-0 z-40 border-b border-forge-border/80 bg-[#06111add] backdrop-blur-xl">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-10">
        <a routerLink="/" class="flex items-center gap-3">
          <div class="h-9 w-9 rounded-xl bg-gradient-to-br from-forge-primary to-forge-secondary"></div>
          <div>
            <p class="font-display text-base font-semibold tracking-wide text-white">AgentForge</p>
            <p class="text-xs text-forge-muted">Mint. Evolve. Earn.</p>
          </div>
        </a>

        <nav class="hidden items-center gap-5 text-sm text-slate-300 md:flex">
          <a routerLink="/forge" routerLinkActive="text-white" class="hover:text-white">Forge</a>
          <a routerLink="/marketplace" routerLinkActive="text-white" class="hover:text-white">Marketplace</a>
          <a routerLink="/trading" routerLinkActive="text-white" class="hover:text-white">Trading</a>
          <a routerLink="/dashboard" routerLinkActive="text-white" class="hover:text-white">My Empire</a>
          <a routerLink="/rental" routerLinkActive="text-white" class="hover:text-white">Rental</a>
        </nav>

        <app-wallet-button></app-wallet-button>
      </div>
    </header>
  `
})
export class NavbarComponent {}
