import { Component, Input } from '@angular/core';
import { ForgeFormatPipe } from '../../pipes/forge-format.pipe';

@Component({
  selector: 'app-forge-amount',
  standalone: true,
  imports: [ForgeFormatPipe],
  template: `<span class="font-mono text-forge-secondary">{{ amount | forgeFormat }}</span>`
})
export class ForgeAmountComponent {
  @Input() amount = 0;
}
