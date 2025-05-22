<?php

namespace App\Entity;

use App\Repository\ItemRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\MaxDepth;

#[ORM\Entity(repositoryClass: ItemRepository::class)]
class Item
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private ?string $title = null;

    #[ORM\Column(length: 255)]
    private ?string $description = null;

    #[ORM\Column(length: 50)]
    private ?string $category = null;

    #[ORM\ManyToOne(inversedBy: 'items')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['item:read'])]
    #[MaxDepth(1)] 
    private ?User $owner = null;

    /**
     * @var Collection<int, Exchange>
     */
    #[ORM\OneToMany(targetEntity: Exchange::class, mappedBy: 'requestedItem', cascade: ['remove'])]
    private Collection $requestedInExchanges;

    /**
     * @var Collection<int, Exchange>
     */
    #[ORM\OneToMany(targetEntity: Exchange::class, mappedBy: 'offeredItem', cascade: ['remove'])]
    private Collection $offeredInExchanges;

    /**
     * @var Collection<int, Image>
     */
    #[ORM\OneToMany(targetEntity: Image::class, mappedBy: 'item', orphanRemoval: true)]
    #[Groups(['item:read'])]
    #[MaxDepth(1)] 
    private Collection $images;

    public function __construct()
    {
        $this->requestedInExchanges = new ArrayCollection();
        $this->offeredInExchanges = new ArrayCollection();
        $this->images = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }
    
    public function setTitle(string $title): self
    {
        $this->title = $title;
        return $this;
    }
    
    public function getDescription(): ?string
    {
        return $this->description;
    }
    
    public function setDescription(string $description): self
    {
        $this->description = $description;
        return $this;
    }
    
    public function getCategory(): ?string
    {
        return $this->category;
    }
    
    public function setCategory(string $category): self
    {
        $this->category = $category;
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

    

    /**
     * @return Collection<int, Image>
     */
    public function getImages(): Collection
    {
        return $this->images;
    }

    public function addImage(Image $image): static
    {
        if (!$this->images->contains($image)) {
            $this->images->add($image);
            $image->setItem($this);
        }

        return $this;
    }

    public function removeImage(Image $image): static
    {
        if ($this->images->removeElement($image)) {
            if ($image->getItem() === $this) {
                $image->setItem(null);
            }
        }

        return $this;
    }
    
    public function getMainImage(): ?Image
    {
        return $this->images->isEmpty() ? null : $this->images->first();
    }
    public function getRequestedInExchanges(): Collection
    {
        return $this->requestedInExchanges;
    }

    public function addRequestedInExchange(Exchange $exchange): self
    {
        if (!$this->requestedInExchanges->contains($exchange)) {
            $this->requestedInExchanges[] = $exchange;
            $exchange->setRequestedItem($this);
        }

        return $this;
    }

    public function removeRequestedInExchange(Exchange $exchange): self
    {
        if ($this->requestedInExchanges->removeElement($exchange)) {
            if ($exchange->getRequestedItem() === $this) {
                $exchange->setRequestedItem(null);
            }
        }

        return $this;
    }
    public function getOfferedInExchanges(): Collection
    {
        return $this->offeredInExchanges;
    }

    public function addOfferedInExchange(Exchange $exchange): self
    {
        if (!$this->offeredInExchanges->contains($exchange)) {
            $this->offeredInExchanges[] = $exchange;
            $exchange->setOfferedItem($this);
        }

        return $this;
    }

    public function removeOfferedInExchange(Exchange $exchange): self
    {
        if ($this->offeredInExchanges->removeElement($exchange)) {
            if ($exchange->getOfferedItem() === $this) {
                $exchange->setOfferedItem(null);
            }
        }

        return $this;
    }


}