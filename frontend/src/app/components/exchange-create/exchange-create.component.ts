import { Component, OnInit } from "@angular/core"
import { ExchangeService } from "../../services/exchange/exchange.service"
import { ItemService } from "../../services/item/item.service"
import { Router, ActivatedRoute } from "@angular/router"
import { Item } from "../../models/item.model"
import { FormsModule } from "@angular/forms"
import { CommonModule } from "@angular/common"
import { environment } from "../../../environments/environment"
import { Location } from "@angular/common"

@Component({
  selector: "app-exchange-create",
  imports: [FormsModule, CommonModule],
  templateUrl: "./exchange-create.component.html",
  styleUrls: ["./exchange-create.component.css"],
  standalone: true,
})
export class ExchangeCreateComponent implements OnInit {
  apiUrl = environment.apiUrl // URL de l'API
  requestedItemId = 0 // ID de l'element sol·licitat
  offeredItemId: number | null = null // ID de l'element ofert
  userItems: Item[] = [] // Llista d'articles de l'usuari
  errorMessage = "" // Missatge d'error
  optionalMessage = "" // Missatge opcional per a l'intercanvi
  isLoading = true // Estat de càrrega
  isSubmitting = false // Estat d'enviament
  searchTerm = "" // Paraula clau per a la cerca
  requestedItem: Item | null = null // Article sol·licitat
  showSuccess = false; // Missatge d'exit


  constructor(
    private exchangeService: ExchangeService,
    private itemService: ItemService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
  ) {}

  ngOnInit(): void {
    // Obtenim els paràmetres de la URL (com el requestedItemId)
    this.route.queryParams.subscribe((params) => {
      this.requestedItemId = +params["requestedItemId"] || 0
      if (!this.requestedItemId) {
        this.errorMessage = "No requested item specified."
      } else {
        this.loadRequestedItem()
      }
    })

    this.loadUserItems() // Carregar els articles de l'usuari
  }


  // Carregar l'article sol·licitat
  loadRequestedItem(): void {
    this.itemService.getItem(this.requestedItemId).subscribe({
      next: (item) => {
        this.requestedItem = item
      },
      error: (error) => {
        console.error("Error loading requested item:", error)
      },
    })
  }

  // Carregar els articles de l'usuari
  loadUserItems(): void {
    this.isLoading = true;
  
     this.itemService.getMyItems().subscribe({
      next: (items) => {
         this.exchangeService.getMyExchanges().subscribe({
          next: (exchangesData) => {
            const acceptedItemIds = new Set<number>()
            // Afegir els articles acceptats dels intercanvis enviats i rebuts
             exchangesData.sent
              .filter(exchange => exchange.status === 'accepted')
              .forEach(exchange => acceptedItemIds.add(exchange.offeredItem.id))
  
            exchangesData.received
              .filter(exchange => exchange.status === 'accepted')
              .forEach(exchange => acceptedItemIds.add(exchange.requestedItem.id))
            // Filtrar els articles per mostrar només els que no estan en intercanvi acceptat
             this.userItems = items.filter(item =>
              item.id !== this.requestedItemId &&
              !acceptedItemIds.has(item.id)
            )
  
            this.isLoading = false
          },
          error: (error) => {
            console.error("Error loading exchanges:", error)
            this.errorMessage = "Your exchanges could not be checked. Please try again."
            this.isLoading = false
          },
        })
      },
      error: (error) => {
        console.error("Error loading user items:", error)
        this.errorMessage = "Your items could not be loaded. Please try again."
        this.isLoading = false
      },
    })
  }
  

  get filteredItems(): Item[] {
    if (!this.searchTerm.trim()) {
      return this.userItems
    }

    const term = this.searchTerm.toLowerCase().trim()
    return this.userItems.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term)) ||
        (item.category && item.category.toLowerCase().includes(term)),
    )
  }


  
  // Seleccionar un article per oferir
  selectItem(itemId: number): void {
    this.offeredItemId = itemId
    this.errorMessage = ""   
  }

  // Crear la sol·licitud d'intercanvi
  onCreateExchange(): void {
    // Comprovar si s'ha seleccionat un article per oferir  
    if (!this.offeredItemId) {
      this.errorMessage = "You must select an item to offer."
      return
    }
    // Comprovar si s'ha especificat un article sol·licitat
    if (!this.requestedItemId) {
      this.errorMessage = "No requested item specified."
      return
    }

    this.isSubmitting = true
    this.errorMessage = ""
    // Crear la sol·licitud d'intercanvi
    this.exchangeService.createExchange(this.requestedItemId, this.offeredItemId, this.optionalMessage).subscribe({
      next: (response) => {
        this.isSubmitting = false

         this.showSuccessMessage()

         setTimeout(() => {
          this.router.navigate(["app/my-exchanges"])
        }, 1500)
      },
      error: (err) => {
        console.error("Error creating exchange:", err)
        this.errorMessage = err.error?.error || "An error occurred while creating the exchange."
        this.isSubmitting = false
      },
    })
  }

  // Mostrar el missatge d'èxit quan la sol·licitud s'ha enviat correctament
  showSuccessMessage(): void {
    this.showSuccess = true;
  
    // Opcional: Eliminar el mensaje después de 3 segundos
    setTimeout(() => {
      this.showSuccess = false;
    }, 3000);
  }
  

  // Redirigir a la pàgina per crear un nou article
  redirectToCreateItem(): void {
    this.router.navigate(["app/new-object"])
  }

  // Tornar enrere a la pàgina anterior
  goBack(): void {
    this.location.back()
  }
}