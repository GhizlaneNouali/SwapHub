<?php

namespace App\Entity;

use App\Repository\ExchangeRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ExchangeRepository::class)]
class Exchange
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'requestedExchanges')]
    private ?User $requester = null;

    #[ORM\ManyToOne(inversedBy: 'ownedExchanges')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $owner = null;

    #[ORM\ManyToOne(inversedBy: 'requestedInExchanges')]
    private ?Item $requestedItem = null;

    #[ORM\ManyToOne(inversedBy: 'offeredInExchanges')]
    private ?Item $offeredItem = null;

    #[ORM\Column(length: 20)]
    #[Assert\Choice(choices: ['pending', 'accepted', 'rejected'])]
    private ?string $status = null;    
    
    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $createdAt = null;
    
    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $message = null;


    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->status = 'pending';  
    }
    
    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(?\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }
    
    public function updateTimestamp(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }
    public function getMessage(): ?string
    {
        return $this->message;
    }

    public function setMessage(?string $message): static
    {
        $this->message = $message;
        return $this;
    }
    public function getRequester(): ?User
    {
        return $this->requester;
    }

    public function setRequester(?User $requester): self
    {
        $this->requester = $requester;
        return $this;
    }
    public function getOwner(): ?User
    {
        return $this->owner;
    }

    public function setOwner(?User $owner): self
    {
        $this->owner = $owner;
        return $this;
    }
    public function getRequestedItem(): ?Item
    {
        return $this->requestedItem;
    }

    public function setRequestedItem(?Item $requestedItem): self
    {
        $this->requestedItem = $requestedItem;
        return $this;
    }
    public function getOfferedItem(): ?Item
    {
        return $this->offeredItem;
    }

    public function setOfferedItem(?Item $offeredItem): self
    {
        $this->offeredItem = $offeredItem;
        return $this;
    }
    public function getId(): ?int
    {
        return $this->id;
    }
    public function setId(int $id): self
    {
        $this->id = $id;
        return $this;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): self
    {
        $this->status = $status;

        return $this;
    }
}