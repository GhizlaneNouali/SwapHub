<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\Image;   
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Filesystem\Filesystem;




class RegistrationController extends AbstractController
{

    // Ruta per a registrar un nou usuari (POST)
    #[Route('/api/register', name: 'app_register', methods: ['POST'])]
    public function register(
        Request $request,
        UserPasswordHasherInterface $userPasswordHasher,
        Security $security,
        EntityManagerInterface $entityManager
        ): JsonResponse {
        if ($request->headers->get('Content-Type') !== 'application/json') {
            return new JsonResponse(['error' => 'Content-Type must be application/json'], Response::HTTP_BAD_REQUEST);
        }

        // Decodificar el cos de la petició JSON
        $data = json_decode($request->getContent(), true);
        if (!$data) {
            return new JsonResponse(['error' => 'Invalid JSON format'], Response::HTTP_BAD_REQUEST);
        }

        // Comprovar que l'email i la contrasenya estiguin presents a la petició
        if (empty($data['email']) || empty($data['password']) ) {
            return new JsonResponse(['error' => 'Email, and password are required'], Response::HTTP_BAD_REQUEST);
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse(['error' => 'Invalid email format'], Response::HTTP_BAD_REQUEST);
        }

        // Comprovar si l'email ja està en ús per un altre usuari
        $existingUser = $entityManager->getRepository(User::class)->findOneBy(['email' => $data['email']]);
        if ($existingUser) {
            return new JsonResponse(['error' => 'Email is already in use'], Response::HTTP_BAD_REQUEST);
        }

        // Crear un nou usuari
        $user = new User();
        $user->setEmail($data['email']);
        $user->setName(ucwords(strtolower($data['name'] ?? '')));
        $user->setSurnames(ucwords(strtolower($data['surnames'] ?? '')));        
        $user->setRoles(['ROLE_USER']);

        // Hashear la contrasenya abans d'emmagatzemar-la a la base de dades
        $hashedPassword = $userPasswordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        $entityManager->persist($user);
        $entityManager->flush();

        // Crear una imatge de perfil per a l'usuari
        $image = new Image();
        $image->setIsProfileMain(true);
        $image->setUser($user);
        
        // Generem un nom de fitxer únic per a cada usuari
        $uniqueFilename = uniqid() . '.png';
        $targetPath = 'uploads/' . $uniqueFilename;
        
        // Copiem físicament l'arxiu de la imatge predeterminada al directori d'uploads
        $filesystem = new Filesystem();
        $projectDir = $this->getParameter('kernel.project_dir');
        $sourcePath = $projectDir . '/public/images/sin_perfil.png';
        $targetFullPath = $projectDir . '/public/' . $targetPath;
        
        // Assegurem que la carpeta uploads existeix
        $uploadsDir = $projectDir . '/public/uploads';
        if (!file_exists($uploadsDir)) {
            $filesystem->mkdir($uploadsDir);
        }
        
        // Copiem l'arxiu
        $filesystem->copy($sourcePath, $targetFullPath);
        
        // Guardem la nova ruta a la base de dades
        $image->setPath($targetPath);

        $entityManager->persist($image);
        $entityManager->flush();

        return new JsonResponse(['message' => 'User registered successfully'], Response::HTTP_CREATED);
    }
}

?>