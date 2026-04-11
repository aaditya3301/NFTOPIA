import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, inject, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgentConfig } from '../../../core/models/agent.model';
import { AgentService } from '../../../core/services/agent.service';
import { Web3Service } from '../../../core/services/web3.service';

@Component({
  selector: 'app-rental-listing-form',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf],
  template: `
    <div class="glass-card p-5">
      <h2 class="font-display text-2xl text-white">List Agent For Rent</h2>
      <div class="mt-3 grid grid-cols-1 gap-3">
        <label class="text-xs uppercase text-forge-muted">Select Agent</label>
        <select
          class="rounded-lg border border-forge-border bg-[#081726] p-2 text-slate-100"
          [(ngModel)]="tokenId"
        >
          <option [value]="0" *ngIf="myAgents.length === 0">No agents found</option>
          <option *ngFor="let agent of myAgents" [value]="agent.tokenId">
            Agent #{{ agent.tokenId }} — {{ agent.specialization }} ({{ agent.agentType }})
          </option>
        </select>

        <label class="text-xs uppercase text-forge-muted">Price per day ($FORGE)</label>
        <input type="number" min="1" class="rounded-lg border border-forge-border bg-[#081726] p-2" [(ngModel)]="pricePerDay" />

        <label class="text-xs uppercase text-forge-muted">Max duration (days)</label>
        <input type="number" min="1" max="30" class="rounded-lg border border-forge-border bg-[#081726] p-2" [(ngModel)]="maxDuration" />

        <button class="btn-forge" (click)="submit()" [disabled]="!tokenId">Create Listing</button>
      </div>
    </div>
  `
})
export class RentalListingFormComponent {
  @Output() createListing = new EventEmitter<{ tokenId: number; pricePerDay: number; maxDuration: number }>();

  private readonly agentService = inject(AgentService);
  private readonly web3 = inject(Web3Service);

  myAgents: AgentConfig[] = [];
  tokenId = 0;
  pricePerDay = 25;
  maxDuration = 7;

  constructor() {
    effect(() => {
      const address = this.web3.walletAddress();
      if (address) {
        this.agentService.getMyAgents(address).subscribe(agents => {
          this.myAgents = agents;
          if (agents.length > 0 && !this.tokenId) {
            this.tokenId = agents[0].tokenId;
          }
        });
      } else {
        this.myAgents = [];
        this.tokenId = 0;
      }
    });
  }

  submit(): void {
    if (!this.tokenId) return;
    this.createListing.emit({
      tokenId: this.tokenId,
      pricePerDay: this.pricePerDay,
      maxDuration: this.maxDuration
    });
  }
}
