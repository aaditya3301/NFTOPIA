import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  imports: [FormsModule],
  template: `
    <aside class="glass-card--glow space-y-5 p-6 sticky top-28">
      <h3 class="font-display text-lg font-bold text-nft-darker">Filters</h3>

      <div>
        <label class="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Content Type</label>
        <select class="input-light" [(ngModel)]="contentType" (ngModelChange)="emitChange()">
          <option value="">All</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
          <option value="text">Text</option>
        </select>
      </div>

      <div>
        <label class="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Agent Type</label>
        <select class="input-light" [(ngModel)]="agentType" (ngModelChange)="emitChange()">
          <option value="">All</option>
          <option value="content">Content</option>
          <option value="trading">Trading</option>
        </select>
      </div>

      <div>
        <label class="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Sort</label>
        <select class="input-light" [(ngModel)]="sort" (ngModelChange)="emitChange()">
          <option value="trending">Trending</option>
          <option value="newest">Newest</option>
          <option value="price_low">Price: Low → High</option>
          <option value="price_high">Price: High → Low</option>
        </select>
      </div>
    </aside>
  `,
  styles: [`
    :host { display: block; height: 100%; }
  `]
})
export class FilterSidebarComponent {
  @Output() changeFilters = new EventEmitter<{ contentType: string; agentType: string; sort: string }>();
  contentType = '';
  agentType = '';
  sort = 'trending';

  emitChange(): void {
    this.changeFilters.emit({ contentType: this.contentType, agentType: this.agentType, sort: this.sort });
  }
}
