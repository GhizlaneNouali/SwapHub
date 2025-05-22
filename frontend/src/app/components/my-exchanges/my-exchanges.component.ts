import { Component, OnInit } from "@angular/core"
import { ExchangeService } from "../../services/exchange/exchange.service"
import { Exchange } from "../../models/exchange.model"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { environment } from "../../../environments/environment"

@Component({
  selector: "app-my-exchanges",
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: "./my-exchanges.component.html",
  styleUrls: ["./my-exchanges.component.css"],
})
export class MyExchangesComponent implements OnInit {
  sentExchanges: Exchange[] = [] // Llista d'intercanvis enviats
  receivedExchanges: Exchange[] = [] // Llista d'intercanvis rebuts
  isLoading = true // Estat de càrrega
  errorMessage = "" // Missatge d'error si es produeix algun error
  activeTab = "received" // Pestaña activa (per defecte la de rebuts)
  isProcessing = false // Estat per evitar múltiples processos simultanis
  apiUrl = environment.apiUrl // URL de l'API

  constructor(private exchangeService: ExchangeService) {}

  ngOnInit(): void {
    this.loadExchanges() // Carregar els intercanvis quan el component es carrega
    
  }
  // Funció per carregar els intercanvis
  loadExchanges(): void {
    this.isLoading = true
    this.errorMessage = ""
    // Crida al servei per obtenir els intercanvis
    this.exchangeService.getMyExchanges().subscribe({
      next: (data) => {
        // Assignar les dades als arrays d'intercanvis enviats i rebuts
        this.sentExchanges = data.sent
        this.receivedExchanges = data.received
        this.isLoading = false
      },
      error: (err) => {
        console.error("Error loading exchanges:", err)
        this.errorMessage = "Failed to load exchanges. Please try again."
        this.isLoading = false
      },
    })
  }
  // Funció per acceptar un intercanvi
  acceptExchange(id: number): void {
    if (this.isProcessing) return
    this.isProcessing = true
    // Crida al servei per acceptar l'intercanvi
    this.exchangeService.acceptExchange(id).subscribe({
      next: () => {
        this.loadExchanges()
        this.isProcessing = false
        this.showToast("Exchange accepted successfully!", "success")
      },
      error: (err) => {
        console.error("Error accepting exchange:", err)
        this.isProcessing = false
        this.showToast("Failed to accept exchange. Please try again.", "error")
      },
    })
  }

    // Funció per rebutjar un intercanvi
  rejectExchange(id: number): void {
    if (this.isProcessing) return

    this.isProcessing = true
    // Crida al servei per rebutjar l'intercanvi
    this.exchangeService.rejectExchange(id).subscribe({
      next: () => {
        this.loadExchanges()
        this.isProcessing = false
        this.showToast("Exchange rejected", "info")
      },
      error: (err) => {
        console.error("Error rejecting exchange:", err)
        this.isProcessing = false
        this.showToast("Failed to reject exchange. Please try again.", "error")
      },
    })
  }

    // Funció per mostrar el missatge de toast
  showToast(message: string, type: "success" | "error" | "info" | "warning"): void {
    const toast = document.createElement("div")
    toast.className = `alert alert-${type} fixed bottom-4 right-4 w-auto max-w-sm shadow-lg z-50 animate-fadeIn`

    let icon = ""
    switch (type) {
      case "success":
        icon = `<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
        break
      case "error":
        icon = `<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
        break
      case "info":
        icon = `<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
        break
      case "warning":
        icon = `<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`
        break
    }
    // Afegir el contingut al toast
    toast.innerHTML = `
      <div class="flex items-center gap-2">
        ${icon}
        <span>${message}</span>
      </div>
    `
    // Afegir el toast al cos del document
    document.body.appendChild(toast)
    // Eliminar el toast després de 3 segon
    setTimeout(() => {
      toast.classList.add("opacity-0")
      setTimeout(() => toast.remove(), 300)
    }, 3000)
  }
}