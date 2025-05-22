import { User } from "./user.model";
import { Image } from "./image.model";

// Representa un ítem que pot ser intercanviat entre usuaris
export interface Item {
  id: number; // Identificador únic de l'ítem
  title: string; // Títol descriptiu de l'ítem
  description: string; // Descripció detallada de l'ítem
  category: string; // Categoria a la qual pertany l'ítem
  owner: User | null; // Propietari de l'ítem, pot ser nul si no està assignat
  images: Image[]; // Llista d’imatges associades a l'ítem
}