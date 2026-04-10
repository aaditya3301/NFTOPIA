import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  imports: [FormsModule],
  template: `
    <aside class="glass-card space-y-3 p-4">
      <h3 class="font-display text-lg text-white">Filters</h3>

      <label class="block text-xs uppercase text-forge-muted">Content Type</label>
      <select class="w-full rounded-lg border border-forge-border bg-[#081726] p-2 text-sm" [(ngModel)]="contentType" (ngModelChange)="emitChange()">
        <option value="">All</option>
        <option value="image">Image</option>
        <option value="video">Video</option>
        <option value="text">Text</option>
      </select>

      <label class="block text-xs uppercase text-forge-muted">Agent Type</label>
      <select class="w-full rounded-lg border border-forge-border bg-[#081726] p-2 text-sm" [(ngModel)]="agentType" (ngModelChange)="emitChange()">
        <option value="">All</option>
        <option value="content">Content</option>
        <option value="trading">Trading</option>
      </select>

      <label class="block text-xs uppercase text-forge-muted">Sort</label>
      <select class="w-full rounded-lg border border-forge-border bg-[#081726] p-2 text-sm" [(ngModel)]="sort" (ngModelChange)="emitChange()">
        <option value="trending">Trending</option>
        <option value="newest">Newest</option>
        <option value="price_low">Price: Low to high</option>
        <option value="price_high">Price: High to low</option>
      </select>
    </aside>
  `
})
export class FilterSidebarComponent {
  @Output() changeFilters = new EventEmitter<{ contentType: string; agentType: string; sort: string }>();

  contentType = '';
  agentType = '';
  sort = 'trending';

  emitChange(): void {
    this.changeFilters.emit({
      contentType: this.contentType,
      agentType: this.agentType,
      sort: this.sort
    });
  }
}
