<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Bundle\SecurityBundle\Security;


final class ApiController extends AbstractController{
    #[Route('/api/test', name: 'api_test', methods: ['GET'])]
    public function test(UserInterface $user): JsonResponse
    {
        return $this->json([
            'message' => 'Autenticación exitosa',
            'user' => $user->getUserIdentifier(),

        ]);
    }

    #[Route('/api/protected', name: 'api_protected', methods: ['GET'])]
    public function protectedAction(Security $security): JsonResponse
    {
        $user = $security->getUser();
        
        return $this->json([
            'message' => '¡Autenticación correcta!',
            'user' => $user->getUserIdentifier(),
            'roles' => $user->getRoles(),
        ]);
    }
}
