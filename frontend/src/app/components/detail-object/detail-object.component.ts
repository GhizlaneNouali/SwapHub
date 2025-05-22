 import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemService } from '../../services/item/item.service';
import { Item } from '../../models/item.model';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../card/card.component';
import { Location } from '@angular/common';

/**
 * Componente que mostra els detalls dels objectes amb diversos modes:
 * - VIEW_MODE: Per veure els detalls d'un objecte amb opció d'intercanvi (per defecte)
 * - MY_OBJECT_MODE: Per veure els objectes propis de l'usuari amb opció d'editar
 * - EXCHANGE_TARGET_MODE: Per veure l'objecte al qual es vol intercanviar
 */

@Component({
  selector: 'app-detail-object',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent],
  templateUrl: './detail-object.component.html',
  styleUrls: ['./detail-object.component.css']
})
export class DetailObjectComponent implements OnInit {
  readonly MY_OBJECT_MODE = 'my-object';  // Mode per veure els objectes propis
  readonly VIEW_ONLY_MODE = 'view-only';  // Mode només per veure l'objecte  
  readonly EXCHANGE_MODE = 'exchange';   // Mode per sol·licitar un intercanvi
  
  @Input() mode: string = this.VIEW_ONLY_MODE;  // Mode actual (per defecte és 'view-only')
  @Input() itemId: number | null = null;  // ID de l'objecte a mostrar (si es passa com a input)
  @Input() itemData: Item | null = null;   // Dades de l'objecte passades com a input
  @Output() editObject = new EventEmitter<number>();  // Event per a l'edició d'un objecte
  @Output() exchangeRequest = new EventEmitter<number>();  // Event per sol·licitar un intercanvi
  
  item: Item | null = null;  // Objecte que mostrarem
  apiUrl = environment.apiUrl;   // URL de l'API
  error: string | null = null;  // Missatge d'error si hi ha problemes

  successMessage: string | null = null;   // Missatge d'èxit després d'operacions correctes
  errorMessage: string | null = null;   // Missatge d'error per mostrar en la vista


  currentIndex = 0;  // Índex de la imatge actual mostrada
  relatedItems: any[] = [];  // Llista d'objectes relacionats
  isLoading = true;  // Variable per gestionar el carregament


  constructor(
    private route: ActivatedRoute,
    private itemService: ItemService,
    private router: Router,
    private location: Location
  ) {}

 
ngOnInit(): void {
    // S'obtenen els paràmetres de la ruta per determinar el mode
   this.route.queryParams.subscribe(params => {
    const modeParam = params['mode'];
    if (modeParam) {
       switch(modeParam) {
         // Es determina el mode basat en el paràmetre de la ruta
        case 'exchange':
          this.mode = this.EXCHANGE_MODE;
          break;
        case 'my-object':
          this.mode = this.MY_OBJECT_MODE;
          break;
        case 'view-only':
          this.mode = this.VIEW_ONLY_MODE;
          break;
        default:
           this.mode = this.VIEW_ONLY_MODE;
      }
    }
  });

    // Si es passa itemData, s'assigna a item directament i es carrega llistat d'objectes relacionats si és necessari
   if (this.itemData) {
    this.item = this.itemData;
    this.isLoading = false;
    if (this.mode === this.EXCHANGE_MODE || this.mode === this.VIEW_ONLY_MODE) {
      this.loadRelatedItems();
    }
    return;
  }

    // Si no es passa itemId, es llegeix des de la ruta
   if (!this.itemId) {
    this.route.paramMap.subscribe(params => {
      const routeItemId = params.get('id');
      if (routeItemId) {
        this.itemId = +routeItemId;
        this.loadItemDetails(this.itemId);
      }
    });
  } else {
     this.loadItemDetails(this.itemId);
  }
}

  // Carrega els detalls d'un objecte basant-se en l'ID
  loadItemDetails(id: number): void {
    this.isLoading = true;
    this.currentIndex = 0; 
    // Sol·licitem els detalls de l'objecte
    this.itemService.getItem(id).subscribe({
      next: (data) => {
        this.item = data;
        this.isLoading = false;
        // Carreguem els objectes relacionats si estem en mode intercanvi o només visualització
         if (this.mode === this.EXCHANGE_MODE || this.mode === this.VIEW_ONLY_MODE) {
          this.loadRelatedItems();
        }
      },
      error: (err) => {
        console.error('Error fetching item:', err);
        this.error = "Error loading item";
        this.isLoading = false;
      }
    });
  }
  // Carrega els objectes relacionats amb l'objecte actual
  loadRelatedItems(): void {
    if (!this.item) return;
    
    this.itemService.getRelatedItems(this.item.id, this.item.category).subscribe({
      next: (items) => {
        this.relatedItems = items;
      },
      error: (err) => {
        console.error('Error loading related items:', err);
      }
    });
  }

  // Canvia a la imatge anterior
  prevImage(event: Event): void {
    event.preventDefault();
    if (!this.item?.images?.length) return;
    
    const length = this.item.images.length;
    this.currentIndex = (this.currentIndex - 1 + length) % length;
  }

  // Canvia a la següent imatge
  nextImage(event: Event): void {
    event.preventDefault();
    if (!this.item?.images?.length) return;
    
    const length = this.item.images.length;
    this.currentIndex = (this.currentIndex + 1) % length;
  }

  // Obté l'URL de la imatge en base a l'índex
  getImageUrl(index: number): string {
    if (!this.item?.images?.[index]?.path) {
      return 'assets/placeholder-image.jpg';
    }
    return this.apiUrl + this.item.images[index].path;
  }

  // Comprova si l'objecte té imatges
  hasImages(): boolean {
    return !!this.item?.images && this.item.images.length > 0;
  }

  // Retorna la URL de la imatge actual
  getCurrentImageUrl(): string {
    return this.getImageUrl(this.currentIndex);
  }

  // Mostra els detalls de l'objecte seleccionat
  viewItemDetail(itemId: number): void {
     this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      this.router.navigate(['/app/item-detail', itemId]);
    });
  }
  
  // Gestiona l'acció primària segons el mode
   handlePrimaryAction(): void {
    if (!this.item) return;
    
    switch (this.mode) {
      case this.MY_OBJECT_MODE:
        this.goToEdit();
        break;
      case this.EXCHANGE_MODE:
        this.requestExchange();
        break;
     }
  }
  
  // Sol·licita un intercanvi
   requestExchange(): void {
    if (this.item) {
      this.router.navigate(['app/exchange'], {
        queryParams: { requestedItemId: this.item.id }
      });
    }
  }
  
  // Va a l'edició de l'objecte
   goToEdit(): void {
    if (this.item) {
      this.router.navigate(['app/new-object', this.item.id]);
      this.editObject.emit(this.item.id);
    }
  }
  
  // Comprova si s'han de mostrar els objectes relacionats
   shouldShowRelatedItems(): boolean {
    return (this.mode === this.EXCHANGE_MODE || this.mode === this.VIEW_ONLY_MODE) && this.relatedItems.length > 0;
  }
  
  // Comprova si s'ha de mostrar el botó primari
   shouldShowPrimaryButton(): boolean {
    return this.mode === this.MY_OBJECT_MODE || this.mode === this.EXCHANGE_MODE;
  }

  // Retorna el text del botó primari
   getPrimaryActionText(): string {
    switch (this.mode) {
      case this.MY_OBJECT_MODE:
        return 'Edit Object';
      case this.EXCHANGE_MODE:
        return 'Request Exchange';
      default:
        return '';
    }
  }
  
  // Retorna l'icona per al botó primari
   getPrimaryActionIcon(): string {
    switch (this.mode) {
      case this.MY_OBJECT_MODE:
        return '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>';
      case this.EXCHANGE_MODE:
        return '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>';
      default:
        return '';
    }
  }

// Mostra la vista anterior
  goBack(): void {
    this.location.back();
  }

// Elimina el item
  deleteItem(): void {
    if (this.item) {
      this.itemService.deleteItem(this.item.id).subscribe({
        next: () => {
          this.successMessage = 'Item deleted successfully';
          this.errorMessage = null;
          setTimeout(() => {
            this.router.navigate(['app  /my-profile']);
          }, 1000);
        },
        error: (err) => {
          console.error('Error deleting item:', err);
          this.errorMessage = 'Failed to delete item. Please try again later.';
          this.successMessage = null;  
        }
      });
    }
  } 
}