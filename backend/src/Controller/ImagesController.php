<?php
namespace App\Controller;
use App\Entity\Image;
use App\Entity\Item;
use App\Repository\ItemRepository;
use App\Service\FileUploader;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;


class ImagesController extends AbstractController
{
    private $entityManager;
    private $itemRepository;
    private $fileUploader;
    
    public function __construct(EntityManagerInterface $entityManager, ItemRepository $itemRepository, FileUploader $fileUploader)
    {
        $this->entityManager = $entityManager;
        $this->itemRepository = $itemRepository;
        $this->fileUploader = $fileUploader;
    }
    #[Route('/uploads/{filename}', name: 'serve_upload', methods: ['GET'])]
    public function serveUpload(string $filename): Response
    {
        $path = __DIR__ . '/../../public/uploads/' . $filename;

        if (!file_exists($path)) {
            throw new NotFoundHttpException('Imagen no encontrada');
        }

        return new BinaryFileResponse($path);
    }

    #[Route('/images/{filename}', name: 'serve_image', methods: ['GET'])]
    public function serveImage(string $filename): Response
    {
        $path = __DIR__ . '/../../public/images/' . $filename;

        if (!file_exists($path)) {
            throw new NotFoundHttpException('Imagen no encontrada');
        }

        return new BinaryFileResponse($path);
    }
    // Actualitza les imatges d’un ítem (manté les especificades, elimina les altres i afegeix les noves) (POST)
    #[Route('/api/images/{itemId}', name: 'update_item_images', methods: ['POST'])]
    public function updateItemImages(Request $request,int $itemId,ValidatorInterface $validator): JsonResponse 
        {
            $currentUser = $this->getUser();
            if (!$currentUser) {
                return new JsonResponse(['error' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
            }

            $item = $this->itemRepository->find($itemId);
            if (!$item) {
                return new JsonResponse(['error' => 'Item not found'], Response::HTTP_NOT_FOUND);
            }

            if ($item->getOwner() !== $currentUser) {
                return new JsonResponse(['error' => 'You can only modify images of your own items'], Response::HTTP_FORBIDDEN);
            }

            // Obtenim els IDs de les imatges que s’han de mantenir
            $keepImageIds = $request->request->all('keepImageIds');
            
            if (!is_array($keepImageIds)) {
                $keepImageIds = [];
            }
            
            $keepImageIds = array_map('intval', $keepImageIds);
            
            // Eliminem les imatges que no estan a la llista per mantenir
            $this->deleteUnwantedImages($item, $keepImageIds);

            // Obtenim els arxius d’imatge nous
            $files = $this->getFilesFromRequest($request);
            if (!$files || count($files) === 0) {
                // Si no s'han pujat imatges noves, només retornem les imatges mantingudes
                $keptImages = [];
                foreach ($item->getImages() as $image) {
                    $keptImages[] = [
                        'id' => $image->getId(),
                        'path' => $image->getPath()
                    ];
                }
                
                return new JsonResponse([
                    'message' => 'Images updated successfully',
                    'images' => $keptImages
                ], Response::HTTP_OK);
            }
        return $this->processAndSaveImages($files, $item, $validator);
    }

    // Elimina les imatges que no estan a la llista de mantenir
    private function deleteUnwantedImages(Item $item, array $keepImageIds): void
    {
        $filesystem = new \Symfony\Component\Filesystem\Filesystem();
        foreach ($item->getImages() as $image) {
            if (!in_array($image->getId(), $keepImageIds)) {
                // Elimina el fitxer físic si existeix
                if ($filesystem->exists($image->getPath())) {
                    $filesystem->remove($image->getPath());
                }
                $item->removeImage($image);
                $this->entityManager->remove($image);
            }
        }
        $this->entityManager->flush();
    }

    // Obté els fitxers del formulari HTTP
    private function getFilesFromRequest(Request $request): array
    {
        $fileFields = ['images', 'image', 'images[]', 'files'];
        $files = [];
        
        foreach ($fileFields as $field) {
            $uploadedFiles = $request->files->get($field);
            if ($uploadedFiles) {
                if (is_array($uploadedFiles)) {
                    $files = array_merge($files, $uploadedFiles);
                } else {
                    $files[] = $uploadedFiles;
                }
            }
        }
        
        return $files;
    }


    // Processem i guardem els fitxers d’imatge pujats
    private function processAndSaveImages(array $files, Item $item, ValidatorInterface $validator): JsonResponse
    {
        $uploadedImages = [];
        $errors = [];
        $imagesToFlush = [];

        foreach ($files as $file) {
            if (!$file instanceof UploadedFile) {
                $errors[] = 'Invalid file type';
                continue;
            }
        
            $validationErrors = $validator->validate($file);
            if (count($validationErrors) > 0) {
                $errors[] = $file->getClientOriginalName() . ': Invalid image file';
                continue;
            }
        
            try {
                $imagePath = $this->fileUploader->upload($file);
                $image = new Image();
                $image->setPath($imagePath);
                $image->setItem($item);
                $item->addImage($image);
                $this->entityManager->persist($image);
                $imagesToFlush[] = $image;
            } catch (\Exception $e) {
                $errors[] = $file->getClientOriginalName() . ': ' . $e->getMessage();
            }
        }
        
        $this->entityManager->flush();
        
        foreach ($imagesToFlush as $image) {
            $uploadedImages[] = [
                'id' => $image->getId(),
                'path' => $image->getPath()
            ];
        }

        if (count($uploadedImages) > 0) {
            $response = [
                'message' => count($uploadedImages) . ' image(s) uploaded successfully',
                'images' => $uploadedImages
            ];
            if (count($errors) > 0) {
                $response['errors'] = $errors;
            }
            return new JsonResponse($response, Response::HTTP_CREATED);
        }

        return new JsonResponse([
            'error' => 'Failed to upload any images', 
            'details' => $errors
        ], Response::HTTP_BAD_REQUEST);
    }


    // Elimina totes les imatges d’un ítem
    private function deleteAllItemImages(Item $item): void
    {
        $filesystem = new \Symfony\Component\Filesystem\Filesystem();
        foreach ($item->getImages() as $image) {
            if ($filesystem->exists($image->getPath())) {
                $filesystem->remove($image->getPath());
            }
            $item->removeImage($image);
            $this->entityManager->remove($image);
        }
        $this->entityManager->flush();
    }
}