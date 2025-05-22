<?php
namespace App\Controller;
use App\Entity\Exchange;
use App\Entity\Item;
use App\Entity\Notification;
use App\Repository\ExchangeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;

#[Route('/api/exchange')]
class ExchangeController extends AbstractController
{
    private SerializerInterface $serializer;
    
    public function __construct(SerializerInterface $serializer)
    {
        $this->serializer = $serializer;
    }

    // Ruta per crear un nou intercanvi (POST)
    #[Route('/new', name: 'app_exchange_new', methods: ['POST'])]
    public function new(Request $request, EntityManagerInterface $entityManager, ExchangeRepository $exchangeRepository): JsonResponse
    {

        $user = $this->getUser();
        // Comprovar si l'usuari està autenticat
        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], JsonResponse::HTTP_UNAUTHORIZED);
        }
        
        $data = json_decode($request->getContent(), true);
        $requestedItemId = $data['requestedItemId'] ?? null;
        $offeredItemId = $data['offeredItemId'] ?? null;   
        $message = $data['message'] ?? null;
        
        // Comprovar que es proporcionen els elements requerits per l'intercanvi
        if (!$requestedItemId || !$offeredItemId) {
            return $this->json(['error' => 'Both requested and offered items are required.'], JsonResponse::HTTP_BAD_REQUEST);
        }
        
        // Cercar els elements oferts i sol·licitats a la base de dades
        $requestedItem = $entityManager->getRepository(Item::class)->find($requestedItemId);
        $offeredItem = $entityManager->getRepository(Item::class)->find($offeredItemId);
        
        if (!$requestedItem || !$offeredItem) {
            return $this->json(['error' => 'Requested or offered item not found.'], JsonResponse::HTTP_NOT_FOUND);
        }
        
        // Comprovar si ja existeix un intercanvi similar pendent o rebutjat
        $existingExchange = $exchangeRepository->findOneBy([
            'requester' => $user,
            'requestedItem' => $requestedItem,
            'offeredItem' => $offeredItem,
            'status' => ['pending', 'rejected']
        ]);
        
        if ($existingExchange) {
            $status = $existingExchange->getStatus();
            $errorMessage = $status === 'pending'
                ? 'You have already submitted a request for this item with the same object offered.'
                : 'This exchange offer has already been rejected. Please try with a different item.';
                
            return $this->json(['error' => $errorMessage], JsonResponse::HTTP_CONFLICT);
        }

        // Crear el nou intercanvi
        $exchange = new Exchange();
        $exchange->setRequester($user);
        $exchange->setOwner($requestedItem->getOwner());
        $exchange->setRequestedItem($requestedItem);
        $exchange->setOfferedItem($offeredItem);
        $exchange->setMessage($message);
        
        // Afegir l'intercanvi a les relacions dels usuaris i elements
        $user->addRequestedExchange($exchange);
        $requestedItem->getOwner()->addOwnedExchange($exchange);
        
        $entityManager->persist($exchange);
        $entityManager->flush();

        // Crear notificació per al propietari de l'element sol·licitat
        $notification = new Notification();
        $notification->setUser($requestedItem->getOwner()); 
        $notification->setMessage("You have received a new exchange request for your item: " . $requestedItem->getTitle());
        $notification->setCreatedAt(new \DateTimeImmutable());

        // Afegir la notificació a l'usuari
        $requestedItem->getOwner()->addNotification($notification);
        
        $entityManager->persist($notification);
        $entityManager->flush();
        
        return $this->json([
            'message' => 'Exchange request sent successfully',
            'exchange' => $this->serializeExchange($exchange)
        ], JsonResponse::HTTP_CREATED);
    }
    
    // Ruta per obtenir els intercanvis de l'usuari (GET)
    #[Route('/my', name: 'app_exchange_my', methods: ['GET'])]
    public function getMyExchanges(EntityManagerInterface $entityManager): JsonResponse
    {
        $user = $this->getUser();
        // Comprovar si l'usuari està autenticat
        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        // Cercar intercanvis enviats i rebuts per l'usuari
        $exchangeRepository = $entityManager->getRepository(Exchange::class);
        
        $sentExchanges = $exchangeRepository->findBy(['requester' => $user], ['createdAt' => 'DESC']);
        $receivedExchanges = $exchangeRepository->findBy(['owner' => $user], ['createdAt' => 'DESC']);
    
        // Serialitzar els intercanvis per a la resposta
        $result = [
            'sent' => array_map([$this, 'serializeExchange'], $sentExchanges),
            'received' => array_map([$this, 'serializeExchange'], $receivedExchanges)
        ];
    
        return $this->json($result);
    }
    
    // Ruta per acceptar un intercanvi (POST)
    #[Route('/{id}/accept', name: 'app_exchange_accept', methods: ['POST'])]
    public function acceptExchange(int $id, EntityManagerInterface $entityManager, ExchangeRepository $exchangeRepository): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        // Cercar l'intercanvi per ID
        $exchange = $exchangeRepository->find($id);
        if (!$exchange) {
            return $this->json(['error' => 'Exchange not found.'], JsonResponse::HTTP_NOT_FOUND);
        }
    
        // Comprovar si l'usuari és el propietari de l'intercanvi
        if ($exchange->getOwner() !== $user) {
            return $this->json(['error' => 'You are not the owner of this exchange.'], JsonResponse::HTTP_FORBIDDEN);
        }

        // Rebutjar altres intercanvis pendents per l'element sol·licitat
        $requestedItem = $exchange->getRequestedItem();
        $otherPendingExchanges = $requestedItem->getRequestedInExchanges()->filter(function($e) use ($exchange) {
            return $e->getId() !== $exchange->getId() && $e->getStatus() === 'pending';
        });
        
        foreach ($otherPendingExchanges as $pendingExchange) {
            $pendingExchange->setStatus('rejected');
            
            // Crear notificació de rebuig
            $rejectNotification = new Notification();
            $rejectNotification->setUser($pendingExchange->getRequester());
            $rejectNotification->setMessage("Your exchange request has been rejected because another offer was accepted.");
            $rejectNotification->setCreatedAt(new \DateTimeImmutable());
            
            $pendingExchange->getRequester()->addNotification($rejectNotification);
            $entityManager->persist($rejectNotification);
        }

        // Acceptar l'intercanvi
        $exchange->setStatus('accepted');
        $exchange->updateTimestamp();
        
        // Crear notificació d'acceptació
        $notification = new Notification();
        $notification->setUser($exchange->getRequester());
        $notification->setMessage("Your exchange request for \"" . $exchange->getRequestedItem()->getTitle() . "\" has been accepted!");
        $notification->setCreatedAt(new \DateTimeImmutable());
        
        $exchange->getRequester()->addNotification($notification);
        $entityManager->persist($notification);
        
        $entityManager->flush();
        
        return $this->json([
            'message' => 'Exchange accepted successfully.',
            'exchange' => $this->serializeExchange($exchange)
        ]);
    }
    
    // Ruta per rebutjar un intercanvi (POST)
    #[Route('/{id}/reject', name: 'app_exchange_reject', methods: ['POST'])]
    public function rejectExchange(int $id, EntityManagerInterface $entityManager, ExchangeRepository $exchangeRepository): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], JsonResponse::HTTP_UNAUTHORIZED);
        }
     
        // Cercar l'intercanvi per ID
        $exchange = $exchangeRepository->find($id);
        if (!$exchange) {
            return $this->json(['error' => 'Exchange not found.'], JsonResponse::HTTP_NOT_FOUND);
        }
        
        // Comprovar si l'usuari és el propietari de l'intercanvi
        if ($exchange->getOwner() !== $user) {
            return $this->json(['error' => 'You are not the owner of this exchange.'], JsonResponse::HTTP_FORBIDDEN);
        }
        
        // Rebutjar l'intercanvi
        $exchange->setStatus('rejected');
        $exchange->updateTimestamp();
        
        // Crear notificació de rebuig
        $notification = new Notification();
        $notification->setUser($exchange->getRequester());
        $notification->setMessage("Your exchange request for \"" . $exchange->getRequestedItem()->getTitle() . "\" has been rejected.");
        $notification->setCreatedAt(new \DateTimeImmutable());
        
        $exchange->getRequester()->addNotification($notification);
        $entityManager->persist($notification);
        
        $entityManager->flush();
        
        return $this->json([
            'message' => 'Exchange rejected successfully.',
            'exchange' => $this->serializeExchange($exchange)
        ]);
    }
    

    // Mètode auxiliar per serialitzar un intercanvi de manera consistent
    private function serializeExchange(Exchange $exchange): array
    {
        return [
            'id' => $exchange->getId(),
            'requester' => [
                'id' => $exchange->getRequester()->getId(),
                'name' => $exchange->getRequester()->getName(),
                'email' => $exchange->getRequester()->getUserIdentifier()
            ],
            'owner' => [
                'id' => $exchange->getOwner()->getId(),
                'name' => $exchange->getOwner()->getName(),
                'email' => $exchange->getOwner()->getUserIdentifier()
            ],
            'requestedItem' => [
                'id' => $exchange->getRequestedItem()->getId(),
                'title' => $exchange->getRequestedItem()->getTitle(),
                'category' => $exchange->getRequestedItem()->getCategory(),
                'mainImage' => $exchange->getRequestedItem()->getMainImage() ? 
                    $exchange->getRequestedItem()->getMainImage()->getPath() : null
            ],
            'offeredItem' => [
                'id' => $exchange->getOfferedItem()->getId(),
                'title' => $exchange->getOfferedItem()->getTitle(),
                'category' => $exchange->getOfferedItem()->getCategory(),
                'mainImage' => $exchange->getOfferedItem()->getMainImage() ? 
                    $exchange->getOfferedItem()->getMainImage()->getPath() : null
            ],
            'message' => $exchange->getMessage(),
            'status' => $exchange->getStatus(),
            'createdAt' => $exchange->getCreatedAt() ? 
                $exchange->getCreatedAt()->format('Y-m-d\TH:i:s') : null,
            'updatedAt' => $exchange->getUpdatedAt() ? 
                $exchange->getUpdatedAt()->format('Y-m-d\TH:i:s') : null
        ];
    }
}