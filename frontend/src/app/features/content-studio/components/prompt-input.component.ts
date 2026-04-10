import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface PromptAdvancedOptions {
  styleIntensity: number;
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:5';
  durationSec: 5 | 10 | 15;
  tone: 'neutral' | 'bold' | 'cinematic';
}

@Component({
  selector: 'app-prompt-input',
  standalone: true,
  imports: [NgIf, FormsModule],
  template: `
    <div class="space-y-3">
      <textarea
        class="h-40 w-full rounded-xl border border-forge-border bg-[#081623] p-4 text-slate-100 outline-none transition-all focus:border-forge-primary"
        [ngModel]="prompt"
        (ngModelChange)="promptChange.emit($event)"
        placeholder="Describe what your agent should generate..."
      ></textarea>

      <div class="flex items-center justify-between">
        <p class="text-xs text-forge-muted">Characters: {{ prompt.length }}</p>
        <button class="btn-ghost" (click)="showAdvanced = !showAdvanced">{{ showAdvanced ? 'Hide' : 'Show' }} advanced options</button>
      </div>

      <div *ngIf="showAdvanced" class="space-y-3 rounded-xl border border-forge-border bg-[#091927] p-4">
        <label class="block text-xs uppercase text-forge-muted">Style Intensity ({{ options.styleIntensity }})</label>
        <input
          type="range"
          min="10"
          max="100"
          step="5"
          class="w-full"
          [(ngModel)]="options.styleIntensity"
          (ngModelChange)="emitOptions()"
        />

        <div class="grid grid-cols-2 gap-3">
          <label class="text-xs uppercase text-forge-muted">Aspect Ratio</label>
          <select class="rounded-lg border border-forge-border bg-[#071622] p-2 text-sm" [(ngModel)]="options.aspectRatio" (ngModelChange)="emitOptions()">
            <option value="1:1">1:1</option>
            <option value="16:9">16:9</option>
            <option value="9:16">9:16</option>
            <option value="4:5">4:5</option>
          </select>

          <label class="text-xs uppercase text-forge-muted">Video Duration</label>
          <select class="rounded-lg border border-forge-border bg-[#071622] p-2 text-sm" [(ngModel)]="options.durationSec" (ngModelChange)="emitOptions()">
            <option [ngValue]="5">5 sec</option>
            <option [ngValue]="10">10 sec</option>
            <option [ngValue]="15">15 sec</option>
          </select>

          <label class="text-xs uppercase text-forge-muted">Tone</label>
          <select class="rounded-lg border border-forge-border bg-[#071622] p-2 text-sm" [(ngModel)]="options.tone" (ngModelChange)="emitOptions()">
            <option value="neutral">Neutral</option>
            <option value="bold">Bold</option>
            <option value="cinematic">Cinematic</option>
          </select>
        </div>
      </div>
    </div>
  `
})
export class PromptInputComponent {
  @Input() prompt = '';
  @Output() promptChange = new EventEmitter<string>();
  @Input() options: PromptAdvancedOptions = {
    styleIntensity: 70,
    aspectRatio: '1:1',
    durationSec: 10,
    tone: 'neutral'
  };
  @Output() optionsChange = new EventEmitter<PromptAdvancedOptions>();

  showAdvanced = false;

  emitOptions(): void {
    this.optionsChange.emit({ ...this.options });
  }
}
