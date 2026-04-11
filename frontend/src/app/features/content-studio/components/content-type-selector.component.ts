import { NgFor, TitleCasePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

type ContentType = 'image' | 'video' | 'text';

@Component({
  selector: 'app-content-type-selector',
  standalone: true,
  imports: [NgFor, TitleCasePipe],
  template: `
    <div class="inline-flex rounded-full border border-nft-border bg-nft-surface p-1">
      <button
        *ngFor="let type of contentTypes"
        class="rounded-full px-5 py-2 text-sm font-medium transition-all"
        [class]="selectedType === type ? 'bg-nft-primary text-white shadow-btn' : 'text-nft-muted hover:text-nft-text'"
        (click)="onSelect(type)"
      >
        {{ type | titlecase }}
      </button>
    </div>
  `
})
export class ContentTypeSelectorComponent {
  @Input() selectedType: ContentType = 'image';
  @Output() selectedTypeChange = new EventEmitter<ContentType>();

  readonly contentTypes: ContentType[] = ['image', 'video', 'text'];

  onSelect(value: ContentType): void {
    this.selectedTypeChange.emit(value);
  }
}
