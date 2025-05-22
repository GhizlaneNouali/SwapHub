import { Component, OnInit } from '@angular/core';
import { Item } from '../../models/item.model';
import { ItemService } from '../../services/item/item.service';
import { environment } from '../../../environments/environment';
import { categories } from '../../models/categories.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardComponent } from '../card/card.component';
import { ProfileService } from '../../services/profile/profile.service';


@Component({
  selector: 'app-private-home',
  imports: [CommonModule, FormsModule, CardComponent],
  templateUrl: './private-home.component.html',
  styleUrls: ['./private-home.component.css']
})
export class PrivateHomeComponent implements OnInit {

  items: Item[] = []; // Llista d'items
  isLoading = true; // estat de càrrega
  error: string | null = null;  // missatge d'error
  apiUrl = environment.apiUrl; // url de l'api
  searchTerm = '';
  selectedCategory = '';
  categories = categories; // categories disponibles
  sortOption = '';
  featuredItems: Item[] = [];
  isGridView = true;
  userName: string = '';
  profileImage: string = '';


  constructor(private itemService: ItemService, 
    private Router: Router, 
    private profileService: ProfileService,) { }

  ngOnInit(): void {
    this.loadItems();
    this.loadUser();
  }

  // Carrega la llista d'ítems des del servei
  loadItems(): void {
    this.itemService.getItems().subscribe({
      next: (data) => {
        this.items = data;
        this.isLoading = false;
      },
      error: () => {
        this.error = "Failed to load items";
        this.isLoading = false;
      }
    });
  }

  // Neteja tots els filtres aplicats
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.sortOption = '';
  }

  // Activa la vista en graella
  toggleGridView(): void {
    this.isGridView = true;
  }

  // Activa la vista en llista
  toggleListView(): void {
    this.isGridView = false;
  }

  // Retorna la llista d'ítems ordenats segons l'opció seleccionada
  get sortedItems(): Item[] {
    const items = this.filteredItems;

    switch (this.sortOption) {
      case 'titleAsc':
        return [...items].sort((a, b) => a.title.localeCompare(b.title));
      default:
        return items;
    }
  }

  // Retorna els ítems filtrats per cerca i categoria
  get filteredItems(): Item[] {
    return this.items.filter(item =>
      (item.title.toLowerCase().includes(this.searchTerm.toLowerCase()) || item.description.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
      (!this.selectedCategory || item.category === this.selectedCategory)
    );
  }

  // Navega a la pàgina de detall de l'ítem seleccionat
  viewItemDetail(itemId: number): void {
    this.Router.navigate(['app/item-detail/', itemId], {queryParams: {mode: 'exchange'}}); 
  }

  // Carrega el perfil de l'usuari actual
  loadUser(): void{
    this.profileService.getUserProfile().subscribe({
      next: (data) => {
        this.userName = data.name; 
        this.profileImage = data.profileImage; 
      },
      error: () => {
        console.log("Error fetching user profile")
      }
    });
  }

}