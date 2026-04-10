import { NgIf } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContentNft } from '../../core/models/content.model';
import { ContentService } from '../../core/services/content.service';
import { NotificationService } from '../../core/services/notification.service';
import { ContentHistoryComponent } from './components/content-history.component';
import { ContentTypeSelectorComponent } from './components/content-type-selector.component';
import { GenerationPreviewComponent } from './components/generation-preview.component';
import { PromptAdvancedOptions, PromptInputComponent } from './components/prompt-input.component';

@Component({
  selector: 'app-content-studio',
  standalone: true,
  imports: [NgIf, PromptInputComponent, ContentTypeSelectorComponent, GenerationPreviewComponent, ContentHistoryComponent],
  template: `
    <section class="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
      <div class="glass-card space-y-4 p-6">
        <header>
          <h1 class="font-display text-3xl text-white">Content Studio</h1>
          <p class="text-sm text-forge-muted">Agent #{{ agentId }} · Create image, video, and text outputs.</p>
          <div class="mt-3 rounded-xl border border-forge-border bg-[#0a1a28] p-3 text-xs text-forge-muted">
            Credits remaining: <span class="font-mono text-forge-secondary">{{ credits() }}</span>
          </div>
        </header>

        <app-content-type-selector [selectedType]="contentType()" (selectedTypeChange)="contentType.set($event)"></app-content-type-selector>

        <app-prompt-input [(prompt)]="prompt" [(options)]="advancedOptions"></app-prompt-input>

        <div class="flex items-center justify-between">
          <p class="text-xs text-forge-muted">Estimated time: {{ etaLabel() }}</p>
          <button class="btn-forge" (click)="generate()" [disabled]="isGenerating() || !prompt.trim()">Generate</button>
        </div>
      </div>

      <div class="space-y-4">
        <app-generation-preview
          [isGenerating]="isGenerating()"
          [contentType]="contentType()"
          [contentUrl]="generatedUrl()"
          [contentText]="generatedText()"
          [(mintAsNft)]="mintAsNft"
          [(priceForge)]="priceForge"
        ></app-generation-preview>

        <app-content-history [items]="history()" (select)="selectHistoryItem($event)"></app-content-history>
      </div>
    </section>
  `
})
export class ContentStudioComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly content = inject(ContentService);
  private readonly notify = inject(NotificationService);

  readonly agentId = Number(this.route.snapshot.paramMap.get('agentId') || 0);
  readonly contentType = signal<'image' | 'video' | 'text'>('image');
  readonly isGenerating = signal(false);
  readonly generatedUrl = signal('');
  readonly generatedText = signal('');
  readonly history = signal<ContentNft[]>([]);
  readonly credits = signal(18);

  prompt = '';
  mintAsNft = true;
  priceForge = 120;
  advancedOptions: PromptAdvancedOptions = {
    styleIntensity: 70,
    aspectRatio: '1:1',
    durationSec: 10,
    tone: 'neutral'
  };

  setContentType(value: string): void {
    if (value === 'image' || value === 'video' || value === 'text') {
      this.contentType.set(value);
    }
  }

  etaLabel(): string {
    const map = {
      image: '~5s',
      video: '~15s',
      text: '~3s'
    };
    return map[this.contentType()];
  }

  constructor() {
    if (this.agentId) {
      this.content.getAgentContent(this.agentId).subscribe({
        next: (items) => this.history.set(items),
        error: () => this.history.set([])
      });
    }
  }

  generate(): void {
    if (!this.prompt.trim()) {
      return;
    }

    this.isGenerating.set(true);
    this.content
      .generate({
        agentId: this.agentId,
        prompt: `${this.prompt}\n\nstyle_intensity=${this.advancedOptions.styleIntensity}; aspect_ratio=${this.advancedOptions.aspectRatio}; duration=${this.advancedOptions.durationSec}; tone=${this.advancedOptions.tone}`,
        contentType: this.contentType()
      })
      .subscribe({
        next: (res) => {
          this.isGenerating.set(false);
          this.generatedUrl.set(res.contentUrl);
          this.generatedText.set(this.contentType() === 'text' ? 'Generated text content is available via URL metadata.' : '');
          this.credits.update((current) => Math.max(0, current - 1));
          this.notify.success('Content generated and listed successfully');
        },
        error: () => {
          this.isGenerating.set(false);
          this.notify.error('Generation failed. Verify backend and Gemini setup.');
        }
      });
  }

  selectHistoryItem(item: ContentNft): void {
    this.generatedUrl.set(item.contentUrl);
    this.generatedText.set(item.contentType === 'text' ? 'Previously generated text content selected.' : '');
    this.contentType.set(item.contentType as 'image' | 'video' | 'text');
  }
}
