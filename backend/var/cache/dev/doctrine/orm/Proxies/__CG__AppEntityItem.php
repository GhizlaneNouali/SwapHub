<?php

namespace Proxies\__CG__\App\Entity;

/**
 * DO NOT EDIT THIS FILE - IT WAS CREATED BY DOCTRINE'S PROXY GENERATOR
 */
class Item extends \App\Entity\Item implements \Doctrine\ORM\Proxy\InternalProxy
{
    use \Symfony\Component\VarExporter\LazyGhostTrait {
        initializeLazyObject as private;
        setLazyObjectAsInitialized as public __setInitialized;
        isLazyObjectInitialized as private;
        createLazyGhost as private;
        resetLazyObject as private;
    }

    public function __load(): void
    {
        $this->initializeLazyObject();
    }
    

    private const LAZY_OBJECT_PROPERTY_SCOPES = [
        "\0".parent::class."\0".'category' => [parent::class, 'category', null, 16],
        "\0".parent::class."\0".'description' => [parent::class, 'description', null, 16],
        "\0".parent::class."\0".'id' => [parent::class, 'id', null, 16],
        "\0".parent::class."\0".'images' => [parent::class, 'images', null, 16],
        "\0".parent::class."\0".'offeredInExchanges' => [parent::class, 'offeredInExchanges', null, 16],
        "\0".parent::class."\0".'owner' => [parent::class, 'owner', null, 16],
        "\0".parent::class."\0".'requestedInExchanges' => [parent::class, 'requestedInExchanges', null, 16],
        "\0".parent::class."\0".'title' => [parent::class, 'title', null, 16],
        'category' => [parent::class, 'category', null, 16],
        'description' => [parent::class, 'description', null, 16],
        'id' => [parent::class, 'id', null, 16],
        'images' => [parent::class, 'images', null, 16],
        'offeredInExchanges' => [parent::class, 'offeredInExchanges', null, 16],
        'owner' => [parent::class, 'owner', null, 16],
        'requestedInExchanges' => [parent::class, 'requestedInExchanges', null, 16],
        'title' => [parent::class, 'title', null, 16],
    ];

    public function __isInitialized(): bool
    {
        return isset($this->lazyObjectState) && $this->isLazyObjectInitialized();
    }

    public function __serialize(): array
    {
        $properties = (array) $this;
        unset($properties["\0" . self::class . "\0lazyObjectState"]);

        return $properties;
    }
}
