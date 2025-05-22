<?php

namespace App\Controller;

use App\Entity\Item;
use App\Entity\User;
use App\Form\ItemType;
use App\Repository\ItemRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use App\Entity\Image;
use App\Service\FileUploader;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/item')]
final class ItemController extends AbstractController
{
    private FileUploader $fileUploader;
    private $imagesController;
    private $validator;

    public function __construct(FileUploader $fileUploader, ImagesController $imagesController, ValidatorInterface $validator)
    {
        $this->fileUploader = $fileUploader;
        $this->imagesController = $imagesController;
        $this->validator = $validator;
    }

    // Ruta per obtenir els elements disponibles per a l'usuari (GET)
    #[Route(name: 'items', methods: ['GET'])]
    public function items(ItemRepository $itemRepository): JsonResponse
    {
        $currentUser = $this->getUser();
    
        if (!$currentUser) {
            return $this->json(['error' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
        }
        
        // Obtenir els ítems disponibles per a l'usuari actual
        $items = $itemRepository->findAvailableItemsForUser($currentUser);
        $result = [];
    
        foreach ($items as $item) {
            $result[] = $this->normalizeItem($item);
        }
    
        return $this->json($result);
    }

    // Ruta per crear un nou element (POST)
    #[Route('/new', name: 'app_item_new', methods: ['POST'])]
    public function new(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $owner = $this->getUser();
        if (!$owner) {
            return $this->json(['error' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
        }
        
        // Obtenir les dades del formulari
        $data = $request->request->all();
        $item = new Item();
        
        // Assignar els valors del formulari a l'objecte ItemC
        $item->setTitle(ucfirst(strtolower($data['title'] ?? '')));
        $item->setDescription(ucfirst(strtolower($data['description'] ?? '')));
        $item->setCategory($data['category'] ?? '');
        
        // Assignar el propietari de l'element
        $item->setOwner($owner);
        
        $entityManager->persist($item);
        $entityManager->flush();
        
        // Processar les imatges si existeixen
        $uploadedImages = $this->processUploadedImages($request, $item, $entityManager);
        
        return $this->json([
            'id' => $item->getId(),
            'title' => $item->getTitle(),
            'message' => 'Item created successfully',
            'images' => $uploadedImages
        ], Response::HTTP_CREATED);
    }

    // Ruta per obtenir ítems per categoria (GET)
    #[Route('/related', name: 'related_items', methods: ['GET'])]
    public function relatedItems(Request $request, ItemRepository $itemRepository): JsonResponse {
        $category = $request->query->get('category');
        $excludeId = $request->query->get('excludeId');
        $currentUser = $this->getUser();

        if (!$category) {
            return $this->json(['error' => 'Category is required'], Response::HTTP_BAD_REQUEST);
        }

        // Obtenir els ítems per categoria, excloent l'ID passat
        $items = $itemRepository->findByCategoryExcludingId($category, $excludeId);

        $result = [];
        foreach ($items as $item) {
            $owner = $item->getOwner();
            if ($owner && $owner->getId() !== $currentUser->getId()) {
                $result[] = $this->normalizeItem($item);
            }
        }

        return $this->json($result);
    }

    // Ruta per obtenir els ítems de l'usuari actual (GET)
    #[Route('/my-items', name: 'my_items', methods: ['GET'])]
    public function myItems(ItemRepository $itemRepository): JsonResponse
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        // Obtenir tots els ítems de l'usuari actual
        $items = $itemRepository->findBy(['owner' => $user]);
        $result = [];

        foreach ($items as $item) {
            $result[] = $this->normalizeItem($item, true); 
        }

        return $this->json($result);
    }

    // Ruta per obtenir un ítem per ID (GET)
    #[Route('/{id}', name: 'app_item_show', methods: ['GET'])]
    public function show(Item $item): JsonResponse
    {
        return $this->json($this->normalizeItem($item));
    }

    // Ruta per editar un ítem (POST)
    #[Route('/{id}', name: 'app_item_edit', methods: ['POST'])]
    public function edit(Request $request, Item $item, EntityManagerInterface $entityManager): JsonResponse
    {
        $currentUser = $this->getUser();
        
        if (!$currentUser) {
            return $this->json(['error' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        // Comprovar que l'usuari actual és el propietari de l'ítem
        if ($item->getOwner()->getId() !== $currentUser->getId()) {
            return $this->json(['error' => 'You are not authorized to edit this item'], Response::HTTP_FORBIDDEN);
        }

        // Obtenir les dades del formulari per actualitzar l'ítem
        $title = $request->request->get('title');
        $description = $request->request->get('description');
        $category = $request->request->get('category');

        // Actualitzar els camps de l'ítem
        if ($title) {
            $item->setTitle(ucwords(strtolower($title)));
        }

        if ($description) {
            $item->setDescription(ucfirst(strtolower($description)));
        }

        if ($category) {
            $item->setCategory($category);
        }

        $entityManager->flush();

        return $this->json([
            'id' => $item->getId(),
            'title' => $item->getTitle(),
            'description' => $item->getDescription(),
            'category' => $item->getCategory(),
            'message' => 'Item updated successfully'
        ]);
    }

    // Ruta per eliminar un ítem (DELETE)
    #[Route('/{id}', name: 'app_item_delete', methods: ['DELETE'])]
    public function delete(Item $item, EntityManagerInterface $entityManager): JsonResponse
    {
        $currentUser = $this->getUser();

        if (!$currentUser) {
            return $this->json(['error' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
        }
        
        // Comprovar que l'usuari actual és el propietari de l'ítem
        if ($item->getOwner()->getId() !== $currentUser->getId()) {
            return $this->json(['error' => 'You are not authorized to delete this item'], Response::HTTP_FORBIDDEN);
        }

        // Eliminar les imatges associades
        $this->deleteImages($item, $entityManager);

        // Eliminar l'ítem de la base de dades
        $entityManager->remove($item);
        $entityManager->flush();

        return $this->json(['message' => 'Item deleted successfully']);
    }
   
    // Funció per eliminar les imatges associades a un ítem
    private function deleteImages(Item $item, EntityManagerInterface $entityManager): void
    {
        foreach ($item->getImages() as $image) {
            // Eliminar el fitxer físic
            $filePath = $this->getParameter('images_directory') . '/' . basename($image->getPath());
            if (file_exists($filePath)) {
                unlink($filePath);
            }
            // Eliminar la imatge de la base de dades
            $entityManager->remove($image);
        }

        $entityManager->flush();
    }

    // Funció per processar les imatges pujanades i associar-les a un ítem
    private function processUploadedImages(Request $request, Item $item, EntityManagerInterface $entityManager): array
    {
        $uploadedImages = [];
        $files = $request->files->get('images');
        
        if ($files) {
            foreach ($files as $uploadedFile) {
                if ($uploadedFile instanceof UploadedFile) {
                    // Pujar el fitxer
                    $newFilename = $this->fileUploader->upload($uploadedFile);
                    // Crear una nova entitat d'Imatge
                    $image = new Image();
                    $image->setPath($newFilename);
                    $image->setItem($item);
                    
                    $item->addImage($image);
                    $entityManager->persist($image);
                    
                    $uploadedImages[] = [
                        'id' => $image->getId(),
                        'path' => $image->getPath()
                    ];
                }
            }
            $entityManager->flush();
        }
        
        return $uploadedImages;
    }

    // Funció per normalitzar un objecte Item per a la resposta JSON
    private function normalizeItem(Item $item, bool $includeOwner = true): array
    {
        $itemData = [
            'id' => $item->getId(),
            'title' => $item->getTitle(),
            'description' => $item->getDescription(),
            'category' => $item->getCategory(),
            'owner' => null,
            'images' => $this->normalizeImages($item->getImages())
        ];
    
        if ($includeOwner) {
            $owner = $item->getOwner();
            if ($owner) {
                $itemData['owner'] = $this->normalizeOwner($owner);
            }
        }
    
        return $itemData;
    }

    // Funció per normalitzar un objecte User per a la resposta JSON
    private function normalizeOwner($owner): array
    {
        $mainImage = $owner->getMainProfileImage(); 
        $profileImagePath = $mainImage ? $mainImage->getPath() : null;
        
        return [
            'id' => $owner->getId(),
            'name' => $owner->getName(),
            'surnames' => $owner->getSurnames(),
            'email' => $owner->getUserIdentifier(),
            'profileImage' => $profileImagePath,
        ];
    }

    // Funció per normalitzar una col·lecció d'imatges per a la resposta JSON
    private function normalizeImages($images): array
    {
        $result = [];
        foreach ($images as $image) {
            $result[] = [
                'id' => $image->getId(),
                'path' => $image->getPath()
            ];
        }
        return $result;
    }   
}