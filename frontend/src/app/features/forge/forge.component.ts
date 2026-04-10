import { NgIf } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AgentType, ForgeRequest } from '../../core/models/agent.model';
import { AgentService } from '../../core/services/agent.service';
import { NotificationService } from '../../core/services/notification.service';
import { Web3Service } from '../../core/services/web3.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { DnaPreviewComponent } from './components/dna-preview.component';
import { SpecializationPickerComponent } from './components/specialization-picker.component';
import { TypeSelectorComponent } from './components/type-selector.component';

@Component({
  selector: 'app-forge',
  standalone: true,
  imports: [NgIf, TypeSelectorComponent, SpecializationPickerComponent, DnaPreviewComponent, LoadingSpinnerComponent],
  template: `
    <section class="mx-auto max-w-5xl space-y-6">
      <header class="space-y-2">
        <h1 class="font-display text-4xl text-white">Forge New Agent</h1>
        <p class="text-forge-muted">Choose your agent class, specialization, and mint your AI business as an NFT.</p>
      </header>

      <div class="glass-card space-y-6 p-6">
        <div>
          <p class="mb-3 text-xs uppercase text-forge-muted">Step 1 · Type</p>
          <app-type-selector [selection]="agentType()" (select)="selectType($event)"></app-type-selector>
        </div>

        <div *ngIf="agentType()">
          <p class="mb-3 text-xs uppercase text-forge-muted">Step 2 · Specialization</p>
          <app-specialization-picker
            [options]="specializations()"
            [selected]="specialization()"
            (select)="specialization.set($event)"
          ></app-specialization-picker>
        </div>

        <div *ngIf="specialization()">
          <p class="mb-3 text-xs uppercase text-forge-muted">Step 3 · DNA Preview</p>
          <app-dna-preview [specialization]="specialization()"></app-dna-preview>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <button class="btn-forge" (click)="forge()" [disabled]="isMinting() || !canMint()">FORGE THIS AGENT</button>
          <app-loading-spinner *ngIf="isMinting()" label="Minting and finalizing on-chain DNA..."></app-loading-spinner>
        </div>
      </div>
    </section>
  `
})
export class ForgeComponent {
  private readonly agentService = inject(AgentService);
  private readonly notify = inject(NotificationService);
  private readonly web3 = inject(Web3Service);
  private readonly router = inject(Router);

  readonly agentType = signal<AgentType | null>(null);
  readonly specialization = signal('');
  readonly isMinting = signal(false);

  readonly specializations = computed(() =>
    this.agentType() === 'content'
      ? this.agentService.getContentSpecializations()
      : this.agentType() === 'trading'
        ? this.agentService.getTradingSpecializations()
        : []
  );

  readonly canMint = computed(() => !!this.agentType() && !!this.specialization());

  selectType(value: AgentType): void {
    this.agentType.set(value);
    this.specialization.set('');
  }

  forge(): void {
    const wallet = this.web3.walletAddress();
    const selectedType = this.agentType();
    const selectedSpecialization = this.specialization();

    if (!wallet || !selectedType || !selectedSpecialization) {
      this.notify.warning('Complete all steps before minting');
      return;
    }

    const payload: ForgeRequest = {
      agentType: selectedType,
      specialization: selectedSpecialization,
      ownerAddress: wallet
    };

    this.isMinting.set(true);
    this.agentService
      .forgeAgent(payload)
      .pipe(finalize(() => this.isMinting.set(false)))
      .subscribe({
        next: (res) => {
          this.notify.success(`Agent #${res.tokenId} forged successfully`);
          const nextRoute = selectedType === 'content' ? `/studio/${res.tokenId}` : '/trading';
          this.router.navigateByUrl(nextRoute);
        },
        error: () => {
          this.notify.error('Forge failed. Check backend and contract configuration.');
        }
      });
  }
}
