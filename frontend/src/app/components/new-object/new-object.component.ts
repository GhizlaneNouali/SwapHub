import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { Router, ActivatedRoute, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { ItemService } from "../../services/item/item.service";
import { ImageService } from "../../services/image/image.service";
import { categories } from "../../models/categories.model";
import { Subscription } from "rxjs";
import { environment } from "../../../environments/environment";

@Component({
  selector: "app-new-object",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: "./new-object.component.html",
  styleUrls: ["./new-object.component.css"],
})

export class NewObjectComponent implements OnInit, OnDestroy {
  itemForm!: FormGroup;  // Formulari per a l'objecte
  categories: string[] = categories; // Categories disponibles
  isSubmitting = false; // Estat de submissió
  imagePreviews: string[] = []; // Vistes prèvies de les imatges
  formErrors: any = {}; // Errors del formulari
  successMessage: string | null = null; // Missatge d'èxit
  errorMessage: string | null = null; // Missatge d'error
  maxImages = 5; // Nombre màxim d'imatges que es poden pujar
  apiUrl = environment.apiUrl // URL de l'API per a les imatges
  
  isEditMode = false; // Mode d'edició (true si estem editant un element existent)
  itemId: string | null = null; // ID de l'element
  originalImages: any[] = []; // Imatges originals de l'element
  imagesToDelete: string[] = []; // Imatges que s'han de eliminar
  imagesChanged = false; // Si les imatges han canviat
  private subscription = new Subscription(); // Subscricions per a netejar-les en destruir el component

  constructor(
    private fb: FormBuilder,
    private itemService: ItemService,
    private imageService: ImageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.route.params.subscribe(params => {
        if (params['id']) {
          this.isEditMode = true;
          this.itemId = params['id'];
          this.initForm(); 
          if (this.itemId) {
            this.loadItemData(this.itemId);
          }
        } else {
          this.initForm(); 
        }
      })
    );
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  initForm(): void {
    // Inicialitzem el formulari
    this.itemForm = this.fb.group({
      title: ["", [Validators.required, Validators.maxLength(100)]],
      description: ["", [Validators.required, Validators.maxLength(255)]],
      category: ["", Validators.required],
      image: [null, [this.imageValidator()]]
    });
  }
  imageValidator() {
    // Validació per les imatges
    return (control: any) => {
      if (this.imagePreviews.length > 0 || (control.value && control.value.length > 0)) {
        return null; 
      }
      return { required: true }; 
    };
  }
    
  loadItemData(itemId: string): void {
    // Carrega les dades d'un element existent per editar-lo
    this.subscription.add(
      this.itemService.getItem(Number(itemId)).subscribe({
        next: (item) => {
          this.itemForm.patchValue({
            title: item.title,
            description: item.description,
            category: item.category,
          });
          // Carregar imatges originals de l'element
          this.originalImages = item.images;
          this.imagePreviews = item.images.map((img: any) => this.apiUrl + img.path);

        },
        error: (error) => {
          console.error('[loadItemData] Failed to load item:', error);
          this.showErrorToast("Failed to load item data. Please try again.");
          this.router.navigate(["/app/my-profile"]);
        }
      })
    );
  }

  onFileChange(event: any): void {
    // Quan s'afegeixen fitxers (imatges)
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      // Marquem que les imatges han canviat
      this.imagesChanged = true;
    
      // Limitem el nombre d'imatges
      const totalImages = this.imagePreviews.length + files.length;
      if (totalImages > this.maxImages) {
        this.showErrorToast(`You can upload a maximum of ${this.maxImages} images.`);
        return;
      }

      const fileArray: File[] = this.itemForm.get("image")?.value || [];

      Array.from(files).forEach((file: File) => {
        // Validació del tipus d'arxiu
        if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
          this.showErrorToast("Only JPG, PNG and WEBP images are allowed.");
          return;
        }
        // Validació de la mida del fitxer (5MB màxim)
        if (file.size > 5 * 1024 * 1024) {
          this.showErrorToast("Image size should not exceed 5MB.");
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviews.push(reader.result as string);
        };
        reader.readAsDataURL(file);

        fileArray.push(file);
      });

      this.itemForm.patchValue({ image: fileArray });
      this.itemForm.get("image")?.updateValueAndValidity();
    }
  }

  onDrop(event: DragEvent): void {
    // Funció per gestionar l'arrossegament i caiguda de fitxers
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.files) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  handleFiles(files: FileList): void {
    // Funció per gestionar fitxers quan es deixen arrossegats
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.multiple = true;
    fileInput.accept = "image/*";

    const dataTransfer = new DataTransfer();
    Array.from(files).forEach((file) => dataTransfer.items.add(file));
    fileInput.files = dataTransfer.files;

    const event = { target: fileInput };
    this.onFileChange(event);
  }

  removeImage(index: number): void {
    // Elimina una imatge del formulari
    
    this.imagesChanged = true;
    
    if (this.isEditMode && index < this.originalImages.length) {
      const imageToDelete = this.originalImages[index];
      
      if (typeof imageToDelete === 'string') {
        this.imagesToDelete.push(imageToDelete);
      } else if (imageToDelete && imageToDelete.id) {
        this.imagesToDelete.push(imageToDelete.id);
      } else if (imageToDelete && imageToDelete.path) {
        this.imagesToDelete.push(imageToDelete.path);
      }
      
      this.originalImages.splice(index, 1);
    }
    
    const files = this.itemForm.get("image")?.value;
    let fileArray: File[] = Array.isArray(files) ? files : (files ? [files] : []);
    
    if (this.isEditMode) {
      const newFilesStartIndex = this.originalImages.length;
      
      if (index >= newFilesStartIndex) {
        const newFileIndex = index - newFilesStartIndex;
        
        if (newFileIndex >= 0 && newFileIndex < fileArray.length) {
          fileArray.splice(newFileIndex, 1);
        }
      }
    } else {
      fileArray.splice(index, 1);
    }
    
    this.imagePreviews.splice(index, 1);
  
    if (fileArray.length === 0 && !this.isEditMode) {
      this.itemForm.patchValue({ image: null });
    } else {
      this.itemForm.patchValue({ image: fileArray.length > 0 ? fileArray : null });
    }
    
    this.itemForm.get("image")?.updateValueAndValidity();

  }

  resetForm(): void {
    // Funció per reiniciar el formulari
    this.itemForm.reset();
    this.imagePreviews = [];
    this.successMessage = null;
    this.errorMessage = null;
    this.imagesChanged = false;
    
    if (this.isEditMode) {
      this.loadItemData(this.itemId!);
    } else {
      this.initForm();
    }
  }
  
  getFormProgress(): number {
    // Calcula el progrés del formulari en percentatge
    let filledFields = 0;
    const totalFields = 4; 

    if (this.itemForm.get("title")?.valid && this.itemForm.get("title")?.value) filledFields++;
    if (this.itemForm.get("description")?.valid && this.itemForm.get("description")?.value) filledFields++;
    if (this.itemForm.get("category")?.valid && this.itemForm.get("category")?.value) filledFields++;
    
    if (this.imagePreviews.length > 0) filledFields++;

    return (filledFields / totalFields) * 100;
  }

  onSubmit(): void {
    // S'executa quan es fa la submissió del formulari
    this.markFormGroupTouched(this.itemForm);
  
    if (this.isEditMode) {
      const title = this.itemForm.get("title")?.value;
      const description = this.itemForm.get("description")?.value;
      const category = this.itemForm.get("category")?.value;
      
      if (!title || !description || !category) {
        this.showErrorToast("Please fill all required fields.");
        return;
      }
      
      if (this.imagePreviews.length === 0 && (!this.originalImages || this.originalImages.length === 0)) {
        this.showErrorToast("At least one image is required.");
        return;
      }
    } 
    else if (this.itemForm.invalid) {
      this.showErrorToast("Please fill all required fields.");
      return;
    }

  
    this.isSubmitting = true;
  
    if (this.isEditMode) {
      this.updateItem();
    } else {
      this.createNewItem();
    }
  }

  private updateItem(): void {
    // Actualitza l'element existent amb les noves dades
    const formData = new FormData();
    formData.append("title", this.itemForm.get("title")?.value);
    formData.append("description", this.itemForm.get("description")?.value);
    formData.append("category", this.itemForm.get("category")?.value);
  
    const newImages = this.itemForm.get("image")?.value as File[];
    if (newImages && newImages.length > 0) {
      newImages.forEach((img) => {
        formData.append("images[]", img);
      });
    }
    // Enviem la sol·licitud per actualitzar l'element
    this.subscription.add(
      this.itemService.updateItem(this.itemId!, formData).subscribe({
        next: (response) => {
          
          if (this.imagesChanged || newImages?.length > 0) {
            this.updateItemImages();
          } else {
            this.handleSubmitSuccess("Item updated successfully!");
          }
        },
        error: (error) => {
          console.error("Update error:", error);
          this.handleSubmitError(error, "Failed to update item. Please try again.");
        }
      })
    );
  }
  
  private updateItemImages(): void {
    // Actualitza les imatges de l'element
    if (!this.itemId) return;
    
    const formData = new FormData();
    const images = this.itemForm.get("image")?.value as File[];
    
    if (images && images.length > 0) {
      images.forEach((img) => {
        formData.append("images[]", img);
      });
    }
    
    if (this.originalImages.length > 0) {
      this.originalImages.forEach((img, index) => {
        if (img.id) {
          formData.append(`keepImageIds[]`, img.id.toString());
        }
      });
    }
    
    this.subscription.add(
      this.imageService.updateImages(this.itemId!, formData).subscribe({
        next: (response) => {
          this.handleSubmitSuccess("Item and images updated successfully!");
        },
        error: (error) => {
          console.error("Error updating images:", error);
          this.handleSubmitError(error, "Failed to update images. Please try again.");
        }
      })
    );
  }

  private createNewItem(): void {
    // Crea un element nou
    const formData = new FormData();
    formData.append("title", this.itemForm.get("title")?.value);
    formData.append("description", this.itemForm.get("description")?.value);
    formData.append("category", this.itemForm.get("category")?.value);

    const images = this.itemForm.get("image")?.value as File[];
    if (images && images.length > 0) {
      images.forEach((img, index) => {
        formData.append(`images[${index}]`, img);
      });
    }

    this.subscription.add(
      this.itemService.createItem(formData).subscribe({
        next: (response) => {
          this.handleSubmitSuccess("Item created successfully!");
        },
        error: (error) => {
          this.handleSubmitError(error, "Failed to create item. Please try again.");
        }
      })
    );
  }  

  private handleSubmitSuccess(message: string): void {
    // Gestió del missatge d'èxit
    this.isSubmitting = false;
    this.showSuccessToast(message);
    setTimeout(() => {
      this.router.navigate(["app/my-profile"]);
    }, 2000);
  }

  private handleSubmitError(error: any, defaultMessage: string): void {
    // Gestió del missatge d'error
    this.isSubmitting = false;
    if (error.error?.errors) {
      this.formErrors = error.error.errors;
      this.showErrorToast("Please check the form for errors.");
    } else {
      this.showErrorToast(defaultMessage);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    // Marca tots els camps del formulari com a tocats
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private showSuccessToast(message: string): void {
    // Mostra un missatge d'èxit
    this.successMessage = message;
    this.errorMessage = null;
  }

  private showErrorToast(message: string): void {
    // Mostra un missatge d'error
    this.errorMessage = message;
    this.successMessage = null;
  }
}