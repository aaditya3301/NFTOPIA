import { NgFor, TitleCasePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

type ContentType = 'image' | 'video' | 'text';

@Component({
  selector: 'app-content-type-selector',
  standalone: true,
  imports: [NgFor, TitleCasePipe],
  template: `
    <div class="grid grid-cols-1 gap-2 rounded-xl border border-forge-border bg-[#091927] p-1">
      <button
        class="rounded-lg px-3 py-2 text-sm bg-forge-primary text-black"
      >
        Image
      </button>
    </div>
  `
})
export class ContentTypeSelectorComponent {
  @Input() selectedType: ContentType = 'image';
  @Output() selectedTypeChange = new EventEmitter<ContentType>();

  readonly contentTypes: ContentType[] = ['image'];

  onSelect(value: ContentType): void {
    this.selectedTypeChange.emit(value);
  }
}
