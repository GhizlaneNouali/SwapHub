<?php

namespace App\Repository;

use App\Entity\Item;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Item>
 */
class ItemRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Item::class);
    }
    
    // Retorna els ítems que pertanyen a una categoria determinada, excloent opcionalment un ítem amb un ID concret.
    public function findByCategoryExcludingId(string $category, ?int $excludeId = null): array
    {
        $qb = $this->createQueryBuilder('i')
            ->where('i.category = :category')
            ->setParameter('category', $category);
        
        if ($excludeId !== null) {
            $qb->andWhere('i.id != :excludeId')
            ->setParameter('excludeId', $excludeId);
        }
        
        return $qb->getQuery()->getResult();
    }

    // Retorna els ítems disponibles per a un usuari (que no són seus i que no estan implicats en un intercanvi acceptat).
    public function findAvailableItemsForUser($user)
    {
        $qb = $this->createQueryBuilder('i')
            ->leftJoin('i.owner', 'o')
            ->leftJoin('App\Entity\Exchange', 'e', 'WITH', 'e.requestedItem = i OR e.offeredItem = i')
            ->where('o.id != :currentUserId')
            ->andWhere('e.status != :accepted OR e.status IS NULL')
            ->setParameter('currentUserId', $user->getId())
            ->setParameter('accepted', 'accepted');    
        return $qb->getQuery()->getResult();
    }
}
