<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\Image;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\UploadedFile; 
use Symfony\Component\Validator\Validator\ValidatorInterface; 
use App\Service\FileUploader; 



#[Route('/api/profile')]
class UserController extends AbstractController
{

    private EntityManagerInterface $entityManager;
    private FileUploader $fileUploader;

    public function __construct(EntityManagerInterface $entityManager, FileUploader $fileUploader)
    {
        $this->entityManager = $entityManager;
        $this->fileUploader = $fileUploader;
    }


    // Ruta per obtenir el perfil de l'usuari (GET)
    #[Route('/my-profile', name: 'get_my_profile', methods: ['GET'])]
    public function getProfile(SerializerInterface $serializer): JsonResponse
    {
        // Obtenir l'usuari actual
        $user = $this->getUser();
    
        // Obtenir la ruta de la imatge principal del perfil
        $mainImage = $user->getMainProfileImage();
        $imagePath = $mainImage ? $mainImage->getPath() : null;
        
        // Retorna les dades del usuari
        $data = [
            'id' => $user->getId(),
            'name' => $user->getName(),
            'surnames' => $user->getSurnames(),
            'email' => $user->getEmail(),
            'profileImage' => $imagePath,
        ];

        return new JsonResponse($data, Response::HTTP_OK);
    }

    // Ruta per actualitzar les dades del perfil de l'usuari (PUT)
    #[Route('/my-profile', name: 'update_my_profile', methods: ['PUT'])]
    public function updateProfile(
        Request $request,
        EntityManagerInterface $em
        ): JsonResponse {

        // Obtenir l'usuari actual
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        // Actualitzar el nom i els cognoms si estan presents a la petició
        if (isset($data['name'])) {
            $user->setName(ucwords(strtolower($data['name'])));
        }

        if (isset($data['surnames'])) {
            $user->setSurnames(ucwords(strtolower($data['surnames'])));
        }

        $em->flush();

        $mainImage = $user->getMainProfileImage();
        $imagePath = $mainImage ? $mainImage->getPath() : null;

        $responseData = [
            'id' => $user->getId(),
            'name' => $user->getName(),
            'surnames' => $user->getSurnames(),
            'email' => $user->getEmail(),
            'profileImage' => $imagePath,
        ];

        return new JsonResponse($responseData, Response::HTTP_OK);
    }

    // Ruta per actualitzar la imatge de perfil (POST)
    #[Route('/image', name: 'update_profile_image', methods: ['POST'])]
    public function updateProfileImage(
        Request $request,
        ValidatorInterface $validator
        ): JsonResponse {

        // Obtenir l'usuari actual
        $currentUser = $this->getUser();
        if (!$currentUser) {
            return new JsonResponse(['error' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
        }
        
        // Verificar que s'ha enviat una imatge
        $file = $request->files->get('image');
        if (!$file instanceof UploadedFile) {
            return new JsonResponse(['error' => 'No image file provided'], Response::HTTP_BAD_REQUEST);
        }
        
        $errors = $validator->validate($file);
        if (count($errors) > 0) {
            return new JsonResponse(['error' => 'Invalid image file'], Response::HTTP_BAD_REQUEST);
        }
        
        try {

            // Obtenir la imatge principal actual
            $currentMainImage = $currentUser->getMainProfileImage();
            
            // Pujar la nova imatge
            $imagePath = $this->fileUploader->upload($file);
            
            // Si ja existeix una imatge principal, eliminar-la
            if ($currentMainImage) {
                $filesystem = new Filesystem();
                if ($filesystem->exists($currentMainImage->getPath())) {
                    $filesystem->remove($currentMainImage->getPath());
                }
                
                // Eliminar la imatge de la col·lecció de l'usuari
                $currentUser->removeProfileImage($currentMainImage);
                
                // Eliminar la imatge de la base de dades
                $this->entityManager->remove($currentMainImage);
            }
            
            // Crear una nova entitat per a la nova imatge
            $newImage = new Image();
            $newImage->setPath($imagePath);
            $newImage->setIsProfileMain(true);
            
            // Associar la nova imatge amb l'usuari
            $currentUser->addProfileImage($newImage);
            
            $this->entityManager->persist($newImage);
            $this->entityManager->flush();
            
            return new JsonResponse([
                'message' => 'Profile image updated successfully',
                'imageId' => $newImage->getId(),
                'path' => $newImage->getPath()
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Failed to update profile image: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}

