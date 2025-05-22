import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent {
  @Input() item: any;
  @Input() apiUrl: string = '';
  @Input() viewType: 'grid' | 'list' = 'grid';

  @Output() cardClick = new EventEmitter<number>(); 

  // Mètode que s'executa quan es fa clic a la targeta
  onCardClick(): void {
    if (this.item?.id) {
      this.cardClick.emit(Number(this.item.id));
    }
  }
}