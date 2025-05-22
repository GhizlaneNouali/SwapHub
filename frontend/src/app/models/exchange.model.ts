import { User } from "./user.model";
import { Item } from "./item.model";

// Representa un intercanvi entre dos usuaris
export interface Exchange {
    id: number; // Identificador únic de l'intercanvi
    requester: User; // Usuari que sol·licita l'intercanvi
    owner: User; // Propietari de l'ítem sol·licitat
    requestedItem: Item; // Ítem que el sol·licitant vol obtenir
    offeredItem: Item; // Ítem que ofereix a canvi
    message?: string; // Missatge opcional del sol·licitant
    status: 'pending' | 'accepted' | 'rejected'; // Estat actual de l'intercanvi
    createAt: string; // Data de creació de l'intercanvi
}