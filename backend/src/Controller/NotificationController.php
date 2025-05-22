<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use App\Repository\NotificationRepository;

#[Route('/api/notification')]
final class NotificationController extends AbstractController
{

    // Ruta per obtenir les notificacions de l'usuari actual (GET)
    #[Route('/notifications', name: 'app_notification', methods: ['GET'])]
    public function getNotifications(NotificationRepository $notificationRepository): JsonResponse
    {
        // Obtenir l'usuari actual que està autenticat
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        // Obtenir les notificacions de l'usuari actual, ordenades per la data de creació (de més nova a més antiga)
        $notifications = $notificationRepository->findBy(
            ['user' => $user],
            ['createdAt' => 'DESC']
        );

        $data = array_map(function ($notification) {
            return [
                'id' => $notification->getId(),
                'message' => $notification->getMessage(),
                'createdAt' => $notification->getCreatedAt()->format('Y-m-d H:i:s'),
            ];
        }, $notifications);

        return $this->json($data);
    }
}