import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../services/profile/profile.service';
import { CommonModule } from '@angular/common';
import { ItemService } from '../../services/item/item.service';
import { Item } from '../../models/item.model';
import { CardComponent } from '../card/card.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { ExchangeService } from '../../services/exchange/exchange.service';
import { map } from 'rxjs';
import { switchMap } from 'rxjs';



@Component({
  selector: 'app-my-profile',
  imports: [CommonModule, CardComponent, RouterModule,ReactiveFormsModule],
  standalone: true,
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {
  user: any;
  items: Item[] = [];
  editMode = false; // Mode d'edició activat o no
  viewType: 'grid' | 'list' = 'grid'; // Tipus de vista de les meves coses: quadrícula o llista
  profileForm: FormGroup;
  isLoading = true; // Variable per indicar si s'està carregant el perfil
  updateSuccess = false; // Indica si l'actualització ha sigut exitosa
  successMessage: string | null = null; // Missatge d'èxit de l'actualització
  updateError: string | null = null; // Missatge d'error si l'actualització falla
  selectedFile: File | null = null; // Fitxer d'imatge seleccionat per actualitzar el perfil
  imagePreview: string | null = null; // Vista prèvia de la imatge seleccionada
  acceptedExchangesCount: number = 0; // Comptador d'intercanvis acceptats
  apiUrl = environment.apiUrl; // URL de l'API

  constructor(
    private itemService: ItemService,
    private router: Router,
    private fb: FormBuilder,
    private profileService: ProfileService,
    private exchangeService: ExchangeService
    
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      surnames: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadMyItems();
    this.checkSuccessMessage();
    this.loadAcceptedExchangeCount();

  }

  checkSuccessMessage(): void {
    // Comprova si hi ha un paràmetre d'èxit a l'URL i mostra el missatge
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('success')) {
      this.successMessage = urlParams.get('success'); 
    }
  }


  loadUserProfile(): void {
    this.isLoading = true;
    this.profileService.getUserProfile().subscribe({
      next: (data) => {
        this.user = data;
        this.profileForm.patchValue({
          name: data.name,
          surnames: data.surnames
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.updateError = 'Failed to load user profile';
        this.isLoading = false;
      }
    });
  }


  onFileSelected(event: Event): void {
    // Quan l'usuari selecciona un fitxer per a la imatge de perfil
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
      
      // Crear una vista prèvia de la imatge seleccionada
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit(): void {
    // Enviar el formulari per actualitzar el perfil
    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid) {
      return;
    }
    
    this.updateSuccess = false;
    this.updateError = null;
    let updatesMade = false;
    
    // Actualitzar el text (nom i cognoms) si hi ha canvis
    const formValues = this.profileForm.value;
    if (formValues.name !== this.user.name || formValues.surnames !== this.user.surnames) {
      this.updateTextProfile(formValues);
      updatesMade = true;
    }
    
    // Actualitzar la imatge si hi ha una imatge seleccionada
    if (this.selectedFile) {
      this.updateProfileImage();
      updatesMade = true;
    }
  
    // Si no s'ha fet cap canvi, mostra un missatge d'èxit automàtic
    if (!updatesMade) {
      this.updateSuccess = true; 
    }
  }

  updateTextProfile(userData: any): void {
    // Actualitza la informació del perfil (nom i cognoms)
    this.isLoading = true;
    this.profileService.updateUserProfile(userData).subscribe({
      next: (data) => {
        this.user = data;
        this.updateSuccess = true;
        this.isLoading = false;
        this.successMessage = "Profile updated successfully."; 

        setTimeout(() => {
          this.router.navigate(['/app/']);
        }, 1000);
        
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.updateError = 'Failed to update profile information';
        this.isLoading = false;
      }
    });
  }

  updateProfileImage(): void {
    // Actualitza la imatge de perfil
    if (!this.selectedFile) return;
    
    this.isLoading = true;
    this.profileService.updateProfileImage(this.selectedFile).subscribe({
      next: (response) => {
        this.user.profileImage = response.path;
        this.updateSuccess = true;
        this.isLoading = false;
        this.selectedFile = null;
        this.successMessage = "Profile updated successfully."; 
        this.profileService.setProfileImage(response.path);
        this.router.navigate(['app/']);


      },
      error: (error) => {
        console.error('Error updating profile image:', error);
        this.updateError = 'Failed to update profile image';
        this.isLoading = false;
      }
    });
  }

  loadMyItems(): void {
    // Carrega els meus objectes i els filtra per mostrar només els objectes que no estan en intercanvis acceptats
    this.exchangeService.getMyExchanges().pipe(
      map(({ sent, received }) => {
        const acceptedSentItems = sent.filter(exchange => exchange.status === 'accepted').map(exchange => exchange.offeredItem.id);
        const acceptedReceivedItems = received.filter(exchange => exchange.status === 'accepted').map(exchange => exchange.requestedItem.id);
    
        return [...acceptedSentItems, ...acceptedReceivedItems];
      }),
      switchMap((acceptedItemIds: number[]) => {
        return this.itemService.getMyItems().pipe(
          map((myItems: Item[]) => {
            return myItems.filter(item => !acceptedItemIds.includes(item.id));
          })
        );
      })
    ).subscribe({
      next: (filteredItems: Item[]) => {
        this.items = filteredItems;
      },
      error: () => console.error('Error loading items'),
    });
  }
  
  viewItemDetail(itemId: number): void{
      // Redirigeix a la pàgina de detall d'un objecte
    this.router.navigate(['app/item-detail/', itemId], {queryParams: {mode: 'my-object'}})
  }

  loadAcceptedExchangeCount(): void {
    // Carrega el nombre d'intercanvis acceptats (tant enviats com rebuts)
    this.exchangeService.getMyExchanges().pipe(
      map(({ sent, received }) => {
        const acceptedSent = sent.filter(exchange => exchange.status === 'accepted').length;
        const acceptedReceived = received.filter(exchange => exchange.status === 'accepted').length;
        return acceptedSent + acceptedReceived;
      })
    ).subscribe(count => {
      this.acceptedExchangesCount = count;
    });
  }
  
  
}