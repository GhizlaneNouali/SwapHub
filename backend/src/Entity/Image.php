<?php

namespace App\Entity;

use App\Repository\ImageRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\MaxDepth;

#[ORM\Entity(repositoryClass: ImageRepository::class)]
class Image
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $path = null;


    #[ORM\ManyToOne(inversedBy: 'images')]
    #[Groups(['item:read'])]
    private ?Item $item = null;
    
    #[ORM\ManyToOne(inversedBy: 'profileImages')]
    #[Groups(['user:read'])]
    #[MaxDepth(1)]
    private ?User $user = null;
    
    #[ORM\Column(options: ["default" => false])]
    private bool $isProfileMain = false;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPath(): ?string
    {
        return $this->path;
    }

    public function setPath(string $path): static
    {
        $this->path = $path;
        return $this;
    }

    public function getItem(): ?Item
    {
        return $this->item;
    }

    public function setItem(?Item $item): static
    {
        $this->item = $item;
        return $this;
    }
    
    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        if ($this->isProfileMain()) {
            $this->user = $user;
        } else {
            $this->user = null; 
        }
        return $this;
    }
    
    public function isProfileMain(): bool
    {
        return $this->isProfileMain;
    }

    public function setIsProfileMain(bool $isProfileMain): static
    {
        $this->isProfileMain = $isProfileMain;
        return $this;
    }
}