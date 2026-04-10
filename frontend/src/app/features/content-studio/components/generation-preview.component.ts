import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

type ContentType = 'image' | 'video' | 'text';

@Component({
  selector: 'app-generation-preview',
  standalone: true,
  imports: [NgIf, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="glass-card p-5">
      <h2 class="font-display text-2xl text-white">Preview</h2>

      <div class="mt-4 min-h-72 rounded-xl border border-forge-border bg-[#081622] p-4">
        <app-loading-spinner *ngIf="isGenerating" label="Generating output..."></app-loading-spinner>

        <ng-container *ngIf="!isGenerating && contentUrl">
          <img *ngIf="contentType === 'image'" [src]="contentUrl" class="h-64 w-full rounded-lg object-cover" alt="Generated content" />
          <video *ngIf="contentType === 'video'" [src]="contentUrl" controls class="h-64 w-full rounded-lg object-cover"></video>
          <p *ngIf="contentType === 'text'" class="whitespace-pre-wrap text-slate-200">{{ contentText }}</p>
        </ng-container>

        <p *ngIf="!isGenerating && !contentUrl" class="text-sm text-forge-muted">Your generated output will appear here.</p>
      </div>

      <div class="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-forge-border bg-[#0a1b29] p-4 md:grid-cols-2">
        <label class="flex items-center gap-2 text-sm text-slate-200">
          <input type="checkbox" [ngModel]="mintAsNft" (ngModelChange)="mintAsNftChange.emit($event)" />
          Mint as NFT
        </label>

        <label class="flex items-center gap-2 text-sm text-slate-200">
          Price
          <input
            type="number"
            min="1"
            class="w-28 rounded-lg border border-forge-border bg-[#071622] px-2 py-1 text-sm"
            [ngModel]="priceForge"
            (ngModelChange)="priceForgeChange.emit($event)"
          />
          $FORGE
        </label>
      </div>
    </div>
  `
})
export class GenerationPreviewComponent {
  @Input() isGenerating = false;
  @Input() contentType: ContentType = 'image';
  @Input() contentUrl = '';
  @Input() contentText = '';
  @Input() mintAsNft = true;
  @Input() priceForge = 120;
  @Output() mintAsNftChange = new EventEmitter<boolean>();
  @Output() priceForgeChange = new EventEmitter<number>();
}
