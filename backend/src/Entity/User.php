<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\MaxDepth;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    #[Groups(['user:read', 'user:write','item:read'])]
    private ?string $email = null;

    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    private array $roles = [];

    /**
     * @var string The hashed password
     */
    #[ORM\Column]
    private ?string $password = null;

    #[ORM\Column(length: 20)]
    #[Groups(['user:read', 'user:write'])]
    private ?string $name = null;

    #[ORM\Column(length: 30)]
    private ?string $surnames = null;

    /**
     * @var Collection<int, Item>
     */
    #[ORM\OneToMany(targetEntity: Item::class, mappedBy: 'owner')]
    #[Groups(['user:read'])]
    #[MaxDepth(1)]
    private Collection $items;
    
    /**
     * @var Collection<int, Image>
     */
    #[ORM\OneToMany(targetEntity: Image::class, mappedBy: 'user', orphanRemoval: true)]
    #[Groups(['user:read'])]
    #[MaxDepth(1)]
    private Collection $profileImages;
    
    /**
     * @var Collection<int, Exchange>
     */
    #[ORM\OneToMany(targetEntity: Exchange::class, mappedBy: 'requester')]
    private Collection $requestedExchanges;
    
    /**
     * @var Collection<int, Exchange>
     */
    #[ORM\OneToMany(targetEntity: Exchange::class, mappedBy: 'owner')]
    private Collection $ownedExchanges;

    /**
     * @var Collection<int, Notification>
     */
    #[ORM\OneToMany(targetEntity: Notification::class, mappedBy: 'user', orphanRemoval: true)]
    private Collection $notifications;

    public function __construct()
    {
        $this->items = new ArrayCollection();
        $this->profileImages = new ArrayCollection();
        $this->requestedExchanges = new ArrayCollection();
        $this->ownedExchanges = new ArrayCollection();
        $this->notifications = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUserIdentifier(): string
    {
        return $this->email ?? '';
    }
    
    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = 'ROLE_USER'; 
        return array_unique($roles);
    }
    public function setRoles(array $roles): self
    {
        $this->roles = $roles;
        return $this;
    }


    public function eraseCredentials(): void
    {
        // $this->plainPassword = null;
    }
    
    public function getPassword(): ?string
    {
        return $this->password;
    }
    public function setPassword(string $password): self
    {
        $this->password = $password;
        return $this;
    }

    
    /**
     * @return Collection<int, Item>
     */
    public function getItems(): Collection
    {
        return $this->items;
    }

    public function addItem(Item $item): static
    {
        if (!$this->items->contains($item)) {
            $this->items->add($item);
            $item->setOwner($this);
        }

        return $this;
    }

    public function removeItem(Item $item): static
    {
        if ($this->items->removeElement($item)) {
            if ($item->getOwner() === $this) {
                $item->setOwner(null);
            }
        }

        return $this;
    }
    
    /**
     * @return Collection<int, Image>
     */
    public function getProfileImages(): Collection
    {
        return $this->profileImages;
    }
    
    public function addProfileImage(Image $image): static
    {
        if (!$this->profileImages->contains($image)) {
            $this->profileImages->add($image);
            $image->setUser($this);
        }
        
        return $this;
    }
    
    public function removeProfileImage(Image $image): static
    {
        if ($this->profileImages->removeElement($image)) {
            if ($image->getUser() === $this) {
                $image->setUser(null);
            }
        }
        
        return $this;
    }
    
    public function getMainProfileImage(): ?Image
    {
        foreach ($this->profileImages as $image) {
            if ($image->isProfileMain()) {
                return $image;
            }
        }
        
        return $this->profileImages->isEmpty() ? null : $this->profileImages->first();
    }
    
    /**
     * @return Collection<int, Exchange>
     */
    public function getRequestedExchanges(): Collection
    {
        return $this->requestedExchanges;
    }
    
    public function addRequestedExchange(Exchange $exchange): static
    {
        if (!$this->requestedExchanges->contains($exchange)) {
            $this->requestedExchanges->add($exchange);
            $exchange->setRequester($this);
        }
        
        return $this;
    }
    
    public function removeRequestedExchange(Exchange $exchange): static
    {
        if ($this->requestedExchanges->removeElement($exchange)) {
            if ($exchange->getRequester() === $this) {
                $exchange->setRequester(null);
            }
        }
        
        return $this;
    }
    
    /**
     * @return Collection<int, Exchange>
     */
    public function getOwnedExchanges(): Collection
    {
        return $this->ownedExchanges;
    }
    
    public function addOwnedExchange(Exchange $exchange): static
    {
        if (!$this->ownedExchanges->contains($exchange)) {
            $this->ownedExchanges->add($exchange);
            $exchange->setOwner($this);
        }
        
        return $this;
    }
    
    public function removeOwnedExchange(Exchange $exchange): static
    {
        if ($this->ownedExchanges->removeElement($exchange)) {
            if ($exchange->getOwner() === $this) {
                $exchange->setOwner(null);
            }
        }
        
        return $this;
    }

        public function setEmail(string $email): self
    {
        $this->email = $email;
        return $this;
    }
    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): self
    {
        $this->name = $name;
        return $this;
    }

    public function getSurnames(): ?string
    {
        return $this->surnames;
    }

    public function setSurnames(?string $surnames): self
    {
        $this->surnames = $surnames;
        return $this;
    }

    /**
     * @return Collection<int, Notification>
     */
    public function getNotifications(): Collection
    {
        return $this->notifications;
    }

    public function addNotification(Notification $notification): static
    {
        if (!$this->notifications->contains($notification)) {
            $this->notifications->add($notification);
            $notification->setUser($this);
        }

        return $this;
    }

    public function removeNotification(Notification $notification): static
    {
        if ($this->notifications->removeElement($notification)) {
            if ($notification->getUser() === $this) {
                $notification->setUser(null);
            }
        }

        return $this;
    }
    



}