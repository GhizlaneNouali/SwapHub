// Representa una notificació per a l’usuari
export interface Notification {
    id: number; // Identificador únic de la notificació
    message: string; // Missatge de la notificació
    createdAt: string; // Data i hora de creació
    isRead: boolean; // Indica si l’usuari ja ha llegit la notificació
}