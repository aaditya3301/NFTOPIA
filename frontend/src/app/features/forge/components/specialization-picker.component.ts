import { NgClass, NgFor, TitleCasePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-specialization-picker',
  standalone: true,
  imports: [NgFor, NgClass, TitleCasePipe],
  template: `
    <div class="grid grid-cols-2 gap-3 md:grid-cols-3">
      <button
        *ngFor="let item of options"
        class="rounded-xl border p-3 text-left text-sm transition-all"
        [ngClass]="
          selected === item
            ? 'border-forge-secondary bg-forge-secondary/10 text-forge-secondary'
            : 'border-forge-border bg-forge-card/70 text-slate-200 hover:border-forge-primary/60'
        "
        (click)="select.emit(item)"
      >
        {{ item | titlecase }}
      </button>
    </div>
  `
})
export class SpecializationPickerComponent {
  @Input() options: string[] = [];
  @Input() selected = '';
  @Output() select = new EventEmitter<string>();
}
