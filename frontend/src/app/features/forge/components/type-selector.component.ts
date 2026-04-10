import { NgClass, NgFor } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AgentType } from '../../../core/models/agent.model';

@Component({
  selector: 'app-type-selector',
  standalone: true,
  imports: [NgFor, NgClass],
  template: `
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <button
        *ngFor="let option of options"
        class="glass-card p-5 text-left transition-all duration-300"
        [ngClass]="selection === option.type ? 'border-forge-secondary shadow-[0_0_28px_rgba(249,115,22,.22)]' : 'hover:border-forge-primary/60'"
        (click)="select.emit(option.type)"
      >
        <p class="text-xs uppercase text-forge-muted">{{ option.kicker }}</p>
        <h3 class="mt-2 font-display text-2xl text-white">{{ option.label }}</h3>
        <p class="mt-2 text-sm text-slate-300">{{ option.description }}</p>
      </button>
    </div>
  `
})
export class TypeSelectorComponent {
  @Input() selection: AgentType | null = null;
  @Output() select = new EventEmitter<AgentType>();

  readonly options: Array<{ type: AgentType; label: string; kicker: string; description: string }> = [
    {
      type: 'content',
      kicker: 'Creator Class',
      label: 'Content Agent',
      description: 'Generate images, video, and text content with signature style DNA.'
    },
    {
      type: 'trading',
      kicker: 'Quant Class',
      label: 'Trading Agent',
      description: 'Execute strategy logic and earn performance fees from allocations.'
    }
  ];
}
