// Representa un usuari registrat a l'aplicació
export interface User {
    id: number; // Identificador únic de l’usuari
    name: string; // Nom de l’usuari
    surnames: string; // Cognoms de l’usuari
    email: string; // Correu electrònic de l’usuari
    profileImage: string | null; // Imatge de perfil, pot ser nul·la si no n'hi ha
  }
  