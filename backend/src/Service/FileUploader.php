<?php

namespace App\Service;

use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;

class FileUploader
{
    private string $targetDirectory;
    private Filesystem $filesystem;

    public function __construct(string $targetDirectory)
    {
        $this->targetDirectory = $targetDirectory;
        $this->filesystem = new Filesystem();
        
        // Assegurar-se que el directori existeix
        if (!$this->filesystem->exists($this->targetDirectory)) {
            $this->filesystem->mkdir($this->targetDirectory);
        }
    }
    public function upload(UploadedFile $file): string
    {
        // Generar un nom únic per al fitxer
        $fileName = uniqid() . '.' . $file->guessExtension();
        
        try {
            // Moure el fitxer a la ubicació definitiva
            $file->move($this->getTargetDirectory(), $fileName);
            
            // Retornar la ruta relativa (per guardar-la a la base de dades)
            return 'uploads/' . $fileName;
        } catch (IOExceptionInterface $exception) {
            throw new \RuntimeException("Failed to upload the file: " . $exception->getMessage());
        }
    }
    
    public function remove(string $path): bool
    {
        if ($this->filesystem->exists($path)) {
            try {
                $this->filesystem->remove($path);
                return true;
            } catch (IOExceptionInterface $exception) {
                throw new \RuntimeException("Failed to delete the file: " . $exception->getMessage());
            }
        }
        
        return false;
    }

    public function getTargetDirectory(): string
    {
        return $this->targetDirectory;
    }
}