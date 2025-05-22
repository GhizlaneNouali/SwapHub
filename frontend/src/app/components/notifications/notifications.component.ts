import { Component, OnInit } from "@angular/core"
import { NotificationService } from "../../services/notification/notification.service"
import { CommonModule } from "@angular/common"
import { Notification } from "../../models/notification.model"
import { RouterModule } from "@angular/router"

@Component({
  selector: "app-notifications",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./notifications.component.html",
  styleUrls: ["./notifications.component.css"],
})
export class NotificationsComponent implements OnInit {
  // Llista de notificacions que es mostrarà a la vista
  notifications: Notification[] = []
  isLoading = true
  error: string | null = null

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications()
  }

  // Funció per carregar les notificacions
  loadNotifications(): void {
    this.isLoading = true
    this.error = null

    // Cridem al servei per obtenir les notificacions
    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data
        this.isLoading = false
      },
      error: (err) => {
        console.error("Error loading notifications:", err)
        this.error = "Failed to load notifications. Please try again."
        this.isLoading = false
      },
    })
  }
  // Funció per obtenir el títol de la notificació en funció del seu missatge
  getNotificationTitle(message: string): string {
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes("exchange") && lowerMessage.includes("accepted")) {
      return "Exchange Accepted"
    } else if (lowerMessage.includes("exchange") && lowerMessage.includes("rejected")) {
      return "Exchange Rejected"
    } else if (lowerMessage.includes("exchange") && lowerMessage.includes("new")) {
      return "New Exchange Request"
    } else {
      return "Notification"
    }
  }
}
